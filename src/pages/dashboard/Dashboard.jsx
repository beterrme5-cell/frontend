import { Button, Skeleton, Tabs } from "@mantine/core";
import {
  BodyTabsRoot,
  HistoryTableList,
  HistoryTabSection,
  LibraryBody,
  LibraryHeader,
  LibraryRoot,
  UploadedVideoTabItem,
  VideoActionButtons,
  VideoTabItem,
  VideoTabItemsList,
  VideoTabSection,
} from "../../components/ui/LibraryComponents";
import { useUserStore } from "../../store/userStore";
import { toast } from "react-toastify";
import { getAllVideos, getUserDomain } from "../../api/libraryAPIs";
import { getHistoryOfMessages } from "../../api/commsAPIs";
import { useLoadingBackdrop } from "../../store/loadingBackdrop";
import { getDecryptedUserData } from "../../api/auth";
import { useGlobalModals } from "../../store/globalModals";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const Dashboard = () => {
  // Video states
  const videosData = useUserStore((state) => state.videosData);
  const setVideosData = useUserStore((state) => state.setVideosData);

  // Pagination states
  const [currentPage, setCurrentPage] = useState({
    recorded: 1,
    uploaded: 1,
  });
  const [totalPages, setTotalPages] = useState({
    recorded: 1,
    uploaded: 1,
  });

  const [isLoadingMore, setIsLoadingMore] = useState({
    recorded: false,
    uploaded: false,
  });

  // Other states and hooks

  const setLoading = useLoadingBackdrop((state) => state.setLoading);
  const setUpdateDomainModalOpen = useGlobalModals(
    (state) => state.setUpdateDomainModalOpen
  );
  const setUserDomain = useUserStore((state) => state.setUserDomain);
  const [activeTab, setActiveTab] = useState("videos");

  // Fetch videos with pagination support
  const fetchVideos = async (token, page = 1, type = "recorded") => {
    const videosResponse = await getAllVideos(token, page, 10);

    const newRecorded = videosResponse.recordedVideos || [];
    const newUploaded = videosResponse.uploadedVideos || [];

    if (page === 1) {
      setVideosData({
        recordedVideos: newRecorded,
        uploadedVideos: newUploaded,
      });
    } else if (type === "recorded") {
      const updatedRecordedVideos = [
        ...(videosData?.recordedVideos || []),
        ...newRecorded,
      ];
      setVideosData({
        ...videosData,
        recordedVideos: updatedRecordedVideos,
      });
    } else {
      const updatedUploadedVideos = [
        ...(videosData?.uploadedVideos || []),
        ...newUploaded,
      ];
      setVideosData({
        ...videosData,
        uploadedVideos: updatedUploadedVideos,
      });
    }

    setTotalPages({
      recorded: videosResponse.pagination?.recorded.totalPages || 1,
      uploaded: videosResponse.pagination?.uploaded.totalPages || 1,
    });

    return videosResponse;
  };

  // Load more videos
  const loadMoreVideos = async (type) => {
    const nextPage = currentPage[type] + 1;
    const accessToken = localStorage.getItem("accessToken");
    if (nextPage <= totalPages[type]) {
      setIsLoadingMore((prev) => ({ ...prev, [type]: true }));
      await fetchVideos(accessToken, nextPage, type);
      setIsLoadingMore((prev) => ({ ...prev, [type]: false }));
      setCurrentPage((prev) => ({ ...prev, [type]: nextPage }));
    }
  };

  // React Query for history data
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useQuery({
    queryKey: ["history"],
    queryFn: () => getHistoryOfMessages(localStorage.getItem("accessToken")),
    enabled: activeTab === "history",
  });

  // User access key query
  const { data: userAccessKey } = useQuery({
    queryKey: ["userKey"],
    queryFn: async () => {
      try {
        const key = await new Promise((resolve) => {
          window.parent.postMessage({ message: "REQUEST_USER_DATA" }, "*");
          window.addEventListener("message", ({ data }) => {
            if (data.message === "REQUEST_USER_DATA_RESPONSE") {
              resolve(data.payload);
            } else {
              resolve(null);
            }
          });
        });
        return key;
      } catch (error) {
        console.error("Error fetching key from GHL iFrame: ", error);
        throw new Error("Failed to fetch key from GHL iFrame");
      }
    },
  });

  // Main data query
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["dashboardData", userAccessKey],
    queryFn: async () => {
      setLoading(false);
      const response = await getDecryptedUserData({ tokenKey: userAccessKey });

      if (!response.success || response.data.accessToken === undefined) {
        throw new Error("Failed to fetch access token");
      }

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("userLocationId", response.data.user.userLocationId);

      // Fetch initial videos
      await fetchVideos(response.data.accessToken, 1);
      // Fetch domain data
      return await getUserDomain(response.data.accessToken);
    },
    enabled: !!userAccessKey,
  });

  // Handle domain data changes
  useEffect(() => {
    if (data) {
      setUserDomain(data.userDomain || "");
      if (data.userDomain === "" && data.showDomainPopup) {
        setUpdateDomainModalOpen(true);
      }
    }
  }, [data, setUserDomain, setUpdateDomainModalOpen]);

  if (isError) {
    console.error("Error fetching library data: ", error);
    toast.error("Error Fetching Library Data", {
      position: "bottom-right",
      autoClose: 5000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  return (
    <LibraryRoot>
      {isPending ? (
        <VideoActionButtons>
          <header className="flex items-center justify-between w-full">
            <h1 className="text-[28px] font-bold">My Library</h1>
            <div className="ml-auto flex items-center gap-[12px]">
              <Skeleton className="!w-[120px] !h-[40px] !rounded-[6px]" />
              <Skeleton className="!w-[120px] !h-[40px] !rounded-[6px]" />
            </div>
          </header>
        </VideoActionButtons>
      ) : (
        <LibraryHeader title="My Library" />
      )}
      <LibraryBody>
        <BodyTabsRoot
          value={activeTab}
          onChange={(value) => setActiveTab(value)}
        >
          <Tabs.List>
            <Tabs.Tab value="videos">Videos</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="videos">
            <VideoTabSection heading="Recorded Videos">
              {isPending ? (
                <VideoTabItemsList>
                  {Array.from({ length: 5 }).map((_, index) => (
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
              {isPending ? (
                <VideoTabItemsList>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="!rounded-lg !min-w-[250px] !h-[210px]"
                    />
                  ))}
                </VideoTabItemsList>
              ) : videosData?.uploadedVideos?.length > 0 ? (
                <>
                  <VideoTabItemsList>
                    {videosData?.uploadedVideos?.map((video) => (
                      <UploadedVideoTabItem key={video._id} videoData={video} />
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
                    a new Video by clicking on the upload button.
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
        </BodyTabsRoot>
      </LibraryBody>
    </LibraryRoot>
  );
};

export default Dashboard;
