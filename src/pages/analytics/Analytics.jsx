import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowLeftIcon,
  EyeIcon,
  ClockIcon,
  ShareIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { GoDeviceCameraVideo } from "react-icons/go";
import { HiArrowLeft } from "react-icons/hi2";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function Analytics() {
  const { id } = useParams();

  const {
    data: allVideos = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["creatorVideos", id],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/video/getVideosByCreator/${id}`
      );
      return response.data.videos || [];
    },
    enabled: !!id,
  });

  // Calculate analytics
  const totalViews = allVideos.reduce(
    (sum, video) => sum + (video.viewCount || 0),
    0
  );
  const totalWatchTime = allVideos.reduce(
    (sum, video) => sum + (video.totalWatchTime || 0),
    0
  );
  const totalShares = allVideos.reduce(
    (sum, video) => sum + (video.shareCount || 0),
    0
  );
  const avgWatchTime =
    totalViews > 0 ? Math.round(totalWatchTime / totalViews) : 0;

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get top videos
  const topVideos = allVideos
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  // Calculate share breakdown
  const shareBreakdown = allVideos.reduce(
    (acc, video) => {
      if (video.shareBreakdown) {
        acc.email += video.shareBreakdown.email || 0;
        acc.sms += video.shareBreakdown.sms || 0;
        acc.copy += video.shareBreakdown.copy || 0;
      }
      return acc;
    },
    { email: 0, sms: 0, copy: 0 }
  );

  const totalShareBreakdown =
    shareBreakdown.email + shareBreakdown.sms + shareBreakdown.copy;

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="w-full">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="h-8 bg-gray-200 rounded w-80"></div>
              <div className="absolute left-0 h-10 bg-gray-200 rounded-full w-40"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-lg shadow-sm border"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-9 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>

            {/* Traffic Sources Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
              <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Videos Skeleton */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-gray-200">
                <div className="col-span-6 h-4 bg-gray-200 rounded"></div>
                <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
                <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
                <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-3 mt-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="hidden md:grid grid-cols-12 gap-4 py-2">
                      <div className="col-span-6 flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      </div>
                      <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
                      <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
                      <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="md:hidden bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      </div>
                      <div className="space-y-2">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="flex justify-between">
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                            <div className="h-3 bg-gray-200 rounded w-8"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-500">Error: {error.message}</p>
          <p className="text-sm text-gray-500">Creator ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="relative flex items-center justify-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Track performance and engagement metrics
          </h1>
          <button
            onClick={() => window.history.back()}
            className="absolute left-0 flex items-center gap-2 bg-gradient-blue text-white p-2 rounded-full transition-colors duration-200"
          >
            <div className="p-1 rounded-full bg-white">
              <HiArrowLeft size={16} className="text-gray-500" />
            </div>
            <span className="font-medium text-[14px]">Back to Dashboard</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <EyeIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                Total Views
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#0f5edd] via-[#1c6ff9] to-[#3a8bff] bg-clip-text text-transparent mb-2">
              {totalViews > 0 ? formatNumber(totalViews) : "-"}
            </div>
            <div className="text-sm text-gray-500">across all videos</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <PlayIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                Watch Time
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#0f5edd] via-[#1c6ff9] to-[#3a8bff] bg-clip-text text-transparent mb-2">
              {totalWatchTime > 0 ? `${Math.round(totalWatchTime / 60)}m` : "-"}
            </div>
            <div className="text-sm text-gray-500">minutes total</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <ClockIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                Avg. Watch Time
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#0f5edd] via-[#1c6ff9] to-[#3a8bff] bg-clip-text text-transparent mb-2">
              {avgWatchTime > 0 ? formatTime(avgWatchTime) : "-"}
            </div>
            <div className="text-sm text-gray-500">per video</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <ShareIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                Total Shares
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#0f5edd] via-[#1c6ff9] to-[#3a8bff] bg-clip-text text-transparent mb-2">
              {totalShares > 0 ? formatNumber(totalShares) : "-"}
            </div>
            <div className="text-sm text-gray-500">across all platforms</div>
          </div>
        </div>

        {/* Traffic Sources - Full Width */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-semibold mb-6">Traffic Sources</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 w-20">
                Direct Link
              </span>
              <div className="flex items-center gap-3 flex-1 ml-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#0f5edd] via-[#1c6ff9] to-[#3a8bff] h-2 rounded-full"
                    style={{
                      width: `${
                        totalShareBreakdown > 0
                          ? (shareBreakdown.copy / totalShareBreakdown) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8">
                  {totalShareBreakdown > 0
                    ? Math.round(
                        (shareBreakdown.copy / totalShareBreakdown) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 w-20">
                Email
              </span>
              <div className="flex items-center gap-3 flex-1 ml-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#0f5edd] via-[#1c6ff9] to-[#3a8bff] h-2 rounded-full"
                    style={{
                      width: `${
                        totalShareBreakdown > 0
                          ? (shareBreakdown.email / totalShareBreakdown) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8">
                  {totalShareBreakdown > 0
                    ? Math.round(
                        (shareBreakdown.email / totalShareBreakdown) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 w-20">
                SMS
              </span>
              <div className="flex items-center gap-3 flex-1 ml-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#0f5edd] via-[#1c6ff9] to-[#3a8bff] h-2 rounded-full"
                    style={{
                      width: `${
                        totalShareBreakdown > 0
                          ? (shareBreakdown.sms / totalShareBreakdown) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-8">
                  {totalShareBreakdown > 0
                    ? Math.round(
                        (shareBreakdown.sms / totalShareBreakdown) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Videos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Top Performing Videos</h3>
            <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
              Top 5
            </span>
          </div>

          {/* Table Header - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 text-sm font-medium text-gray-600">
            <div className="col-span-6">Video Title</div>
            <div className="col-span-2 text-center">Views</div>
            <div className="col-span-2 text-center">Avg. Watch %</div>
            <div className="col-span-2 text-center">Shares</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-3 mt-3">
            {topVideos.length > 0 ? (
              topVideos.map((video, index) => (
                <div key={video._id}>
                  {/* Desktop Layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 py-2 text-sm">
                    <div className="col-span-6 flex items-center gap-2">
                      <GoDeviceCameraVideo className="text-blue-600 w-4 h-4" />
                      <span className="font-medium truncate">
                        {video.title || "Untitled Video"}
                      </span>
                    </div>
                    <div className="col-span-2 text-center font-medium">
                      {video.viewCount || "-"}
                    </div>
                    <div className="col-span-2 text-center font-medium">
                      {video.viewCount > 0 &&
                      video.totalWatchTime > 0 &&
                      video.duration
                        ? `${Math.round(
                            (video.totalWatchTime /
                              video.viewCount /
                              (parseInt(video.duration) * 60)) *
                              100
                          )}%`
                        : "-"}
                    </div>
                    <div className="col-span-2 text-center font-medium">
                      {video.shareCount || "-"}
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <GoDeviceCameraVideo className="text-blue-600 w-4 h-4 flex-shrink-0" />
                      <span className="font-medium text-sm truncate">
                        {video.title || "Untitled Video"}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views</span>
                        <span className="font-medium text-gray-800">
                          {video.viewCount || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg. Watch %</span>
                        <span className="font-medium text-gray-800">
                          {video.viewCount > 0 &&
                          video.totalWatchTime > 0 &&
                          video.duration
                            ? `${Math.round(
                                (video.totalWatchTime /
                                  video.viewCount /
                                  (parseInt(video.duration) * 60)) *
                                  100
                              )}%`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shares</span>
                        <span className="font-medium text-gray-800">
                          {video.shareCount || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No videos found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
