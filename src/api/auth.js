import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// API to login User
export const loginUser = async (params) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/user/login`,
      {
        email: params.email,
        password: params.password,
      },
      {
        withCredentials: true,
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error while logging in user: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// API to get the UserData from the Backend
export const getDecryptedUserData = async (params) => {
  try {
    const response = await axios.post(`${BASE_URL}/user/decryptUserToken`, {
      token: params.tokenKey,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error while getting user data: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};
