import { Tabs } from "@mantine/core";
import {
  BodyTabsRoot,
  HistoryTableList,
  HistoryTabSection,
  LibraryBody,
  LibraryHeader,
  LibraryRoot,
  VideoTabItem,
  VideoTabItemsList,
  VideoTabSection,
} from "../../components/ui/LibraryComponents";
import { useGlobalModals } from "../../store/globalModals";
import { useEffect } from "react";
import { getAllVideos } from "../../api/libraryAPIs";
import { useLoadingBackdrop } from "../../store/loadingBackdrop";
import { useUserStore } from "../../store/userStore";
import { getHistoryOfMessages } from "../../api/commsAPIs";

const Dashboard = () => {
  const videosData = useUserStore((state) => state.videosData);
  const setVideosData = useUserStore((state) => state.setVideosData);
  const historyData = useUserStore((state) => state.historyData);
  const setHistoryData = useUserStore((state) => state.setHistoryData);

  const setIsUploadVideoModalOpen = useGlobalModals(
    (state) => state.setIsUploadVideoModalOpen
  );

  const setLoading = useLoadingBackdrop((state) => state.setLoading);

  const fetchVideosData = useUserStore((state) => state.fetchVideosData);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [videosResponse, historyResponse] = await Promise.all([
          getAllVideos(),
          getHistoryOfMessages(),
        ]);

        // Check responses and set state only after all are resolved
        if (videosResponse.success && historyResponse.success) {
          // Update states
          setVideosData(videosResponse.data.videos);
          setHistoryData(historyResponse.data.histories);
        } else {
          console.error("Error fetching data");
          if (!videosResponse.success) {
            console.error("Error fetching videos: ", videosResponse.error);
          }
          if (!historyResponse.success) {
            console.error("Error fetching history: ", historyResponse.error);
          }
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLoading, setVideosData, fetchVideosData]);

  return (
    <LibraryRoot>
      <LibraryHeader
        title="My Library"
        onUploadVideoBtnClick={() => {
          setIsUploadVideoModalOpen(true);
        }}
      />
      <LibraryBody>
        <BodyTabsRoot>
          <Tabs.List>
            <Tabs.Tab value="videos">Videos</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="videos">
            <VideoTabSection heading="My Videos">
              {videosData && videosData.length > 0 ? (
                <VideoTabItemsList>
                  {videosData.map((video) => (
                    <VideoTabItem key={video._id} videoData={video} />
                  ))}
                </VideoTabItemsList>
              ) : (
                <div className="py-[10px] max-w-[450px] mx-auto">
                  <p className="text-center text-gray-500 text-[16px]">
                    No Recorded videos found! Please record a new Video or Click
                    on the upload button to upload a new video.
                  </p>
                </div>
              )}
            </VideoTabSection>{" "}
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <HistoryTabSection>
              {historyData && historyData.length > 0 ? (
                <HistoryTableList />
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
