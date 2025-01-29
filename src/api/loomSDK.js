import axios from "axios";

// API to setup loom SDK
export const setupLoomSDK = async () => {
  try {
    const response = await axios.get(
      `https://konnectvid-backend.vercel.app/setup`
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error setting up Loom SDK: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "Error setting up Loom SDK!",
    };
  }
};
