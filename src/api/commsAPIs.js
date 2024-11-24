import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// Get the accountId and userLocationId from the Local Storage
const accessToken = localStorage.getItem("accessToken");

// API to send a SMS to the user
export const sendSMSToSelectedContacts = async (params) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/comms/sendSMS`,
      {
        contactIds: params.contactIds,
        message: params.message,
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
    console.error("Error while sending SMS: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// API to send a Email to the user
export const sendEmailToSelectedContacts = async (params) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/comms/sendEmail`,
      {
        contactIds: params.contactIds,
        message: params.message,
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
    console.error("Error while sending Email: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};
