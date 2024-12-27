import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// API to get all videos from the database\
export const getAllVideos = async (accessToken) => {
  // Get the accountId and userLocationId from the Local Storage
  // const accessToken = localStorage.getItem("accessToken");
  try {
    const response = await axios.get(`${BASE_URL}/video/getVideosByAccountId`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
  const accessToken = localStorage.getItem("accessToken");

  try {
    const response = await axios.get(
      `${BASE_URL}/video/getVideoById/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
  const accessToken = localStorage.getItem("accessToken");
  try {
    const response = await axios.post(
      `${BASE_URL}/video/saveNewVideo`,
      videoData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
export const updateVideo = async (params) => {
  const accessToken = localStorage.getItem("accessToken");

  try {
    const response = await axios.put(
      `${BASE_URL}/video/updateVideo`,
      {
        videoId: params.videoId,
        title: params.title,
        description: params.description,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
export const deleteVideo = async (params) => {
  const accessToken = localStorage.getItem("accessToken");

  try {
    const response = await axios.delete(
      `${BASE_URL}/video/deleteVideo/${params.videoId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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

// API to get the Contacts of the user
export const getContacts = async (params) => {
  const accessToken = localStorage.getItem("accessToken");

  try {
    const response = await axios.post(
      `${BASE_URL}/user/getUserContacts`,
      {
        page: params.page,
        pageLimit: params.pageLimit,
        search: params.search,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error while fetching all contacts: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// API to get the user Domain using locationId
export const getUserDomain = async () => {
  const accessToken = localStorage.getItem("accessToken");
  try {
    const response = await axios.get(`${BASE_URL}/user/getUserDomain`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error while fetching user domain: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};
