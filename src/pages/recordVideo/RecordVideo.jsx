import {
  Button,
  Skeleton,
  Tabs,
  TextInput,
  Group,
  ActionIcon,
  Select,
  Menu,
} from "@mantine/core";
import { HiEye, HiChartBar } from "react-icons/hi2";
import { HiViewGrid, HiViewList } from "react-icons/hi";
import { LuLayoutGrid } from "react-icons/lu";
import { PiListBold } from "react-icons/pi";
import { BsThreeDotsVertical } from "react-icons/bs";

import {
  COPY_ICON,
  DELETE_ICON,
  EDIT_ICON,
  SHARE_ICON,
} from "../../assets/icons/DynamicIcons";
import copy from "copy-to-clipboard";

import { useNavigate } from "react-router-dom";
import {
  HistoryTableList,
  HistoryTabSection,
  LibraryBody,
  LibraryHeader,
  LibraryRoot,
  UploadedVideoTabItem,
  VideoTabItem,
  VideoTabItemsList,
  VideoTabSection,
} from "../../components/ui/LibraryComponents";
import { useGlobalModals } from "../../store/globalModals";
import { useEffect, useState } from "react";
import { useLoadingBackdrop } from "../../store/loadingBackdrop";
import { useUserStore } from "../../store/userStore";
import { useParams } from "react-router-dom";
import { getHistoryOfMessages } from "../../api/commsAPIs";
import { getAllVideos, getUserDomain } from "../../api/libraryAPIs";
import { useQuery } from "@tanstack/react-query";
import { VideoPlayer } from "../../components/ui/VideoPlayer";
import { SiSimpleanalytics } from "react-icons/si";
import { IoShareSocial } from "react-icons/io5";
import { MdAnalytics } from "react-icons/md";

// Helper function to get time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30)
    return `${Math.floor(diffInDays / 7)} week${
      Math.floor(diffInDays / 7) > 1 ? "s" : ""
    } ago`;
  if (diffInDays < 365)
    return `${Math.floor(diffInDays / 30)} month${
      Math.floor(diffInDays / 30) > 1 ? "s" : ""
    } ago`;
  return `${Math.floor(diffInDays / 365)} year${
    Math.floor(diffInDays / 365) > 1 ? "s" : ""
  } ago`;
};

