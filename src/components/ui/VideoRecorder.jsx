import { IoMdPause } from "react-icons/io";
import { FaPlay } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import React, { useEffect, useRef, useState } from "react";
import RecordRTC from "recordrtc";

import axios from "axios";
import { MdEmail } from "react-icons/md";
import { FaLink } from "react-icons/fa";
import { MdSms } from "react-icons/md"; // For SMS icon

import { RiDragMove2Fill } from "react-icons/ri";
import { useParams } from "react-router-dom";
import {
  getFreshVideoData,
  getSignedUrl,
  saveCustomRecordedVideo,
} from "../../api/libraryAPIs";
import { useGlobalModals } from "../../store/globalModals";

function VideoRecorder() {
  //get params acces token

  const { accessToken } = useParams();
  const [step, setStep] = useState("idle");

  const [linkCopied, setLinkCopied] = useState(false);

  const [freshVideoKey, setFreshVideoKey] = useState(null);

  const setIsShareVideoModalOpen = useGlobalModals(
    (state) => state.setIsShareVideoModalOpen
  );

  const setVideoToBeShared = useGlobalModals(
    (state) => state.setVideoToBeShared
  );

  const activeTab = useGlobalModals((state) => state.activeTab);
  const setActiveTab = useGlobalModals((state) => state.setActiveTab);

  const [isPreparing, setIsPreparing] = useState(false);

  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [includeScreen, setIncludeScreen] = useState("no");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState({
    camera: "unknown",
    microphone: "unknown",
  });
  const [countdown, setCountdown] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [cameraPosition, setCameraPosition] = useState({
    x: 32,
    y: window.innerHeight - 280,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Pause state
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);
  const pauseStartRef = useRef(null);
  const recordingStartTimeRef = useRef(null);

  const videoPreviewRef = useRef(null);
  const camPreviewRef = useRef(null);
  const screenStreamRef = useRef(null);
  const camStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef([]); // Use array to store multiple timeout IDs

  const formatElapsed = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const two = (n) => String(n).padStart(2, "0");
    return hours > 0
      ? `${hours}:${two(minutes)}:${two(seconds)}`
      : `${minutes}:${two(seconds)}`;
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    setCameraPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Reset camera position when camera is turned off
  useEffect(() => {
    if (selectedCamera === "off") {
      setCameraPosition({
        x: 32,
        y: window.innerHeight - 100, // 40px for the button height
      });
    } else {
      setCameraPosition({
        x: 32,
        y: window.innerHeight - 280, // Default for camera on
      });
    }
  }, [selectedCamera]);

  useEffect(() => {
    async function checkPermissions() {
      try {
        const camera = await navigator.permissions.query({ name: "camera" });
        const microphone = await navigator.permissions.query({
          name: "microphone",
        });
        setPermissionStatus({
          camera: camera.state,
          microphone: microphone.state,
        });
      } catch (err) {
        console.warn("Permission query not supported:", err);
      }
    }
    checkPermissions();
  }, []);

  useEffect(() => {
    async function loadDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(devices.filter((d) => d.kind === "videoinput"));
        setMics(devices.filter((d) => d.kind === "audioinput"));
      } catch (err) {
        console.error("Failed to enumerate devices:", err);
        alert(
          "Unable to access media devices. Please ensure camera and microphone permissions are granted."
        );
      }
    }
    loadDevices();
    navigator.mediaDevices.addEventListener("devicechange", loadDevices);
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", loadDevices);
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (step !== "recording") return;
    const camStream = camStreamRef.current;
    if (!camStream) return;

    const safelyPlay = (el) => {
      if (!el) return;
      const tryPlay = () => {
        el.play().catch(() => setTimeout(() => el.play().catch(() => {}), 100));
      };
      if (el.readyState >= 2) tryPlay();
      else el.onloadedmetadata = () => tryPlay();
    };

    if (camPreviewRef.current) {
      camPreviewRef.current.srcObject = camStream;
      safelyPlay(camPreviewRef.current);
    }

    if (!includeScreen && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = camStream;
      safelyPlay(videoPreviewRef.current);
    }
  }, [step, includeScreen]);

  useEffect(() => {
    if (step === "setup" && selectedCamera === "off") {
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
    }
  }, [selectedCamera, step]);

  useEffect(() => {
    if (selectedCamera === "off") setIncludeScreen("yes");
  }, [selectedCamera]);

  useEffect(() => {
    if (step !== "setup") return;
    const reinit = async () => {
      if (camStreamRef.current) {
        try {
          camStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch (_) {}
        camStreamRef.current = null;
      }

      if (selectedCamera === "off") {
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
        return;
      }

      try {
        const newCam = await navigator.mediaDevices.getUserMedia({
          video: selectedCamera
            ? { deviceId: { exact: selectedCamera } }
            : true,
          audio: false,
        });
        camStreamRef.current = newCam;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = newCam;
          const el = videoPreviewRef.current;
          const tryPlay = () =>
            el
              .play()
              .catch(() => setTimeout(() => el.play().catch(() => {}), 100));
          if (el.readyState >= 2) tryPlay();
          else el.onloadedmetadata = () => tryPlay();
        }
      } catch (err) {
        console.error("Failed to init selected camera:", err);
        alert(
          `Failed to access camera: ${err.message}. Please check permissions.`
        );
      }
    };
    reinit();
  }, [selectedCamera, step]);

  // Fixed timer effect
  useEffect(() => {
    if (step === "recording" && !isPaused) {
      const updateTimer = () => {
        if (recordingStartTimeRef.current) {
          const currentTime = Date.now();
          const totalPausedTime =
            pausedTime +
            (pauseStartRef.current ? currentTime - pauseStartRef.current : 0);
          const actualElapsed =
            currentTime - recordingStartTimeRef.current - totalPausedTime;
          setElapsedMs(actualElapsed);
        }
      };

      // Update immediately
      updateTimer();

      // Then set interval
      timerRef.current = setInterval(updateTimer, 500);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [step, isPaused, pausedTime]);

  const pauseRecording = () => {
    if (recorderRef.current && !isPaused) {
      recorderRef.current.pauseRecording();
      setIsPaused(true);
      pauseStartRef.current = Date.now();

      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (recorderRef.current && isPaused) {
      recorderRef.current.resumeRecording();
      setIsPaused(false);

      // Add the pause duration to pausedTime
      if (pauseStartRef.current) {
        const pauseDuration = Date.now() - pauseStartRef.current;
        setPausedTime((prev) => prev + pauseDuration);
        pauseStartRef.current = null;
      }

      // Timer will restart automatically due to useEffect
    }
  };

  const checkMediaPermissions = async () => {
    try {
      const cameraPermission = await navigator.permissions.query({
        name: "camera",
      });
      const micPermission = await navigator.permissions.query({
        name: "microphone",
      });
      if (
        cameraPermission.state === "denied" ||
        micPermission.state === "denied"
      ) {
        alert(
          "Camera or microphone access is denied. Please enable permissions in your browser settings:\n1. Go to browser settings.\n2. Find Privacy or Security.\n3. Allow camera and microphone access for this site."
        );
        return false;
      }
      return true;
    } catch (err) {
      console.warn("Permission query not supported or failed:", err);
      return true;
    }
  };

  const handleStartSetup = () => {
    setStep("name-input"); // NEW: Show name input first
  };

  const handleContinueFromNameInput = async () => {
    if (!videoTitle.trim()) {
      setTitleError("Video title cannot be empty");
      return;
    }

    // Clear error and proceed to setup
    setTitleError("");

    // Now check permissions and start setup
    const hasPermissions = await checkMediaPermissions();
    if (!hasPermissions) return;

    try {
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const hasVideo = camStream.getVideoTracks().length > 0;
      const hasAudio = camStream.getAudioTracks().length > 0;
      if (!hasVideo || !hasAudio) {
        alert(
          `Warning: ${!hasVideo ? "Camera" : ""}${
            !hasVideo && !hasAudio ? " and " : ""
          }${!hasAudio ? "Microphone" : ""} access was not granted.`
        );
      }
      camStreamRef.current = camStream;
      setStep("setup");
      setTimeout(() => {
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = camStream;
          videoPreviewRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error("Media error:", err);
      alert(
        `Camera or mic permission denied: ${err.message}\n\nTo enable permissions:\n1. Go to browser settings.\n2. Find Privacy or Security.\n3. Allow camera and microphone access for this site.`
      );
    }
  };

  // const handleStartSetup = async () => {
  //   const hasPermissions = await checkMediaPermissions();
  //   if (!hasPermissions) return;

  //   try {
  //     const camStream = await navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: true,
  //     });
  //     const hasVideo = camStream.getVideoTracks().length > 0;
  //     const hasAudio = camStream.getAudioTracks().length > 0;
  //     if (!hasVideo || !hasAudio) {
  //       alert(
  //         `Warning: ${!hasVideo ? "Camera" : ""}${
  //           !hasVideo && !hasAudio ? " and " : ""
  //         }${!hasAudio ? "Microphone" : ""} access was not granted.`
  //       );
  //     }
  //     camStreamRef.current = camStream;
  //     setStep("setup");
  //     setTimeout(() => {
  //       if (videoPreviewRef.current) {
  //         videoPreviewRef.current.srcObject = camStream;
  //         videoPreviewRef.current.play();
  //       }
  //     }, 100);
  //   } catch (err) {
  //     console.error("Media error:", err);
  //     alert(
  //       `Camera or mic permission denied: ${err.message}\n\nTo enable permissions:\n1. Go to browser settings.\n2. Find Privacy or Security.\n3. Allow camera and microphone access for this site.`
  //     );
  //   }
  // };

  const startRecording = async () => {
    const hasPermissions = await checkMediaPermissions();
    if (!hasPermissions) return;

    if (includeScreen === "yes") {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenStreamRef.current = screenStream;
        console.log("Screen tracks:", screenStream.getTracks());

        const screenVideoTrack = screenStream.getVideoTracks()[0];
        if (screenVideoTrack) {
          screenVideoTrack.onended = () => {
            alert("Screen sharing was stopped.");
            stopRecording();
          };
        }
      } catch (err) {
        if (err.name === "NotAllowedError") {
          alert("Screen sharing permission was denied or canceled.");
        } else {
          console.error("Screen share error:", err);
          alert(`Failed to start screen sharing: ${err.message}`);
        }
        return;
      }
    }

    setCountdown(3);
    setStep("countdown");

    // Clear any existing timeouts
    countdownRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    countdownRef.current = [];

    // Set new timeouts and store their IDs
    countdownRef.current.push(setTimeout(() => setCountdown(2), 1000));
    countdownRef.current.push(setTimeout(() => setCountdown(1), 2000));
    countdownRef.current.push(
      setTimeout(() => {
        setCountdown(null);
        countdownRef.current = [];
        beginRecording();
      }, 3000)
    );
  };

  const handleSkipCountdown = () => {
    // Clear all timeouts
    countdownRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    countdownRef.current = [];
    setCountdown(null);
    beginRecording();
  };

  const beginRecording = async () => {
    try {
      let streamToRecord = new MediaStream();
      let videoStream;

      let micStream;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
        });
        micStreamRef.current = micStream;
        console.log("Microphone tracks:", micStream.getAudioTracks());
      } catch (err) {
        console.error("Failed to access microphone:", err);
        alert(
          `Failed to access microphone: ${err.message}. Recording will proceed without audio.`
        );
      }

      if (selectedCamera !== "off") {
        const camPreviewStream = await navigator.mediaDevices.getUserMedia({
          video: selectedCamera
            ? { deviceId: { exact: selectedCamera } }
            : true,
          audio: false,
        });
        camStreamRef.current = camPreviewStream;
        console.log("Camera tracks:", camPreviewStream.getVideoTracks());
        if (camPreviewRef.current) {
          camPreviewRef.current.srcObject = camPreviewStream;
          const previewEl = camPreviewRef.current;
          const playPreview = () =>
            previewEl
              .play()
              .catch(() =>
                setTimeout(() => previewEl.play().catch(() => {}), 100)
              );
          if (previewEl.readyState >= 2) playPreview();
          else previewEl.onloadedmetadata = () => playPreview();
        }
      } else {
        if (camPreviewRef.current) camPreviewRef.current.srcObject = null;
        camStreamRef.current = null;
      }

      if (includeScreen === "yes") {
        videoStream = screenStreamRef.current;
      } else {
        videoStream = camStreamRef.current;
      }

      if (videoStream) {
        videoStream
          .getVideoTracks()
          .forEach((track) => streamToRecord.addTrack(track));
      }
      if (micStream) {
        micStream
          .getAudioTracks()
          .forEach((track) => streamToRecord.addTrack(track));
      }

      console.log("Recording stream tracks:", streamToRecord.getTracks());

      if (streamToRecord.getTracks().length === 0) {
        alert("No video or audio tracks available for recording.");
        return;
      }

      recorderRef.current = new RecordRTC(streamToRecord, {
        type: "video",
        mimeType: "video/webm;codecs=vp8,opus",
        disableLogs: false,
      });

      // Set recording start time and reset pause states
      recordingStartTimeRef.current = Date.now();
      setElapsedMs(0);
      setPausedTime(0);
      setIsPaused(false);
      pauseStartRef.current = null;

      recorderRef.current.startRecording();
      setStep("recording");
    } catch (err) {
      console.error("Recording error:", err);
      alert(
        `Recording failed: ${err.message}\n\nTo enable permissions:\n1. Go to browser settings.\n2. Find Privacy or Security.\n3. Allow camera and microphone access for this site.`
      );
    }
  };

  const stopRecording = () => {
    // If paused, resume briefly to ensure clean stop
    if (isPaused && recorderRef.current) {
      recorderRef.current.resumeRecording();
    }

    if (recorderRef.current) {
      // Log initial stream state
      console.log("Pre-stop streams:", {
        screen: screenStreamRef.current?.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
        })),
        cam: camStreamRef.current?.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
        })),
        mic: micStreamRef.current?.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
        })),
        recorder: recorderRef.current?.stream?.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
        })),
      });

      recorderRef.current.stopRecording(() => {
        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Get recorded blob
        const blob = recorderRef.current.getBlob();
        console.log("Recording blob size:", blob.size);
        /* Download Video If you want
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "recording.webm";
        link.click();
        URL.revokeObjectURL(link.href);
        return;
        */
        const url = URL.createObjectURL(blob);

        setRecordedBlob(blob);
        setRecordedUrl(url);

        // Stop all media tracks
        const stopTracks = (stream, name) => {
          if (stream) {
            try {
              stream.getTracks().forEach((track) => {
                track.enabled = false;
                track.stop();
                console.log(`Stopped ${track.kind} track in ${name}`);
              });
              stream.getTracks().forEach((track) => track.stop()); // Double-stop to ensure release
            } catch (err) {
              console.warn(`Error stopping tracks in ${name}:`, err);
            }
          }
        };

        // Stop streams
        stopTracks(screenStreamRef.current, "screenStreamRef");
        stopTracks(camStreamRef.current, "camStreamRef");
        stopTracks(micStreamRef.current, "micStreamRef");
        stopTracks(recorderRef.current?.stream, "recorderRef.stream");

        // Clear stream references
        screenStreamRef.current = null;
        camStreamRef.current = null;
        micStreamRef.current = null;
        if (recorderRef.current) {
          recorderRef.current.stream = null;
          recorderRef.current = null;
        }

        // Clear video elements
        if (camPreviewRef.current) {
          camPreviewRef.current.srcObject = null;
          camPreviewRef.current.src = "";
          camPreviewRef.current.pause();
          camPreviewRef.current.removeAttribute("src");
          camPreviewRef.current.load(); // Force reset
        }
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
          videoPreviewRef.current.src = "";
          videoPreviewRef.current.pause();
          videoPreviewRef.current.removeAttribute("src");
          videoPreviewRef.current.load();
        }

        // Log post-stop state
        console.log("Post-stop streams:", {
          screen: screenStreamRef.current,
          cam: camStreamRef.current,
          mic: micStreamRef.current,
          recorder: recorderRef.current?.stream,
          camPreviewSrc: camPreviewRef.current?.src,
          videoPreviewSrc: videoPreviewRef.current?.src,
        });

        // Reset pause states
        setIsPaused(false);
        setPausedTime(0);
        pauseStartRef.current = null;
        recordingStartTimeRef.current = null;

        setStep("review");
      });
    }
  };

  const cleanup = () => {
    // Reset pause states
    setIsPaused(false);
    setPausedTime(0);
    pauseStartRef.current = null;
    recordingStartTimeRef.current = null;

    const stopTracks = (stream, name) => {
      if (stream) {
        try {
          stream.getTracks().forEach((track) => {
            track.enabled = false;
            track.stop();
            console.log(`Stopped ${track.kind} track in cleanup (${name})`);
          });
        } catch (err) {
          console.warn(`Error stopping tracks in cleanup (${name}):`, err);
        }
      }
    };

    stopTracks(screenStreamRef.current, "screenStreamRef");
    stopTracks(camStreamRef.current, "camStreamRef");
    stopTracks(micStreamRef.current, "micStreamRef");
    stopTracks(recorderRef.current?.stream, "recorderRef.stream");

    screenStreamRef.current = null;
    camStreamRef.current = null;
    micStreamRef.current = null;
    if (recorderRef.current) {
      recorderRef.current.stream = null;
      recorderRef.current = null;
    }

    if (camPreviewRef.current) {
      camPreviewRef.current.srcObject = null;
      camPreviewRef.current.src = "";
      camPreviewRef.current.pause();
      camPreviewRef.current.removeAttribute("src");
      camPreviewRef.current.load();
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
      videoPreviewRef.current.src = "";
      videoPreviewRef.current.pause();
      videoPreviewRef.current.removeAttribute("src");
      videoPreviewRef.current.load();
    }

    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
      setRecordedBlob(null);
    }
  };

  const handleCancel = () => {
    cleanup();
    setStep("idle");
    setVideoTitle("");
    setTitleError("");
    setUploadProgress(0);
  };

  // const handleContinueReview = () => {
  //   setStep("rename");
  // };
  const handleContinueReview = async () => {
    // Go directly to uploading (skip rename step)
    setStep("uploading");
    setUploadProgress(0);

    try {
      // Step 1: Get presigned URL from backend
      const response = await getSignedUrl(`${videoTitle}.webm`, "video/webm");
      const { url, key } = response.data;
      setFreshVideoKey(key);

      // Step 2: Upload video to S3
      await axios.put(url, recordedBlob, {
        headers: {
          "Content-Type": "video/webm",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      // Step 3: Calculate video size (ADD THIS PART)
      const videoSizeMB = recordedBlob.size / (1024 * 1024); // Convert bytes to MB
      const roundedVideoSize = Math.ceil(videoSizeMB); // Always round UP (4.1 → 5, 4.9 → 5)

      // Step 3: Create metadata object
      const formattedDuration = formatDurationForDisplay(elapsedMs);
      const videoData = {
        title: videoTitle,
        key: key,
        duration: formattedDuration,
        size: roundedVideoSize,
      };

      const response2 = await saveCustomRecordedVideo({
        videoData,
        accessToken,
      });

      if (response2.success) {
        setUploadProgress(100);
        setStep("upload-success");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.response?.data?.message || "Upload failed!");
      setStep("review"); // Go back to review on error
      setUploadProgress(0);
    }
  };

  // const handleContinueRename = async () => {
  //   if (!videoTitle.trim()) {
  //     setTitleError("Video title cannot be empty");
  //     return;
  //   }

  //   if (!recordedBlob) {
  //     console.error("No recorded blob found!");
  //     setTitleError("No video recorded. Please try again.");
  //     return;
  //   }

  //   setStep("uploading");
  //   setUploadProgress(0);

  //   try {
  //     // Step 1: Get presigned URL from backend
  //     const response = await getSignedUrl(`${videoTitle}.webm`, "video/webm");
  //     const { url, key } = response.data;
  //     setFreshVideoKey(key);

  //     // Step 2: Upload video to S3
  //     await axios.put(url, recordedBlob, {
  //       headers: {
  //         "Content-Type": "video/webm",
  //       },
  //       onUploadProgress: (progressEvent) => {
  //         if (progressEvent.total) {
  //           const percentCompleted = Math.round(
  //             (progressEvent.loaded * 100) / progressEvent.total
  //           );
  //           setUploadProgress(percentCompleted);
  //         }
  //       },
  //     });

  //     // Step 3: Create metadata object - Convert to human readable format
  //     const formattedDuration = formatDurationForDisplay(elapsedMs);
  //     console.log("Duration:", elapsedMs + "ms -> " + formattedDuration);

  //     // Step 3: Create metadata object
  //     const videoData = {
  //       title: videoTitle,
  //       key: key,
  //       duration: formattedDuration, // Now sending as string like "1m 34s"
  //     };
  //     console.log("Video metadata to save:", videoData);

  //     const response2 = await saveCustomRecordedVideo({
  //       videoData,
  //       accessToken,
  //     });

  //     if (response2.success) {
  //       setUploadProgress(100);
  //       setStep("upload-success");
  //     }

  //     // Step 4: Send metadata to backend
  //     // await axios.post(`${BASE_URL}/video/save-video`, videoData, {
  //     //   headers: { "Content-Type": "application/json" },
  //     // });

  //     // Step 5: Show success and close
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //     setTitleError(error.response?.data?.message || "Upload failed!");
  //     setStep("rename");
  //     setUploadProgress(0);
  //   }
  // };

  const handleUploadSuccessClose = () => {
    handleCancel();
    // Optional: hard refresh if needed
    window.location.reload();
  };

  //FORMATTED TIME
  const formatDurationForDisplay = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      // If seconds is 0, just show minutes, otherwise show both
      return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  //Helper function for pooling

  const pollVideoStatus = async ({ freshVideoKey, accessToken }) => {
    const maxAttempts = 10; // ~10 attempts
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const result = await getFreshVideoData({ freshVideoKey, accessToken });
        const freshVideo = result.video;

        if (freshVideo.eventProcessed) {
          return freshVideo; // ✅ READY
        }

        await new Promise((res) => setTimeout(res, 2000)); // wait 2s
      } catch (err) {
        console.error("Polling error:", err);
      }
    }

    return null; // ❌ timeout
  };

  // Function for handling copy Link

  const handleCopyLink = async () => {
    const CLOUDFRONT_BASE = "https://d27zhkbo74exx9.cloudfront.net";
    const videoLink = `${CLOUDFRONT_BASE}/${freshVideoKey}`;

    try {
      await navigator.clipboard.writeText(videoLink);
      setLinkCopied(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = videoLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50">
      {step === "idle" && (
        <button
          onClick={handleStartSetup}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Record Custom Video
        </button>
      )}

      {step === "name-input" && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-[650px] max-w-[95vw] flex flex-col gap-6 shadow-2xl border border-gray-200">
            <div className="text-left mb-2">
              <h2 className="text-2xl font-bold text-gray-800">
                New Video Record
              </h2>
            </div>

            <label className="flex flex-col">
              <span className=" font-semibold text-gray-700">
                Recording Name
              </span>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Name must be at least 3 characters long
              </p>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => {
                  setVideoTitle(e.target.value);
                  setTitleError("");
                }}
                placeholder="Enter a title for your video..."
                className={`p-3 w-full text-base rounded-lg border ${
                  titleError ? "border-red-500" : "border-gray-300"
                } bg-white shadow-sm focus:outline-none focus:ring-2 ${
                  titleError ? "focus:ring-red-500" : "focus:ring-blue-500"
                } transition-all`}
              />
              {titleError && (
                <p className="text-red-500 text-sm mt-2 font-medium">
                  {titleError}
                </p>
              )}
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleContinueFromNameInput}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Continue
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-white text-gray-700 font-semibold border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {(step === "setup" || step === "review") && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-[960px] max-w-[95vw] flex flex-col gap-6 shadow-2xl border border-gray-200">
            {step === "setup" && (
              <div className="flex gap-8">
                <div className="flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Camera Preview
                    </h3>
                  </div>
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-300">
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-video bg-gray-900 object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-5 justify-center">
                  <label className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 mb-2">
                      Camera
                    </span>
                    <select
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value)}
                      className="p-3 w-full text-base rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Default Camera</option>
                      <option value="off">Camera Off</option>
                      {cameras.map((cam) => (
                        <option key={cam.deviceId} value={cam.deviceId}>
                          {cam.label || "Camera"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 mb-2">
                      Microphone
                    </span>
                    <select
                      value={selectedMic}
                      onChange={(e) => setSelectedMic(e.target.value)}
                      className="p-3 w-full text-base rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Default Microphone</option>
                      {mics.map((mic) => (
                        <option key={mic.deviceId} value={mic.deviceId}>
                          {mic.label || "Mic"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 mb-2">
                      Screen Share
                    </span>
                    <select
                      value={includeScreen}
                      onChange={(e) => setIncludeScreen(e.target.value)}
                      className="p-3 w-full text-base rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    {includeScreen === "yes" && (
                      <p className="text-sm text-gray-700 mt-2 p-2 bg-yellow-100 rounded-lg">
                        Select "Entire Screen" for better screen recording
                        quality.
                      </p>
                    )}
                  </label>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={startRecording}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Start Recording
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-6 py-3 bg-white text-gray-700 font-semibold border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {step === "review" && (
              <>
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Preview Your Video
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Review your recording before saving
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-300">
                  {/* FINAL RECORDED VIDEO - NO CAMERA BUBBLE, NO CONTROLS */}
                  <video
                    src={recordedUrl}
                    controls
                    className="w-full h-[480px] bg-gray-900"
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleContinueReview}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Continue
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-6 py-3 bg-white text-gray-700 font-semibold border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {(step === "uploading" || step === "upload-success") && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-[650px] max-w-[95vw] flex flex-col gap-6 shadow-2xl border border-gray-200">
            {step === "uploading" && (
              <>
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Uploading Video
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Please wait while your video is being uploaded...
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm font-medium text-gray-700">
                  {uploadProgress}% Complete
                </p>
              </>
            )}
            {step === "upload-success" && (
              <>
                <div className="text-center mb-4 relative">
                  {/* CLOSE BUTTON - ADD THIS */}
                  <button
                    onClick={handleUploadSuccessClose}
                    className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                    aria-label="Close"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 mb-2">
                    Upload Successful!
                  </h2>
                  <p className="text-sm text-gray-500">
                    Your video "{videoTitle}" has been uploaded and saved
                    successfully.
                  </p>
                </div>

                <div className="flex gap-3 w-full">
                  {/* put onclick so it will close and open share modal */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();

                      // Start preparing
                      setIsPreparing(true);

                      try {
                        let result = await getFreshVideoData({
                          freshVideoKey,
                          accessToken,
                        });
                        let freshVideo = result.video;

                        if (!freshVideo.eventProcessed) {
                          console.log("Preview not ready, polling...");

                          const processedVideo = await pollVideoStatus({
                            freshVideoKey,
                            accessToken,
                          });
                          if (!processedVideo) {
                            setIsPreparing(false);
                            alert(
                              "Still processing video preview, try again in a few seconds…"
                            );
                            return;
                          }

                          freshVideo = processedVideo;
                        }

                        setActiveTab("sms"); // Set tab first

                        setVideoToBeShared(freshVideo);
                        setIsShareVideoModalOpen(true);
                        setStep("idle");
                      } catch (error) {
                        console.error("Failed to fetch video data", error);
                        setStep("idle");
                      }
                    }}
                    // Disable button when preparing
                    disabled={isPreparing}
                    className={`flex-1 px-4 py-3 text-white font-semibold rounded-lg shadow-md transform transition-all duration-200 flex items-center justify-center gap-2 ${
                      isPreparing
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    <MdSms className="w-4 h-4" />
                    Send SMS
                  </button>

                  {/* <button
                    onClick={async (e) => {
                      e.stopPropagation();
                          // Start preparing
    setIsPreparing(true);

                      try {
                        let result = await getFreshVideoData({
                          freshVideoKey,
                          accessToken,
                        });
                        let freshVideo = result.video;

                        if (!freshVideo.eventProcessed) {
                          console.log("Preview not ready, polling...");

                          const processedVideo = await pollVideoStatus({
                            freshVideoKey,
                            accessToken,
                          });

                          if (!processedVideo) {
                            setStep("idle");
                            alert(
                              "Still processing video preview, try again in a few seconds…"
                            );
                            return;
                          }

                          freshVideo = processedVideo;
                        }

                        setTabToOpen("email");

                        setVideoToBeShared(freshVideo);
                        setIsShareVideoModalOpen(true);
                        setStep("idle");
                      } catch (error) {
                        console.error("Failed to fetch video data", error);
                        setStep("idle");
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <MdEmail className="w-4 h-4" />
                    Send Email
                  </button> */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();

                      // Start preparing
                      setIsPreparing(true);

                      try {
                        let result = await getFreshVideoData({
                          freshVideoKey,
                          accessToken,
                        });
                        let freshVideo = result.video;

                        if (!freshVideo.eventProcessed) {
                          console.log("Preview not ready, polling...");

                          const processedVideo = await pollVideoStatus({
                            freshVideoKey,
                            accessToken,
                          });

                          if (!processedVideo) {
                            setIsPreparing(false);
                            alert(
                              "Still processing video preview, try again in a few seconds…"
                            );
                            return;
                          }

                          freshVideo = processedVideo;
                        }

                        setActiveTab("email"); // Set tab first
                        setVideoToBeShared(freshVideo);
                        setIsShareVideoModalOpen(true);
                        setIsPreparing(false);
                      } catch (error) {
                        console.error("Failed to fetch video data", error);
                        setIsPreparing(false);
                      }
                    }}
                    // Disable button when preparing
                    disabled={isPreparing}
                    className={`flex-1 px-4 py-3 text-white font-semibold rounded-lg shadow-md transform transition-all duration-200 flex items-center justify-center gap-2 ${
                      isPreparing
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    <MdEmail className="w-4 h-4" />
                    {/* Show different text based on state */}
                    {isPreparing ? "Preparing..." : "Send Email"}
                  </button>
                  {/* <button className="flex-1 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
                    <FaLink className="w-4 h-4" />
                    Share Link
                  </button> */}
                  <button
                    onClick={handleCopyLink}
                    className={`flex-1 px-4 py-3 ${
                      linkCopied
                        ? "bg-teal-600 hover:bg-teal-700"
                        : "bg-purple-600 hover:bg-purple-700"
                    } text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2`}
                    disabled={isPreparing}
                  >
                    <FaLink className="w-4 h-4" />
                    {linkCopied ? "Link Copied!" : "Share Link"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-40 h-40 rounded-full flex flex-col items-center justify-center text-white animate-pulse"
              style={{
                background: "#9D50BB",
                background:
                  "-webkit-linear-gradient(to right, #6E48AA, #9D50BB)",
                background: "linear-gradient(to right, #6E48AA, #9D50BB)",
              }}
            >
              <span className="text-6xl font-bold">{countdown}</span>
              <span
                onClick={handleSkipCountdown}
                className="text-sm font-medium text-white cursor-pointer hover:underline"
              >
                Skip
              </span>
            </div>
            <div className="text-center text-white text-sm">
              <p>Preparing to record your screen</p>
              <p className="mt-2">Please wait a moment</p>
            </div>
          </div>
        </div>
      )}
      {step === "recording" && (
        <>
          <div
            className={`fixed z-[9998] ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            } select-none group`}
            style={{
              left: `${cameraPosition.x}px`,
              top: `${cameraPosition.y}px`,
            }}
            onMouseDown={handleMouseDown}
          >
            {selectedCamera !== "off" ? (
              // Camera Bubble when camera is on
              <div className="relative">
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-1 rounded-full shadow-lg">
                  <RiDragMove2Fill className="w-4 h-4" />
                </div>
                <div className="w-[220px] h-[220px] rounded-full overflow-hidden shadow-2xl bg-black border-4 border-white flex items-center justify-center">
                  <video
                    ref={camPreviewRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover bg-black pointer-events-none"
                  />
                </div>
              </div>
            ) : (
              // Small circular drag button when camera is off
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center shadow-2xl border-2 border-white">
                  <IoIosArrowForward className="w-6 h-6" />
                </div>
              </div>
            )}
            {/* Controls - Only show on hover */}
            <div className="mt-1 flex items-center justify-center gap-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-1 shadow-xl border border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300">
              {/* Pause/Resume Button */}
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-xl shadow-lg hover:bg-yellow-700 hover:scale-105 transition-all duration-200 flex items-center justify-center"
                  aria-label="Pause recording"
                  title="Pause recording"
                >
                  <IoMdPause className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 hover:scale-105 transition-all duration-200 flex items-center justify-center"
                  aria-label="Resume recording"
                  title="Resume recording"
                >
                  <FaPlay className="w-5 h-5" />
                </button>
              )}
              {/* Stop Button */}
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 hover:scale-105 transition-all duration-200 flex items-center justify-center"
                aria-label="Stop recording"
                title="Stop recording"
              >
                <div className="w-5 h-5 bg-white rounded-sm" />
              </button>
              {/* Timer */}
              <div
                className={`px-4 py-2 bg-transparent text-white rounded-xl font-mono text-lg font-bold min-w-[80px] text-center ${
                  isPaused ? "opacity-50" : ""
                }`}
              >
                {formatElapsed(elapsedMs)}
                {isPaused && (
                  <span className="text-xs block text-yellow-400">PAUSED</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default VideoRecorder;
