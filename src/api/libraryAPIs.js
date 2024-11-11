import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// API to get all videos from the database\
export const getAllVideos = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/video/getAllVideos`, {
      withCredentials: true,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error while fetching all videos: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// API to get Speific video from the database by id
export const getVideoById = async (videoId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/video/getVideoById/${videoId}`,
      {
        withCredentials: true,
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error while fetching video by id: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// API to save recorded video to the database
export const saveRecordedVideo = async (videoData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/video/saveNewVideo`,
      videoData,
      {
        withCredentials: true,
      }
    );
    return {
      success: true, // Corrected typo here
      data: response.data,
    };
  } catch (error) {
    console.error("Error while saving recorded video: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// API to update video in the database
export const updateVideo = async (videoId, videoData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/video/updateVideo/${videoId}`,
      videoData,
      {
        withCredentials: true,
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error while updating video: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// API to delete video from the database
export const deleteVideo = async (videoId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/video/deleteVideo/${videoId}`,
      {
        withCredentials: true,
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error while deleting video: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};
