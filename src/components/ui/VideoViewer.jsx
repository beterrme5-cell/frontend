import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getVideoViewerData, incrementVideoView } from "../../api/libraryAPIs";
import { VideoPlayer } from "./VideoPlayer";
import { HiClock, HiEye, HiCalendar } from "react-icons/hi2";

// Helper function to get time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30)
    return `${Math.floor(diffInDays / 7)} week${
      Math.floor(diffInDays / 7) > 1 ? "s" : ""
    } ago`;
  if (diffInDays < 365)
    return `${Math.floor(diffInDays / 30)} month${
      Math.floor(diffInDays / 30) > 1 ? "s" : ""
    } ago`;
  return `${Math.floor(diffInDays / 365)} year${
    Math.floor(diffInDays / 365) > 1 ? "s" : ""
  } ago`;
};

function VideoViewer() {
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
        setError("Failed to load video. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [id]);

  // ✅ FIX: Reset scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hasViewedBefore = () => {
    const storageKey = `video_viewed_${id}`;
    return localStorage.getItem(storageKey) === "true";
  };

  const markAsViewed = () => {
    const storageKey = `video_viewed_${id}`;
    localStorage.setItem(storageKey, "true");
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
                viewCount: (prev.viewCount || 0) + 1,
              }));

              console.log("View counted successfully!");
            })
            .catch((err) => {
              console.error("Failed to track view:", err);
            });

          clearInterval(timerRef.current);
        }
      }, 1000);
    }
  };

  const handleVideoPause = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to load video
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Video not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 min-h-screen flex flex-col justify-center items-center">
      {/* 🎬 Video Title */}
      {video.title && (
        <h1 className="text-center text-2xl font-bold text-gray-900 mb-4">
          {video.title}
        </h1>
      )}

      {/* Video Player */}
      <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="aspect-video bg-black">
          <VideoPlayer
            videoData={video}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
          />
        </div>
      </div>

      {/* Details */}
      <div className="w-full bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Video Details
        </h2>

        <div className="flex flex-wrap gap-2 justify-center">
          {video.duration && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-500 to-slate-700 text-white">
              <HiClock className="w-4 h-4" />
              <span className="text-sm font-medium">{video.duration}</span>
            </div>
          )}

          {video.viewCount !== undefined && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white">
              <HiEye className="w-4 h-4" />
              <span className="text-sm font-medium">
                {video.viewCount} Views
              </span>
            </div>
          )}

          {video.lastViewedAt && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white">
              <HiClock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Last viewed: {getTimeAgo(video.lastViewedAt)}
              </span>
            </div>
          )}

          {video.createdAt && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-green-500 to-green-700 text-white">
              <HiCalendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                Created: {getTimeAgo(video.createdAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoViewer;
