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
import { useUserStore } from "../../store/userStore";

const Dashboard = () => {
  const videosData = useUserStore((state) => state.videosData);
  const historyData = useUserStore((state) => state.historyData);

  return (
    <LibraryRoot>
      <LibraryHeader title="My Library" />
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