const RecordVideo = () => {
  const videosData = useUserStore((state) => state.videosData);
  const setVideosData = useUserStore((state) => state.setVideosData);

  // Pagination states
  // Using an object to manage pagination for both recorded and uploaded videos ===
  const [currentPage, setCurrentPage] = useState({
    recorded: 1,
    uploaded: 1,
  });
  const [totalPages, setTotalPages] = useState({
    recorded: 1,
    uploaded: 1,
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState({
    recorded: false,
    uploaded: false,
  });

  const { accessToken } = useParams();
  const setIsNewRecordingModalOpen = useGlobalModals(
    (state) => state.setIsNewRecordingModalOpen
  );
  const setUpdateDomainModalOpen = useGlobalModals(
    (state) => state.setUpdateDomainModalOpen
  );

  const setUserDomain = useUserStore((state) => state.setUserDomain);
  const setLoading = useLoadingBackdrop((state) => state.setLoading);
  const [activeTab, setActiveTab] = useState("videos");
  const [searchQuery, setSearchQuery] = useState("");
  const videoViewMode = useUserStore((state) => state.videoViewMode);
  const setVideoViewMode = useUserStore((state) => state.setVideoViewMode);
  const [sortBy, setSortBy] = useState("recent");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const navigate = useNavigate();

  const setIsDeleteVideoModalOpen = useGlobalModals(
    (state) => state.setIsDeleteVideoModalOpen
  );
  const setIsEditVideoModalOpen = useGlobalModals(
    (state) => state.setIsEditVideoModalOpen
  );
  const setIsShareVideoModalOpen = useGlobalModals(
    (state) => state.setIsShareVideoModalOpen
  );
  const setVideoToBeDeleted = useGlobalModals(
    (state) => state.setVideoToBeDeleted
  );
  const setVideoToBeShared = useGlobalModals(
    (state) => state.setVideoToBeShared
  );
  const setVideoToBeEdited = useGlobalModals(
    (state) => state.setVideoToBeEdited
  );

  // Helper function to check if video uses new schema
  const isNewSchema = (video) => !!video?.videoKey;

  // Handle video click based on schema
  const handleVideoClick = (video) => {
    if (isNewSchema(video)) {
      setSelectedVideo(video);
      setShowVideoPlayer(true);
    } else {
      // Old schema - open in new tab
      if (video?.shareableLink) {
        window.open(video.shareableLink, "_blank");
      }
    }
  };

  // Fetch all data including videos
  // Page and type added to fetch accordingly on view more buttons ============
  const fetchData = async (token, page = 1, type = "") => {
    const [videosResponse] = await Promise.all([getAllVideos(token, page, 10)]);

    const newRecorded = videosResponse.recordedVideos || [];
    const newUploaded = videosResponse.uploadedVideos || [];

    if (page === 1) {
      setVideosData(
        (prev) =>
          prev || {
            recordedVideos: [],
            uploadedVideos: [],
          }
      );
      setVideosData({
        recordedVideos: newRecorded,
        uploadedVideos: newUploaded,
      });
      setIsLoading(false);
    } else if (type === "recorded") {
      const updatedRecordedVideos = [
        ...(videosData?.recordedVideos || []), // Get current from store
        ...newRecorded, // Add new videos
      ];

      setVideosData({
        ...videosData, // Keep other properties
        recordedVideos: updatedRecordedVideos, // Update recorded videos
      });
    } else {
      const updatedUploadedVideos = [
        ...(videosData?.uploadedVideos || []), // Get current from store
        ...newUploaded, // Add new videos
      ];

      setVideosData({
        ...videosData, // Keep other properties
        uploadedVideos: updatedUploadedVideos, // Update uploaded videos
      });
    }

    setTotalPages({
      recorded: videosResponse.pagination?.recorded.totalPages || 1,
      uploaded: videosResponse.pagination?.uploaded.totalPages || 1,
    });
  };

  const fetchUserDomain = async () => {
    try {
      const response = await getUserDomain(accessToken);

      if (response) {
        setUserDomain(response.userDomain || "");
        if (response.userDomain === "" && response.showDomainPopup) {
          setUpdateDomainModalOpen(true);
        }
      }
    } catch (error) {
      console.error("Error fetching user domain:", error);
    }
  };

  // React Query for history data
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useQuery({
    queryKey: ["history", accessToken],
    queryFn: () => getHistoryOfMessages(accessToken),
    enabled: activeTab === "history",
  });

  // Load more videos for a specific type
  // This function will be called when the user clicks on "View More" button ==========
  const loadMoreVideos = async (type) => {
    const nextPage = currentPage[type] + 1;

    if (nextPage <= totalPages[type]) {
      setIsLoadingMore((prev) => ({ ...prev, [type]: true }));
      await fetchData(accessToken, nextPage, type);
      setIsLoadingMore((prev) => ({ ...prev, [type]: false }));
      setCurrentPage((prev) => ({ ...prev, [type]: nextPage }));
    }
  };

  // Initial data fetch
  // useffects changed by suggestion =============================
  useEffect(() => {
    setIsNewRecordingModalOpen(true);

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      setLoading(false);
      setIsLoading(true);
      fetchData(accessToken);
      fetchUserDomain();
    }
  }, [accessToken, setIsNewRecordingModalOpen]);

  // Filter and sort videos based on search query and sort option
  const filterAndSortVideos = (videos) => {
    let filteredVideos = videos;

    // Filter by search query
    if (searchQuery) {
      filteredVideos = videos?.filter(
        (video) =>
          video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort videos
    if (filteredVideos) {
      return [...filteredVideos].sort((a, b) => {
        switch (sortBy) {
          case "recent":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "oldest":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "mostViewed":
            return (b.viewCount || 0) - (a.viewCount || 0);
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
    }

    return filteredVideos;
  };

  return (
    <LibraryRoot>
      <LibraryHeader title="My Library" />
      <LibraryBody>
        <Tabs
          color="#2A85FF"
          value={activeTab}
          onChange={(value) => setActiveTab(value)}
        >
          <Tabs.List>
            <Tabs.Tab value="videos">Videos</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="videos">
            <div className="text-center mt-6 mb-6">
              <h2 className="text-xl font-medium text-black">
                Manage and share your recorded videos
              </h2>
            </div>
            <div className="mt-6 mb-6 p-3 border border-gray-200 rounded-lg shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 w-full">
                  <TextInput
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-auto sm:min-w-[350px] sm:max-w-[400px]"
                  />
                  <Select
                    placeholder="Sort by"
                    value={sortBy}
                    onChange={setSortBy}
                    data={[
                      { value: "recent", label: "Most Recent" },
                      { value: "oldest", label: "Oldest" },
                      { value: "mostViewed", label: "Most Viewed" },
                    ]}
                    className="w-full sm:w-auto sm:min-w-[150px]"
                  />
                </div>
                <Group
                  spacing="xs"
                  className="w-full sm:w-auto justify-center sm:justify-end"
                >
                  <button
                    onClick={() => setVideoViewMode("grid")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                      videoViewMode === "grid"
                        ? "bg-gradient-blue text-white border-transparent"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <HiViewGrid size={16} /> Grid
                  </button>
                  <button
                    onClick={() => setVideoViewMode("list")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                      videoViewMode === "list"
                        ? "bg-gradient-blue text-white border-transparent"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <HiViewList size={16} /> List
                  </button>
                </Group>
              </div>
            </div>
            <VideoTabSection heading="Recorded Videos">
              {isLoading ? (
                videoViewMode === "grid" ? (
                  <VideoTabItemsList>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="!rounded-lg !min-w-[250px] !h-[280px]"
                      />
                    ))}
                  </VideoTabItemsList>
                ) : (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="!rounded-lg !w-full !h-[80px]"
                      />
                    ))}
                  </div>
                )
              ) : filterAndSortVideos(videosData?.recordedVideos)?.length >
                0 ? (
                <>
                  {videoViewMode === "grid" ? (
                    <VideoTabItemsList>
                      {filterAndSortVideos(videosData?.recordedVideos)?.map(
                        (video) => (
                          <VideoTabItem key={video._id} videoData={video} />
                        )
                      )}
                    </VideoTabItemsList>
                  ) : (
                    <div className="space-y-2">
                      {filterAndSortVideos(videosData?.recordedVideos)?.map(
                        (video) => (
                          <div
                            key={video._id}
                            className="flex items-center p-3 border rounded-lg bg-white hover:bg-gray-50"
                          >
                            <div
                              className="w-20 h-14 bg-black rounded mr-3 flex-shrink-0 relative overflow-hidden cursor-pointer"
                              onClick={() => handleVideoClick(video)}
                            >
                              {isNewSchema(video) && video?.thumbnailKey ? (
                                <img
                                  src={`https://d27zhkbo74exx9.cloudfront.net/${video.thumbnailKey}`}
                                  alt="Video thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              ) : video?.embeddedLink && !isNewSchema(video) ? (
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={video.embeddedLink}
                                  className="pointer-events-none"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                  <span className="text-white text-xs">▶</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                <span className="text-white text-lg">▶</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {video.title || video.name}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{getTimeAgo(video.createdAt)}</span>
                                {isNewSchema(video) && (
                                  <div className="flex items-center gap-1">
                                    <HiEye size={12} />
                                    <span>{video.viewCount || 0} views</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 menu-container">
                              {isNewSchema(video) && (
                                <button
                                  className="flex items-center gap-1 px-5 py-2 text-xs font-medium rounded bg-gradient-blue text-white border-transparent transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/videoviewer/${video._id}`);
                                  }}
                                >
                                  <SiSimpleanalytics size={12} />
                                  Analytics
                                </button>
                              )}
                              <Menu
                                shadow="md"
                                width={150}
                                position="bottom-end"
                                arrowPosition="center"
                                radius={12}
                                offset={-5}
                                styles={{
                                  menu: { padding: "8px 12px !important" },
                                  itemLabel: {
                                    fontSize: "14px",
                                    fontWeight: 500,
                                  },
                                }}
                              >
                                <Menu.Target>
                                  <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    style={{ color: "black" }}
                                  >
                                    <BsThreeDotsVertical size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item>
                                    <div
                                      onClick={() => {
                                        copy(video?.shareableLink);
                                        console.log(
                                          "Shareable link:",
                                          video?.shareableLink
                                        );
                                      }}
                                      className="flex items-center gap-[8px]"
                                    >
                                      <COPY_ICON className="text-black" />
                                      <p className="text-[14px] font-medium">
                                        Copy Link
                                      </p>
                                    </div>
                                  </Menu.Item>
                                  <Menu.Item
                                    leftSection={
                                      <SHARE_ICON className="text-black" />
                                    }
                                    onClick={() => {
                                      setVideoToBeShared(video);
                                      setIsShareVideoModalOpen(true);
                                    }}
                                  >
                                    Share
                                  </Menu.Item>
                                  <Menu.Item
                                    leftSection={
                                      <EDIT_ICON className="text-black" />
                                    }
                                    onClick={() => {
                                      setVideoToBeEdited(video);
                                      setIsEditVideoModalOpen(true);
                                    }}
                                  >
                                    Edit
                                  </Menu.Item>
                                  <Menu.Item
                                    color="red"
                                    leftSection={
                                      <DELETE_ICON className="text-[#FF0000]" />
                                    }
                                    onClick={() => {
                                      setVideoToBeDeleted(video);
                                      setIsDeleteVideoModalOpen(true);
                                    }}
                                  >
                                    Delete
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {currentPage.recorded < totalPages.recorded && (
                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={() => loadMoreVideos("recorded")}
                        loading={isLoadingMore.recorded}
                        variant="outline"
                      >
                        View More Recorded Videos
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-[10px] max-w-[450px] mx-auto">
                  <p className="text-center text-gray-500 text-[16px]">
                    No Recorded videos found! Please record a new Video or Click
                    on the upload button to upload a new video.
                  </p>
                </div>
              )}
            </VideoTabSection>

            <VideoTabSection heading="Uploaded Videos">
              {isLoading ? (
                videoViewMode === "grid" ? (
                  <VideoTabItemsList>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="!rounded-lg !min-w-[250px] !h-[250px]"
                      />
                    ))}
                  </VideoTabItemsList>
                ) : (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="!rounded-lg !w-full !h-[80px]"
                      />
                    ))}
                  </div>
                )
              ) : filterAndSortVideos(videosData?.uploadedVideos)?.length >
                0 ? (
                <>
                  {videoViewMode === "grid" ? (
                    <VideoTabItemsList>
                      {filterAndSortVideos(videosData?.uploadedVideos)?.map(
                        (video, index) => (
                          <UploadedVideoTabItem key={index} videoData={video} />
                        )
                      )}
                    </VideoTabItemsList>
                  ) : (
                    <div className="space-y-2">
                      {filterAndSortVideos(videosData?.uploadedVideos)?.map(
                        (video, index) => (
                          <div
                            key={index}
                            className="flex items-center p-3 border rounded-lg bg-white hover:bg-gray-50"
                          >
                            <div
                              className="w-20 h-14 bg-black rounded mr-3 flex-shrink-0 relative overflow-hidden cursor-pointer"
                              onClick={() => handleVideoClick(video)}
                            >
                              {isNewSchema(video) && video?.thumbnailKey ? (
                                <img
                                  src={`https://d27zhkbo74exx9.cloudfront.net/${video.thumbnailKey}`}
                                  alt="Video thumbnail"
                                  className="w-full h-full object-cover"
                                />
                              ) : video?.embeddedLink && !isNewSchema(video) ? (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                                  <span className="text-white text-xs">▶</span>
                                </div>
                              ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                  <span className="text-white text-xs">▶</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                <span className="text-white text-lg">▶</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {video.title || video.name}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{getTimeAgo(video.createdAt)}</span>
                                {isNewSchema(video) && (
                                  <div className="flex items-center gap-1">
                                    <HiEye size={12} />
                                    <span>{video.viewCount || 0} views</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 menu-container">
                              {isNewSchema(video) && (
                                <button
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded bg-gradient-blue text-white border-transparent transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/videoviewer/${video._id}`);
                                  }}
                                >
                                  <MdAnalytics size={14} />
                                  Analytics
                                </button>
                              )}
                              <Menu
                                shadow="md"
                                width={150}
                                position="bottom-end"
                                arrowPosition="center"
                                radius={12}
                                offset={-5}
                                styles={{
                                  menu: { padding: "8px 12px !important" },
                                  itemLabel: {
                                    fontSize: "14px",
                                    fontWeight: 500,
                                  },
                                }}
                              >
                                <Menu.Target>
                                  <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    style={{ color: "black" }}
                                  >
                                    <BsThreeDotsVertical size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item>
                                    <div
                                      onClick={() => {
                                        copy(video?.shareableLink);
                                        console.log(
                                          "Shareable link:",
                                          video?.shareableLink
                                        );
                                      }}
                                      className="flex items-center gap-[8px]"
                                    >
                                      <COPY_ICON className="text-black" />
                                      <p className="text-[14px] font-medium">
                                        Copy Link
                                      </p>
                                    </div>
                                  </Menu.Item>
                                  <Menu.Item
                                    leftSection={
                                      <SHARE_ICON className="text-black" />
                                    }
                                    onClick={() => {
                                      setVideoToBeShared(video);
                                      setIsShareVideoModalOpen(true);
                                    }}
                                  >
                                    Share
                                  </Menu.Item>
                                  <Menu.Item
                                    leftSection={
                                      <EDIT_ICON className="text-black" />
                                    }
                                    onClick={() => {
                                      setVideoToBeEdited(video);
                                      setIsEditVideoModalOpen(true);
                                    }}
                                  >
                                    Edit
                                  </Menu.Item>
                                  <Menu.Item
                                    color="red"
                                    leftSection={
                                      <DELETE_ICON className="text-[#FF0000]" />
                                    }
                                    onClick={() => {
                                      setVideoToBeDeleted(video);
                                      setIsDeleteVideoModalOpen(true);
                                    }}
                                  >
                                    Delete
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {currentPage.uploaded < totalPages.uploaded && (
                    <div className="flex justify-center mt-4">
                      <Button
                        onClick={() => loadMoreVideos("uploaded")}
                        loading={isLoadingMore.uploaded}
                        variant="outline"
                      >
                        View More Uploaded Videos
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-[10px] max-w-[450px] mx-auto">
                  <p className="text-center text-gray-500 text-[16px]">
                    No Uploaded videos found in the Media Storage! Please upload
                    a new Video by clicking on the upload buttons.
                  </p>
                </div>
              )}
            </VideoTabSection>
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <HistoryTabSection>
              {isHistoryLoading ? (
                <div className="flex flex-col gap-2 w-full">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="!rounded-lg !w-full !h-[50px]"
                    />
                  ))}
                </div>
              ) : isHistoryError ? (
                <p className="text-center text-gray-500 text-[16px]">
                  Error loading history
                </p>
              ) : historyData && historyData.length > 0 ? (
                <HistoryTableList historyData={historyData} />
              ) : (
                <p className="text-center text-gray-500 text-[16px]">
                  No History Found!
                </p>
              )}
            </HistoryTabSection>
          </Tabs.Panel>
        </Tabs>

        {/* Video Player Modal - Only for new schema videos */}
        {showVideoPlayer && selectedVideo && isNewSchema(selectedVideo) && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedVideo.title || selectedVideo.name}
                </h3>
                <button
                  onClick={() => setShowVideoPlayer(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="aspect-video">
                <VideoPlayer videoData={selectedVideo} />
              </div>
            </div>
          </div>
        )}
      </LibraryBody>
    </LibraryRoot>
  );
};

export default RecordVideo;
