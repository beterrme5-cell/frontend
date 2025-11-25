import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { VideoPlayer } from "../../components/ui/VideoPlayer";
import { getVideoViewerData, incrementVideoView } from "../../api/libraryAPIs";

function PublicVideoView() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const viewTracked = useRef(false);
  const watchTimeRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getVideoViewerData({ id });
        setVideo(data.video);
      } catch (err) {
        setError("Failed to load video.");
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
    window.scrollTo(0, 0);
  }, [id]);

  const hasViewedBefore = () =>
    localStorage.getItem(`video_viewed_${id}`) === "true";

  const markAsViewed = () => {
    localStorage.setItem(`video_viewed_${id}`, "true");
  };

  const handleVideoPlay = () => {
    if (!viewTracked.current && !hasViewedBefore()) {
      timerRef.current = setInterval(() => {
        watchTimeRef.current += 1;

        if (watchTimeRef.current >= 3 && !viewTracked.current) {
          viewTracked.current = true;

          incrementVideoView({ videoId: id })
            .then(() => {
              markAsViewed();
              setVideo((prev) => ({
                ...prev,
                viewCount: (prev?.viewCount || 0) + 1,
              }));
            })
            .catch(() => {});

          clearInterval(timerRef.current);
        }
      }, 1000);
    }
  };

  const handleVideoPause = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(
    () => () => timerRef.current && clearInterval(timerRef.current),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        {error || "Video not found."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <main className="w-full max-w-4xl flex flex-col items-center">
        {/* Title (same as before) */}
        {video.title && (
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-4">
            {video.title}
          </h1>
        )}

        {/* Video container that fits screen height WITHOUT cutting */}
        <div
          className="w-full bg-black rounded-xl shadow-2xl overflow-hidden"
          style={{
            maxHeight: "75vh", // makes video fit on screen
            aspectRatio: "16/9", // keeps perfect video ratio
          }}
        >
          <VideoPlayer
            videoData={video}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
          />
        </div>

        {/* Captions */}
        {video?.captionsKey && (
          <div className="text-center mt-3 text-gray-600 text-sm">
            Captions available
          </div>
        )}
      </main>
    </div>
  );
}

export default PublicVideoView;
