import { Button, Skeleton, Tabs } from "@mantine/core";
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
            <VideoTabSection heading="Recorded Videos">
              {isLoading ? (
                <VideoTabItemsList>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="!rounded-lg !min-w-[250px] !h-[210px]"
                    />
                  ))}
                </VideoTabItemsList>
              ) : videosData?.recordedVideos?.length > 0 ? (
                <>
                  <VideoTabItemsList>
                    {videosData?.recordedVideos?.map((video) => (
                      <VideoTabItem key={video._id} videoData={video} />
                    ))}
                  </VideoTabItemsList>

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
                <VideoTabItemsList>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="!rounded-lg !min-w-[250px] !h-[210px]"
                    />
                  ))}
                </VideoTabItemsList>
              ) : videosData?.uploadedVideos?.length > 0 ? (
                <>
                  <VideoTabItemsList>
                    {videosData?.uploadedVideos?.map((video, index) => (
                      <UploadedVideoTabItem key={index} videoData={video} />
                    ))}
                  </VideoTabItemsList>

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
      </LibraryBody>
    </LibraryRoot>
  );
};

export default RecordVideo;
