import { useEffect, useState } from "react";
import {
  UploadedVideoDetailPreview,
  VideoDetailRoot,
  VideoDetailHeader,
  VideoDetailActions,
  VideoDetailActionBtn,
} from "../../components/ui/VideoDetailComponents";
import { useGlobalModals } from "../../store/globalModals";

const UploadedVideoDetail = () => {
  // Global State for Share Video Modal
  const setVideoToBeShared = useGlobalModals(
    (state) => state.setVideoToBeShared
  );
  const setIsShareVideoModalOpen = useGlobalModals(
    (state) => state.setIsShareVideoModalOpen
  );
  const [videoDetail, setVideoDetail] = useState(null);

  useEffect(() => {
    // Get the string from localStorage
    const videoDetailString = localStorage.getItem("uploadedVideoDetail");

    if (videoDetailString) {
      // Parse the JSON string into a JavaScript object and update the state
      setVideoDetail(JSON.parse(videoDetailString));
    }
  }, []);

  if (!videoDetail) {
    return (
      <VideoDetailRoot>
        <div className="h-[150px] flex justify-center items-center text-gray-500">
          <p>Video Detail not found!</p>
        </div>
      </VideoDetailRoot>
    );
  }

  return (
    <VideoDetailRoot>
      <VideoDetailHeader
        title={videoDetail.title.substring(
          0,
          videoDetail.title.lastIndexOf(".")
        )}
      />
      <UploadedVideoDetailPreview videoUrl={videoDetail.shareableLink} />
      <VideoDetailActions>
        <VideoDetailActionBtn
          label="Share"
          actionType="share"
          onClick={() => {
            setVideoToBeShared(videoDetail);
            setIsShareVideoModalOpen(true);
          }}
        />
      </VideoDetailActions>
    </VideoDetailRoot>
  );
};

export default UploadedVideoDetail;
