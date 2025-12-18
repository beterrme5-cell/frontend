import { useState, useRef, useEffect } from "react";
import { Menu, Tabs, Table, Divider } from "@mantine/core";
import { FaPause, FaPlay } from "react-icons/fa6";

export const VideoPlayer = ({
  videoData,
  onPlay,
  onPause,
  captionsEnabled: externalCaptionsEnabled,
  onCaptionsToggle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [shouldAutoPlayGif, setShouldAutoPlayGif] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(
    externalCaptionsEnabled ?? true
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isPortrait, setIsPortrait] = useState(
    window.innerHeight > window.innerWidth
  );
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const CLOUDFRONT_BASE = "https://d27zhkbo74exx9.cloudfront.net";

  const [volume, setVolume] = useState(1); // 0 - 1
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isProgressHovered, setIsProgressHovered] = useState(false);

  // Format time to MM:SS
  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Parse duration string like "23s", "1m", "1m 2s" to seconds
  const parseDurationToSeconds = (durationStr) => {
    if (!durationStr) return 0;

    let totalSeconds = 0;
    // Match minutes: "1m" or "1m "
    const minutesMatch = durationStr.match(/(\d+)m/);
    if (minutesMatch) {
      totalSeconds += parseInt(minutesMatch[1]) * 60;
    }

    // Match seconds: "23s" or " 2s"
    const secondsMatch = durationStr.match(/(\d+)s/);
    if (secondsMatch) {
      totalSeconds += parseInt(secondsMatch[1]);
    }

    return totalSeconds;
  };

  // Get duration from videoData or video element
  const getVideoDuration = () => {
    // First try to parse from videoData.duration
    if (videoData?.duration) {
      const parsedDuration = parseDurationToSeconds(videoData.duration);
      if (parsedDuration > 0) {
        return parsedDuration;
      }
    }
    // Fallback to video element duration
    if (videoRef.current?.duration && isFinite(videoRef.current.duration)) {
      return videoRef.current.duration;
    }
    return 0;
  };

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      // Use videoData.duration first, then fallback to video.duration
      const parsedDuration = getVideoDuration();
      if (parsedDuration > 0) {
        setDuration(parsedDuration);
      } else {
        setDuration(videoRef.current.duration || 0);
      }

      // Only reset to beginning on very first load - never reset after that
      if (isFirstLoad) {
        videoRef.current.currentTime = 0;
        setIsFirstLoad(false);
      }
      // Otherwise, preserve the current position (don't reset)

      // Initialize captions
      if (videoData.captionKey) {
        const tracks = videoRef.current.textTracks;
        for (let i = 0; i < tracks.length; i++) {
          tracks[i].mode = captionsEnabled ? "showing" : "hidden";
        }
      }

      // Start playing automatically only on first load
      if (isFirstLoad && videoRef.current.paused) {
        videoRef.current.play().catch((err) => {
          console.log("Auto-play prevented:", err);
        });
      }
    }
  };

  // Initialize duration from videoData on mount
  useEffect(() => {
    if (videoData?.duration) {
      const parsedDuration = parseDurationToSeconds(videoData.duration);
      if (parsedDuration > 0) {
        setDuration(parsedDuration);
      }
    }
  }, [videoData?.duration]);

  // Handle video click (play/pause)
  const handleVideoClick = (e) => {
    // Don't toggle if clicking on controls
    if (e.target.closest(".video-controls")) return;
    handlePlayPause();
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        // Resume from current position - the video element maintains currentTime automatically
        // Don't reset currentTime here - just play
        videoRef.current.play().catch((err) => {
          console.log("Play error:", err);
        });
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  // Handle progress bar hover
  const handleProgressHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * duration;
    setHoverTime(time);
    setHoverPosition(e.clientX - rect.left);
  };

  // Handle mute/unmute
  const handleMuteToggle = () => {
    if (!videoRef.current) return;

    if (videoRef.current.muted || volume === 0) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.5; // restore volume
      setVolume(volume || 0.5);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Detect iOS devices
  const isIOS = () => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  };

  // Handle fullscreen
  const handleFullscreen = async () => {
    if (!videoContainerRef.current) return;

    // For iOS devices, use CSS-based fullscreen
    if (isIOS()) {
      setIsFullscreen(!isFullscreen);
      // Lock to landscape on mobile
      if (!isFullscreen && screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape").catch(() => {});
      } else if (
        isFullscreen &&
        screen.orientation &&
        screen.orientation.unlock
      ) {
        screen.orientation.unlock();
      }
      return;
    }

    // For other devices, try native fullscreen API first
    if (!document.fullscreenElement) {
      try {
        await videoContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
        // Lock to landscape on mobile
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock("landscape").catch(() => {});
        }
      } catch (err) {
        // Fallback to CSS-based fullscreen if native API fails
        setIsFullscreen(true);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
        // Unlock orientation
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      } catch (err) {
        setIsFullscreen(false);
      }
    }
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  // Handle captions toggle
  const handleCaptionsToggle = () => {
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      const newState = !captionsEnabled;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = newState ? "showing" : "hidden";
      }
      setCaptionsEnabled(newState);
      if (onCaptionsToggle) {
        onCaptionsToggle(newState);
      }
    }
  };

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Handle fullscreen change and orientation
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Only update state for non-iOS devices using native fullscreen
      if (!isIOS()) {
        const isNowFullscreen = !!document.fullscreenElement;
        setIsFullscreen(isNowFullscreen);

        if (!isNowFullscreen) {
          screen.orientation?.unlock();
        }
      }
    };

    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("resize", handleOrientationChange);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  // Check URL for videoviewer to determine GIF behavior
  useEffect(() => {
    const currentUrl = window.location.href;
    setShouldAutoPlayGif(currentUrl.includes("videoviewer"));
  }, []);

  // Sync external caption state with internal state
  useEffect(() => {
    if (
      externalCaptionsEnabled !== undefined &&
      externalCaptionsEnabled !== captionsEnabled
    ) {
      setCaptionsEnabled(externalCaptionsEnabled);
      if (videoRef.current && videoData.captionKey) {
        const tracks = videoRef.current.textTracks;
        for (let i = 0; i < tracks.length; i++) {
          tracks[i].mode = externalCaptionsEnabled ? "showing" : "hidden";
        }
      }
    }
  }, [externalCaptionsEnabled, captionsEnabled, videoData.captionKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative w-full h-full bg-black group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* If not playing yet → show thumbnail with play overlay */}
      {!isPlaying && currentTime === 0 ? (
        <div
          className="relative w-full h-full"
          onClick={() => {
            setIsPlaying(true);
            // Start playing video when clicking thumbnail
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch((err) => {
                  console.log("Auto-play prevented:", err);
                });
              }
            }, 100);
          }}
        >
          {/* Show GIF or thumbnail based on URL and hover state */}
          <img
            src={
              videoData?.gifKey && (shouldAutoPlayGif || isHovered)
                ? `${CLOUDFRONT_BASE}/${videoData.gifKey}`
                : videoData?.thumbnailKey
                ? `${CLOUDFRONT_BASE}/${videoData.thumbnailKey}`
                : "./imagePlaceholder.jpeg"
            }
            alt="Video Thumbnail"
            className="w-full h-full object-cover"
          />

          {/* Show duration on top right when hovering */}
          {videoData?.duration && (
            <div className="absolute top-2 left-2 bg-black/90 text-white px-2 py-1 rounded-md text-xs font-medium">
              {videoData.duration}
            </div>
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-300 group-hover:bg-black/40">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-blue backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <FaPlay size={22} className="ml-1 text-white" />
            </div>
          </div>
        </div>
      ) : (
        /* Custom video player with custom controls */
        <div
          ref={videoContainerRef}
          className="relative w-full h-full bg-black group flex items-center justify-center"
          style={{
            ...(isFullscreen
              ? {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 9999,
                  ...(window.innerWidth < 768 && isPortrait && isIOS()
                    ? {
                        transform: "rotate(90deg)",
                        transformOrigin: "center center",
                        width: "100vh",
                        height: "100vw",
                      }
                    : {}),
                }
              : {}),
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            if (isPlaying) {
              setShowControls(false);
            }
          }}
          onClick={handleVideoClick}
        >
          <video
            ref={videoRef}
            src={`${CLOUDFRONT_BASE}/${videoData.videoKey}`}
            className="w-full h-full"
            style={{
              objectFit: isFullscreen && isIOS() ? "cover" : "contain"
            }}
            autoPlay={isFirstLoad}
            crossOrigin="anonymous"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => {
              setIsPlaying(true);
              if (onPlay) onPlay(); // ✅ ADD THIS LINE
            }}
            onPause={() => {
              setIsPlaying(false);
              if (onPause) onPause(); // ✅ ADD THIS LINE
              // Ensure currentTime is preserved when paused
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
              setIsFirstLoad(true); // Reset for next play
              // Reset playback speed to 1x when video ends
              if (videoRef.current) {
                videoRef.current.playbackRate = 1;
                setPlaybackRate(1);
              }
            }}
            muted={isMuted}
            playsInline
          >
            {videoData.captionKey && (
              <track
                kind="subtitles"
                src={`${CLOUDFRONT_BASE}/${videoData.captionKey}`}
                srcLang="en"
                label="English"
              />
            )}
          </video>

          {/* Custom Controls Overlay */}
          <div
            className={`video-controls absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            {/* Progress Bar */}
            <div
              className="relative h-1 bg-white/20 cursor-pointer hover:h-1.5 transition-all duration-200 group/progress"
              onClick={handleProgressClick}
              onMouseMove={handleProgressHover}
              onMouseEnter={() => setIsProgressHovered(true)}
              onMouseLeave={() => {
                setIsProgressHovered(false);
                setHoverTime(null);
              }}
            >
              {/* Hover time tooltip */}
              {isProgressHovered && hoverTime !== null && (
                <div
                  className="absolute -top-8 bg-black/90 text-white text-xs px-2 py-1 rounded-md pointer-events-none z-10 transform -translate-x-1/2"
                  style={{
                    left: `${hoverPosition}px`,
                    fontSize: "11px",
                    fontWeight: "500",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {formatTime(hoverTime)}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/90"></div>
                </div>
              )}

              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-100 ease-out relative overflow-hidden"
                style={{
                  width: `${
                    duration > 0
                      ? Math.min((currentTime / duration) * 100, 100)
                      : 0
                  }%`,
                  borderRadius: "2px",
                  boxShadow: "0 0 8px rgba(59, 130, 246, 0.4)",
                }}
              >
                {/* Progress bar glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>

              {/* Progress handle */}
              <div
                className={`absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-lg transform -translate-y-1/2 transition-all duration-200 ${
                  isProgressHovered
                    ? "opacity-100 scale-110"
                    : "opacity-0 scale-75"
                }`}
                style={{
                  left: `${
                    duration > 0
                      ? Math.min((currentTime / duration) * 100, 100)
                      : 0
                  }%`,
                  transform: "translateX(-50%) translateY(-50%)",
                  border: "2px solid rgba(59, 130, 246, 0.8)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-blue-300 transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-white/10"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>

                {/* Time Display */}
                <span
                  className="text-white/90 text-xs sm:text-sm font-medium tracking-wide"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                {/* Volume Control - Button + Slider wrapped together */}
                <div
                  className="relative flex items-center"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                  style={{
                    position: "relative",
                    paddingLeft: showVolumeSlider ? "0px" : "0px",
                    transition: "padding-left 0.2s ease",
                  }}
                >
                  {/* Volume Slider - appears to the left */}
                  {showVolumeSlider && (
                    <div
                      className="absolute bg-black/90 p-1.5 rounded-md flex items-center"
                      style={{
                        width: "80px",
                        right: "120%",
                        marginRight: "-4px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 2000,
                      }}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => {
                          const vol = parseFloat(e.target.value);
                          setVolume(vol);
                          if (videoRef.current) {
                            videoRef.current.volume = vol;
                            videoRef.current.muted = vol === 0;
                          }
                          setIsMuted(vol === 0);
                        }}
                        className="w-full cursor-pointer"
                        style={{
                          height: "4px",
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                            volume * 100
                          }%, rgba(255,255,255,0.3) ${
                            volume * 100
                          }%, rgba(255,255,255,0.3) 100%)`,
                          borderRadius: "2px",
                          outline: "none",
                          appearance: "none",
                          WebkitAppearance: "none",
                        }}
                      />
                    </div>
                  )}

                  {/* Mute/Unmute Button */}
                  <button
                    onClick={handleMuteToggle}
                    className="text-white hover:text-blue-300 transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-white/10"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={{
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                        }}
                      >
                        <path
                          d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                          style={{ borderRadius: "1px" }}
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={{
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                        }}
                      >
                        <path
                          d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                          style={{ borderRadius: "1px" }}
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={handleFullscreen}
                  className="text-white hover:text-blue-300 transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-white/10"
                  aria-label="Fullscreen"
                >
                  {isFullscreen ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                      }}
                    >
                      <path
                        d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
                        style={{ borderRadius: "1px" }}
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      style={{
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                      }}
                    >
                      <path
                        d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                        style={{ borderRadius: "1px" }}
                      />
                    </svg>
                  )}
                </button>

                {/* Three Dot Menu - Captions & Playback Speed */}
                <Menu
                  className="video-menu"
                  shadow="md"
                  width={180}
                  position={isFullscreen ? "bottom-start" : "top-end"}
                  offset={5}
                  withinPortal={!isFullscreen}
                  zIndex={99999}
                  styles={{
                    dropdown: {
                      padding: "6px",
                      backgroundColor: "rgba(0, 0, 0, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      backdropFilter: "blur(12px)",
                      maxHeight: "220px",
                      overflowY: "auto",
                      fontFamily:
                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    },
                    item: {
                      color: "white",
                      fontSize: "13px",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      backgroundColor: "transparent",
                      fontWeight: "500",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        backgroundColor: "rgba(59, 130, 246, 0.8)",
                        color: "white",
                        transform: "translateX(2px)",
                      },
                      "&[data-hovered]": {
                        backgroundColor: "rgba(59, 130, 246, 0.8)",
                        color: "white",
                        transform: "translateX(2px)",
                      },
                      "&[data-disabled]": {
                        opacity: 0.5,
                      },
                    },
                    label: {
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "11px",
                      padding: "8px 14px 6px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    },
                  }}
                >
                  <Menu.Target>
                    <button
                      className="text-white hover:text-blue-300 transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-white/10"
                      aria-label="More options"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        style={{
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                        }}
                      >
                        <path
                          d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                          style={{ borderRadius: "1px" }}
                        />
                      </svg>
                    </button>
                  </Menu.Target>

                  <Menu.Dropdown>
                    {/* Captions Toggle */}
                    {videoData.captionKey && (
                      <Menu.Item onClick={handleCaptionsToggle}>
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12zM7 15h2v-2h2v-2H9V9H7v2H5v2h2v2zm8-4.5c0 .83-.67 1.5-1.5 1.5S12 11.33 12 10.5s.67-1.5 1.5-1.5S15 9.67 15 10.5zm2.5 2.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
                          </svg>
                          <span>Captions</span>
                          {captionsEnabled && (
                            <span className="ml-auto text-xs">✓</span>
                          )}
                        </div>
                      </Menu.Item>
                    )}

                    {/* Divider before playback speed */}
                    {videoData.captionKey && <Divider my="xs" />}

                    {/* Playback Speed Label */}
                    <div className="px-3 py-1 text-xs text-gray-300 font-semibold uppercase tracking-wide">
                      Playback Speed
                    </div>

                    {/* Playback Speed Options */}
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <Menu.Item
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{rate}x</span>
                          {playbackRate === rate && (
                            <span className="text-xs">✓</span>
                          )}
                        </div>
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
