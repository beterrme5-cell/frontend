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
        tags: params.tags,
        message: params.message,
        sendToAll: params.sendToAll,
        videoId: params.videoId,
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
        sendToAll: params.sendToAll,
        videoId: params.videoId,
        tags: params.tags,
        subject: params.subject,
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

// API to get the History of the Messages sent by the user
export const getHistoryOfMessages = async (accessToken) => {
  try {
    const response = await axios.get(`${BASE_URL}/user/getUserHistories`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error while getting History of Messages: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};

// API to get the Tags of the Contacts of the user
export const getContactTags = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/user/getUserTags`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error while getting Contact Tags: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "An unexpected error occurred",
    };
  }
};
