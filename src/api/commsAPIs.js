import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// API to send a SMS to the user
// export const sendSMSToSelectedContacts = async (params) => {
//   // Get the accountId and userLocationId from the Local Storage
//   const accessToken = localStorage.getItem("accessToken");
//   try {
//     const response = await axios.post(
//       `${BASE_URL}/comms/sendSMS`,
//       {
//         contactIds: params.contactIds,
//         tags: params.tags,
//         message: params.message,
//         videoId: params.videoId,
//         sendAttachment: params.sendAttachment,
//         uploadedVideoName: params.uploadedVideoName,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );
//     return {
//       success: true,
//       data: response.data,
//     };
//   } catch (error) {
//     console.error("Error while sending SMS: ", error);
//     return {
//       success: false,
//       error: error.response?.data?.message || "Could not send SMS!",
//     };
//   }
// };

// API to send a SMS to the user
export const sendSMSToSelectedContacts = async (params) => {
  // Get the accountId and userLocationId from the Local Storage
  const accessToken = localStorage.getItem("accessToken");
  try {
    const requestBody = {
      contactIds: params.contactIds,
      tags: params.tags,
      message: params.message,
      sendAttachment: params.sendAttachment,
      uploadedVideoName: params.uploadedVideoName,
    };

    // Add video fields based on schema
    if (params.videoKey) {
      // New schema
      requestBody.videoKey = params.videoKey;
      requestBody.teaserKey = params.teaserKey;
      requestBody.gifKey = params.gifKey;
    } else {
      // Old schema
      requestBody.videoId = params.videoId;
    }

    const response = await axios.post(
      `${BASE_URL}/comms/sendSMS`,
      requestBody,
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
      error: error.response?.data?.message || "Could not send SMS!",
    };
  }
};

// API to send a Email to the user
export const sendEmailToSelectedContacts = async (params) => {
  // Get the accountId and userLocationId from the Local Storage
  const accessToken = localStorage.getItem("accessToken");
  try {
    const requestBody = {
      contactIds: params.contactIds,
      tags: params.tags,
      message: params.message,
      subject: params.subject,
      uploadedVideoName: params.uploadedVideoName,
    };

    // Add video fields based on schema
    if (params.videoKey) {
      // New schema
      requestBody.videoKey = params.videoKey;
      requestBody.teaserKey = params.teaserKey;
      requestBody.gifKey = params.gifKey;
    } else {
      // Old schema
      requestBody.videoId = params.videoId;
    }

    const response = await axios.post(
      `${BASE_URL}/comms/sendEmail`,
      requestBody,
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
      error: error.response?.data?.message || "Could not send Email!",
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
    return response.data.histories;
  } catch (error) {
    console.error("Error while getting History of Messages: ", error);
    throw new Error(
      error.response?.data?.message || "Could not fetch user domain!"
    );
  }
};

// API to get the Tags of the Contacts of the user
export const getContactTags = async (accessToken) => {
  // Get the accountId and userLocationId from the Local Storage
  // const accessToken = localStorage.getItem("accessToken");
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
      error: error.response?.data?.message || "Could not get Contact Tags!",
    };
  }
};

// API to get the users based on the contact tags selected
export const getContactsBasedOnTags = async (selectedTags) => {
  const accessToken = localStorage.getItem("accessToken");
  try {
    const response = await axios.get(
      `${BASE_URL}/user/getUserContactsByTags?tags=${selectedTags}`,
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
    console.error("Error while getting Contact Tags: ", error);
    return {
      success: false,
      error:
        error.response?.data?.message || "Could not get Contact based on tags!",
    };
  }
};

// API to fetchg the custom fiekds of user created in the contacts
export const getCustomFields = async (accessToken) => {
  try {
    const response = await axios.get(`${BASE_URL}/user/getUserCustomFields`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error while getting custom fields: ", error);
    return {
      success: false,
      error: error.response?.data?.message || "Could not get custom fields!",
    };
  }
};
