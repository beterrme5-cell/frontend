import { Tabs } from "@mantine/core";
import {
  BodyTabsRoot,
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
    videoLength: "4 min",
  },
  {
    id: 2,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },
  {
    id: 3,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },

  {
    id: 4,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },
  {
    id: 5,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },
  {
    id: 6,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },
  {
    id: 7,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },

  {
    id: 8,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },
];

const SharedVideosData = [
  {
    id: 1,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },
  {
    id: 2,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },
  {
    id: 3,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },

  {
    id: 4,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },
  {
    id: 5,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },
  {
    id: 6,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },
  {
    id: 7,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
  },

  {
    id: 8,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.youtube.com/embed/XuVuoJDK_E8",
    videoLength: "4 min",
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
                    videoLength={video.videoLength}
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

          <Tabs.Panel value="history">Messages tab content</Tabs.Panel>
        </BodyTabsRoot>
      </LibraryBody>
    </LibraryRoot>
  );
};

export default Dashboard;
