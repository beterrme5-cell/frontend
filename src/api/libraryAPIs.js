import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// API to get all videos from the database\
// export const getAllVideos = async (accessToken) => {
//   // Get the accountId and userLocationId from the Local Storage
//   // const accessToken = localStorage.getItem("accessToken");
//   try {
//     const response = await axios.get(`${BASE_URL}/video/getVideosByAccountId`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });
//     return {
//       success: true,
//       data: response.data,
//     };
//   } catch (error) {
//     console.error("Error while fetching all videos: ", error);
//     return {
//       success: false,
//       error: error.response?.data?.message || "Could not fetch videos!",
//     };
//   }
// };

export const getAllVideos = async (accessToken, page = 1, limit = 10) => {
  console.log("Base URL:", BASE_URL);
  try {
    const response = await axios.get(`${BASE_URL}/video/getVideosByAccountId`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error while fetching all videos: ", error);
    throw new Error(error.response?.data?.message || "Could not fetch videos!");
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
      error: error.response?.data?.message || "Could not fetch video Details!",
    };
  }
};

// API to save recorded video to the database
export const saveRecordedVideo = async ({ videoData, accessToken }) => {
  // const accessToken = localStorage.getItem("accessToken");
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
      error: error.response?.data?.message || "Could not save video!",
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
      error: error.response?.data?.message || "Could not update video!",
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
      error: error.response?.data?.message || "Could not delete video!",
    };
  }
};

// API to get the Contacts of the user
export const getContacts = async ({ page, pageLimit, search }) => {
  const accessToken = localStorage.getItem("accessToken");

  try {
    const response = await axios.get(
      `${BASE_URL}/user/getUserContacts?page=${page}&pageLimit=${pageLimit}&search=${search}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.contacts;
  } catch (error) {
    console.error("Error while fetching all contacts: ", error);
    throw new Error(
      error.response?.data?.message || "Could not fetch contacts!"
    );
  }
};

// API to get the user Domain using locationId
export const getUserDomain = async (accessToken) => {
  try {
    const response = await axios.get(`${BASE_URL}/user/getUserDomain`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error while fetching user domain: ", error);
    throw new Error(
      error.response?.data?.message || "Could not fetch user domain!"
    );
  }
};

// API to update the User Domain
export const updateUserDomain = async ({ domain, showPopupAgain }) => {
  const accessToken = localStorage.getItem("accessToken");
  try {
    const response = await axios.patch(
      `${BASE_URL}/user/updateUserDomain`,
      {
        domain: domain,
        showPopupAgain: showPopupAgain,
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
    console.error("Error while updating user domain: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "Could not update user domain!",
    };
  }
};

export const getSignedUrl = async (fileName, fileType) => {
  console.log("Get Signed URL called", fileName, fileType);
  try {
    const response = await axios.post(
      `${BASE_URL}/video/getSignedUrl`,
      {
        fileName: fileName,
        fileType: fileType,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("Get Signed URL response", response);
    return response;
  } catch (error) {
    console.error("Error while getting presigned url: ", error);
    throw new Error(
      error.response?.data?.message || "Could not get presigned URL!"
    );
  }
};

//API to save custome recorded Video
export const saveCustomRecordedVideo = async ({ videoData, accessToken }) => {
  // const accessToken = localStorage.getItem("accessToken");
  try {
    const response = await axios.post(
      `${BASE_URL}/video/saveCustomNewVideo`,
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
    console.error("Error while saving custome recorded video: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "Could not save custom video!",
    };
  }
};

//API to save custome recorded Video

export const getFreshVideoData = async ({ freshVideoKey, accessToken }) => {
  console.log("Get Fresh Video Data called", freshVideoKey, accessToken);
  try {
    const response = await axios.get(`${BASE_URL}/video/getFreshVideoById`, {
      params: {
        videoKey: freshVideoKey,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error while fetching Fresh Video: ", error);
    throw new Error(
      error.response?.data?.message || "Could not fetch Fresh Video!"
    );
  }
};

// get video for video viewer

export const getVideoViewerData = async ({ id }) => {
  console.log("Get Fresh Video Data called", id);
  console.log("BASE URL", BASE_URL);
  try {
    const response = await axios.get(`${BASE_URL}/video/getVideoViewerData`, {
      params: {
        id: id,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error while fetching Fresh Video: ", error);
    throw new Error(
      error.response?.data?.message || "Could not fetch Fresh Video!"
    );
  }
};

// ✅ ADD THIS NEW FUNCTION
export const incrementVideoView = async ({ videoId, watchTime }) => {
  try {
    const response = await axios.post(`${BASE_URL}/video/incrementView`, {
      videoId: videoId,
      watchTime: watchTime,
    });

    return response.data;
  } catch (error) {
    console.error("Error incrementing view:", error);
    throw new Error(
      error.response?.data?.message || "Could not increment view!"
    );
  }
};

export const incrementVideoShare = async ({ videoId, shareCount, shareType }) => {
  try {
    const response = await axios.post(`${BASE_URL}/video/incrementShare`, {
      videoId: videoId,
      shareCount: shareCount,
      shareType: shareType,
    });

    return response.data;
  } catch (error) {
    console.error("Error incrementing share:", error);
    throw new Error(
      error.response?.data?.message || "Could not increment share!"
    );
  }
};
