import axios from "axios";

// API to setup loom SDK
export const setupLoomSDK = async () => {
  try {
    const response = await axios.get(
      `https://recording-app-backend.vercel.app/setup`
    );
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
