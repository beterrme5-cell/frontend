import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVideoViewerData, incrementVideoView } from "../../api/libraryAPIs";
import { VideoPlayer } from "./VideoPlayer";
import { HiClock, HiEye, HiCalendar, HiArrowLeft } from "react-icons/hi2";

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
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-gradient-blue text-white p-2 rounded-full transition-colors duration-200"
            >
              <div className="p-1 rounded-full bg-white">
                {" "}
                <HiArrowLeft size={16} className="text-gray-500" />
              </div>

              <span className="font-medium text-[14px]">Back to Library</span>
            </button>

            {/* Konnectd Logo - Centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img
                src="https://res.cloudinary.com/dmdaa1heq/image/upload/v1748271556/Konnectd_Logo_Reversed_el4sw9.png"
                alt="Konnectd Logo"
                className="h-8 w-auto cursor-pointer"
                onClick={() => navigate("/library")}
              />
            </div>

            {/* Empty div for spacing */}
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Video Title */}
        {video.title && (
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-8">
            {video.title}
          </h1>
        )}

        {/* Video Player */}
        <div className="w-full bg-white rounded-xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 overflow-hidden mb-8 ring-1 ring-gray-200">
          <div className="aspect-video bg-black ">
            <VideoPlayer
              videoData={video}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
            />
          </div>
        </div>

        {/* Video Details */}
        <div className="w-full bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center tracking-wider">
            Video Details
          </h2>

          <div className="flex flex-wrap gap-3 justify-center">
            {video.viewCount !== undefined && (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-blue text-white">
                <HiEye className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wider">
                  {video.viewCount} {video.viewCount === 1 ? "view" : "views"}
                </span>
              </div>
            )}

            {video.lastViewedAt && (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white">
                <HiClock className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wider">
                  Last viewed: {getTimeAgo(video.lastViewedAt)}
                </span>
              </div>
            )}

            {video.createdAt && (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-green-500 to-green-700 text-white">
                <HiCalendar className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wider">
                  Created: {getTimeAgo(video.createdAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default VideoViewer;
