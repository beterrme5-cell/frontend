import { useEffect } from "react";
import {
  VideoDetailActionBtn,
  VideoDetailActions,
  VideoDetailPreview,
  VideoDetailRoot,
  VideoDetailHeader,
} from "../../components/ui/VideoDetailComponents";
import { useGlobalModals } from "../../store/globalModals";
import { useParams } from "react-router-dom";
import { getVideoById } from "../../api/libraryAPIs";
import { useUserStore } from "../../store/userStore";

const VideoDetail = () => {
  const { videoId } = useParams();

  const videoDetail = useUserStore((state) => state.videoDetail);
  const setVideoDetail = useUserStore((state) => state.setVideoDetail);

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

  useEffect(() => {
    const fetchVideoData = async () => {
      const response = await getVideoById(videoId);

      if (response.success) {
        setVideoDetail(response.data.video);
      }

      if (!response.success) {
        console.error("Error while fetching video by id: ", response.error);
      }
    };

    fetchVideoData();
  }, [videoId, setVideoDetail]);

  return (
    <VideoDetailRoot>
      <VideoDetailHeader
        title={videoDetail.title}
        description={videoDetail.description}
      />
      <VideoDetailPreview videoUrl={videoDetail.embeddedLink} />
      <VideoDetailActions>
        <VideoDetailActionBtn
          label="Share"
          actionType="share"
          onClick={() => {
            setVideoToBeShared(videoDetail);
            setIsShareVideoModalOpen(true);
          }}
        />
        <VideoDetailActionBtn
          label="Edit"
          actionType="edit"
          onClick={() => {
            setVideoToBeEdited(videoDetail);
            setIsEditVideoModalOpen(true);
          }}
        />
        <VideoDetailActionBtn
          label="Delete"
          actionType="delete"
          onClick={() => {
            setVideoToBeDeleted(videoDetail);
            setIsDeleteVideoModalOpen(true);
          }}
        />
      </VideoDetailActions>
    </VideoDetailRoot>
  );
};

export default VideoDetail;
