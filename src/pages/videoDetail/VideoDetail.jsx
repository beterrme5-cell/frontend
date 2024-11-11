import {
  VideoDetailActionBtn,
  VideoDetailActions,
  VideoDetailDescription,
  VideoDetailPreview,
  VideoDetailRoot,
  VideoDetailTitle,
} from "../../components/ui/VideoDetailComponents";
import { useGlobalModals } from "../../store/globalModals";

const VideoDetail = () => {
  // Sample Video Data
  const VideoData = {
    _id: 1,
    title: "You can be anywhere!",
    description: "This is a video description",
    videoLink: "https://www.loom.com/embed/e0fdac661ea9418489951c1fb4c7373c",
  };

  // Global State for Delete Video Modal
  const setVideoToBeDeleted = useGlobalModals(
    (state) => state.setVideoToBeDeleted
  );
  const setIsDeleteVideoModalOpen = useGlobalModals(
    (state) => state.setIsDeleteVideoModalOpen
  );

  // Global State for Edit Video Modal
  const setVideoToBeEdited = useGlobalModals(
    (state) => state.setVideoToBeEdited
  );
  const setIsEditVideoModalOpen = useGlobalModals(
    (state) => state.setIsEditVideoModalOpen
  );

  // Global State for Share Video Modal
  const setVideoToBeShared = useGlobalModals(
    (state) => state.setVideoToBeShared
  );
  const setIsShareVideoModalOpen = useGlobalModals(
    (state) => state.setIsShareVideoModalOpen
  );
  return (
    <VideoDetailRoot>
      <VideoDetailTitle title="You can be anywhere!" />
      <VideoDetailDescription description="This is a video description" />
      <VideoDetailPreview videoUrl="https://www.loom.com/embed/e0fdac661ea9418489951c1fb4c7373c?sid=9c21f168-cb5a-41f1-85e6-e093b6beebc6" />
      <VideoDetailActions>
        <VideoDetailActionBtn
          label="Share"
          actionType="share"
          onClick={() => {
            setVideoToBeShared(VideoData);
            setIsShareVideoModalOpen(true);
          }}
        />
        <VideoDetailActionBtn
          label="Edit"
          actionType="edit"
          onClick={() => {
            setVideoToBeEdited(VideoData);
            setIsEditVideoModalOpen(true);
          }}
        />
        <VideoDetailActionBtn
          label="Delete"
          actionType="delete"
          onClick={() => {
            setVideoToBeDeleted(VideoData);
            setIsDeleteVideoModalOpen(true);
          }}
        />
      </VideoDetailActions>
    </VideoDetailRoot>
  );
};

export default VideoDetail;
