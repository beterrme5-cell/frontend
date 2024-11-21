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
import { useEffect, useState } from "react";
import { getAllVideos } from "../../api/libraryAPIs";

const SharedVideosData = [
  {
    _id: 1,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.loom.com/embed/e0fdac661ea9418489951c1fb4c7373c",
  },
  {
    _id: 2,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.loom.com/embed/e0fdac661ea9418489951c1fb4c7373c",
  },
  {
    _id: 3,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.loom.com/embed/e0fdac661ea9418489951c1fb4c7373c",
  },
  {
    _id: 4,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.loom.com/embed/e0fdac661ea9418489951c1fb4c7373c",
  },
];

const HistoryData = [
  {
    _id: 1,
    recordingId: "xi120-csad-123",
    contactId: "K3asdY2AdDaa",
    contactName: "Alex Smith",
    type: "email",
    subject: "Test Video",
  },
  {
    _id: 2,
    recordingId: "si120-csad-123",
    contactId: "K3asdY2AdDaa",
    contactName: "John Doe",
    type: "sms",
    subject: "Recording Video",
  },
];

const Dashboard = () => {
  const [videosData, setVideosData] = useState([]);

  const setIsUploadVideoModalOpen = useGlobalModals(
    (state) => state.setIsUploadVideoModalOpen
  );

  // Use Effect to Fetch All Videos
  useEffect(() => {
    // const fetchAllVideos = async () => {
    //   // Fetch all videos here
    //   const videosResponse = await getAllVideos();
    //   if (videosResponse.success) {
    //     console.log("Videos Data: ", videosResponse.data.videos);
    //     setVideosData(videosResponse.data.videos);
    //   } else {
    //     console.error("Error fetching videos: ", videosResponse.error);
    //   }
    // };
    // fetchAllVideos();
  }, []);

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
              <VideoTabItemsList>
                {videosData.map((video) => (
                  <VideoTabItem key={video._id} videoData={video} />
                ))}
              </VideoTabItemsList>
            </VideoTabSection>{" "}
            <VideoTabSection heading="Videos Shared With me">
              <VideoTabItemsList>
                {SharedVideosData.map((video) => (
                  <VideoTabItem key={video._id} videoData={video} />
                ))}
              </VideoTabItemsList>
            </VideoTabSection>
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <HistoryTabSection>
              <HistoryTableList historyData={HistoryData} />
            </HistoryTabSection>
          </Tabs.Panel>
        </BodyTabsRoot>
      </LibraryBody>
    </LibraryRoot>
  );
};

export default Dashboard;
