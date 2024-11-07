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

const VideosData = [
  {
    id: 1,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
  {
    id: 2,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
  {
    id: 3,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },

  {
    id: 4,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
  {
    id: 5,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
  {
    id: 6,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
  {
    id: 7,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },

  {
    id: 8,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
];

const SharedVideosData = [
  {
    id: 1,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
  {
    id: 2,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
  {
    id: 3,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },

  {
    id: 4,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
  {
    id: 5,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
  {
    id: 6,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
  {
    id: 7,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },

  {
    id: 8,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
  },
];

const HistoryData = [
  {
    id: 1,
    recordingId: "xi120-csad-123",
    contactId: "K3asdY2AdDaa",
    contactName: "Alex Smith",
    type: "email",
    subject: "Test Video",
  },
  {
    id: 2,
    recordingId: "si120-csad-123",
    contactId: "K3asdY2AdDaa",
    contactName: "John Doe",
    type: "sms",
    subject: "Recording Video",
  },
];

const Dashboard = () => {
  return (
    <LibraryRoot>
      <LibraryHeader
        title="My Library"
        onUploadVideoBtnClick={() => {
          alert("Upload Video Clicked");
        }}
        onNewVideoBtnClick={() => {
          alert("New Video Clicked");
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
                {VideosData.map((video) => (
                  <VideoTabItem
                    key={video.id}
                    title={video.title}
                    description={video.description}
                    videoLink={video.videoLink}
                  />
                ))}
              </VideoTabItemsList>
            </VideoTabSection>{" "}
            <VideoTabSection heading="My Shared With me">
              <VideoTabItemsList>
                {SharedVideosData.map((video) => (
                  <VideoTabItem
                    key={video.id}
                    title={video.title}
                    description={video.description}
                    videoLink={video.videoLink}
                    videoLength={video.videoLength}
                  />
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
