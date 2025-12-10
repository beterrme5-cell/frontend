import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { VideoPlayer } from "../../components/ui/VideoPlayer";
import { getVideoViewerData, incrementVideoView } from "../../api/libraryAPIs";

function PublicVideoView() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);

  const viewTracked = useRef(false);
  const watchTimeRef = useRef(0);
  const lastSentWatchTime = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getVideoViewerData({ id });
        setVideo(data.video);
        console.log(data.video);
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

  const sendWatchTimeUpdate = (watchTime) => {
    incrementVideoView({ videoId: id, watchTime })
      .then(() => {
        lastSentWatchTime.current = watchTimeRef.current;
      })
      .catch(() => {});
  };

  const handleVideoPlay = () => {
    timerRef.current = setInterval(() => {
      watchTimeRef.current += 1;

      // First update after 3 seconds (view count + initial watch time)
      if (
        watchTimeRef.current === 3 &&
        !viewTracked.current &&
        !hasViewedBefore()
      ) {
        viewTracked.current = true;
        incrementVideoView({ videoId: id })
          .then(() => {
            markAsViewed();
            setVideo((prev) => ({
              ...prev,
              viewCount: (prev?.viewCount || 0) + 1,
            }));
            lastSentWatchTime.current = 3;
          })
          .catch(() => {});
      }
      // Send watch time updates every 10 seconds after first update
      else if (
        watchTimeRef.current > 3 &&
        watchTimeRef.current - lastSentWatchTime.current >= 10
      ) {
        const newWatchTime = watchTimeRef.current - lastSentWatchTime.current;
        sendWatchTimeUpdate(newWatchTime);
      }
    }, 1000);
  };

  const handleVideoPause = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);

      // Send final watch time update on pause if there's unsent time
      if (watchTimeRef.current > lastSentWatchTime.current) {
        const remainingWatchTime =
          watchTimeRef.current - lastSentWatchTime.current;
        sendWatchTimeUpdate(remainingWatchTime);
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (watchTimeRef.current > lastSentWatchTime.current) {
        const remainingWatchTime =
          watchTimeRef.current - lastSentWatchTime.current;
        // Use sendBeacon for reliable delivery on page unload
        navigator.sendBeacon(
          `${import.meta.env.VITE_BASE_URL}/video/incrementView`,
          JSON.stringify({ videoId: id, watchTime: remainingWatchTime })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start md:justify-center px-4 pt-4 md:pt-0">
      <main className="w-full max-w-4xl flex flex-col items-center">
        {/* Header with title and caption toggle */}
        <div className="w-full flex justify-between items-center mb-4">
          {/* Title - Top Left */}
          {video.title && (
            <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
          )}

          {/* Caption Toggle - Top Right */}
          {video?.hasCaption && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">CC</span>
              <button
                onClick={() => setCaptionsEnabled(!captionsEnabled)}
                className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${
                  captionsEnabled ? "bg-blue-500" : "bg-gray-400"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform duration-200 ${
                    captionsEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Video container */}
        <div
          className="w-full bg-black rounded-xl shadow-2xl overflow-hidden"
          style={{
            maxHeight: "75vh",
            aspectRatio: "16/9",
          }}
        >
          <VideoPlayer
            videoData={video}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            captionsEnabled={captionsEnabled}
            onCaptionsToggle={setCaptionsEnabled}
          />
        </div>
      </main>
    </div>
  );
}

export default PublicVideoView;
