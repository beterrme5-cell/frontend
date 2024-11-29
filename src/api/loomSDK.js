import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// API to setup loom SDK
export const setupLoomSDK = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/loom/setup`);
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
