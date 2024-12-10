import {
  Modal,
  TextInput,
  Tabs,
  CopyButton,
  ActionIcon,
  Textarea,
  Table,
  Checkbox,
} from "@mantine/core";
import { useGlobalModals } from "../../store/globalModals";
import { LoadingOverlay, MultiSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import CustomVideoInput from "./CustomVideoInput";
import CustomButton from "./CustomButton";
import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import {
  ARROW_RIGHT,
  CANCAL_ICON,
  COPY_TEXT_ICON,
  EMAIL_ICON,
  EMBED_ICON,
  SMS_ICON,
} from "../../assets/icons/DynamicIcons.jsx";
import { StartRecordingBtn, TextEditor } from "./LibraryComponents";
import { deleteVideo, getContacts, updateVideo } from "../../api/libraryAPIs";
import { useUserStore } from "../../store/userStore";
import {
  getContactTags,
  sendEmailToSelectedContacts,
  sendSMSToSelectedContacts,
} from "../../api/commsAPIs";
import { toast } from "react-toastify";

function quillGetHTML(inputDelta) {
  var tempCont = document.createElement("div");
  new Quill(tempCont).setContents(inputDelta);
  return tempCont.getElementsByClassName("ql-editor")[0].innerHTML;
}
const ModalRoot = ({ loadingOverlay, showModal, onClose, children }) => {
  return (
    <Modal
      id="global-modal"
      opened={showModal}
      // onClose={onClose}
      centered
      size="auto"
      withCloseButton={false}
      radius={12}
      padding={32}
    >
      <LoadingOverlay
        visible={loadingOverlay ? loadingOverlay : false}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <button className="absolute top-[16px] right-[16px]" onClick={onClose}>
        <CANCAL_ICON />
      </button>
      {children}
    </Modal>
  );
};

// New Recording Modal
export const PreRecordingDataInputModal = () => {
  const modalLoadingOverlay = useGlobalModals(
    (state) => state.modalLoadingOverlay
  );

  const isNewRecordingModalOpen = useGlobalModals(
    (state) => state.isNewRecordingModalOpen
  );
  const setIsNewRecordingModalOpen = useGlobalModals(
    (state) => state.setIsNewRecordingModalOpen
  );

  const [recordingName, setRecordingName] = useState("");
  const [settingLoom, setSettingLoom] = useState(false);
  const [showStartRecordingBtn, setShowStartRecordingBtn] = useState(false);

  return (
    <ModalRoot
      loadingOverlay={modalLoadingOverlay}
      showModal={isNewRecordingModalOpen}
      onClose={() => {
        setIsNewRecordingModalOpen(false);
        setRecordingName("");
        setShowStartRecordingBtn(false);
        setSettingLoom(false);
      }}
    >
      <div className="flex flex-col gap-[24px] w-[738px]">
        {showStartRecordingBtn && (
          <button
            className="w-fit flex items-center gap-[8px] font-medium text-primary"
            type="button"
            onClick={() => setShowStartRecordingBtn(false)}
          >
            <ARROW_RIGHT className="text-primary rotate-180" />
            <p>Go Back</p>
          </button>
        )}
        <h3 className="text-[24px] font-medium">New Video Record</h3>
        {showStartRecordingBtn && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[16px] font-medium">Recording Name</p>
            <div className="p-[12px_16px] rounded-[8px] bg-[#EEEEEE] border border-[#DEDEDE] text-[#777B8B] hover:cursor-not-allowed">
              {recordingName}
            </div>
          </div>
        )}
        <form className="flex flex-col gap-[24px]">
          {!showStartRecordingBtn && (
            <TextInput
              label="Recording Name"
              placeholder="Enter Recording Name"
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              withAsterisk
              description="Name must be at least 3 characters long"
              id="recordingNameModalInput"
              className="w-[350px]"
            />
          )}

          <StartRecordingBtn
            onStartRecording={() => setIsNewRecordingModalOpen(false)}
            afterRecordingStart={() => setRecordingName("")}
            recordingName={recordingName}
            disabled={recordingName.length < 3}
            settingLoom={settingLoom}
            setSettingLoom={setSettingLoom}
            showStartRecordingBtn={showStartRecordingBtn}
            setShowStartRecordingBtn={setShowStartRecordingBtn}
          />
        </form>
      </div>
    </ModalRoot>
  );
};

// Modal to show warning to the User before starting the recording
export const StartRecordingWarningModal = () => {
  const isWarningModalOpen = useGlobalModals(
    (state) => state.isWarningModalOpen
  );
  const setIsWarningModalOpen = useGlobalModals(
    (state) => state.setIsWarningModalOpen
  );

  return (
    <ModalRoot
      loadingOverlay={false}
      showModal={isWarningModalOpen}
      onClose={() => {
        setIsWarningModalOpen(false);
      }}
    >
      <div className="flex flex-col items-center text-center gap-[12px] w-[500px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 24 24"
          fill="red"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
        </svg>
        <h2 className="font-bold text-[24px]">Oops...</h2>
        <p className="text-[14px] text-gray-500">
          Due to the security reasons, you can&apos;t record a screen inside the
          iframe. Please do screen recording in new tab opened.
        </p>
        <button
          className="bg-primary text-[16px] font-medium w-[150px] p-[12px_16px] text-white rounded-[8px] mt-[12px]"
          type="button"
          onClick={() => {
            setIsWarningModalOpen(false);
          }}
        >
          Ok
        </button>
      </div>
    </ModalRoot>
  );
};

// Modal for Uploading the Video
export const UploadVideoModal = () => {
  const modalLoadingOverlay = useGlobalModals(
    (state) => state.modalLoadingOverlay
  );
  const isUploadVideoModalOpen = useGlobalModals(
    (state) => state.isUploadVideoModalOpen
  );
  const setIsUploadVideoModalOpen = useGlobalModals(
    (state) => state.setIsUploadVideoModalOpen
  );

  // Modal Form
  const form = useForm({
    initialValues: {
      videoName: "",
      videoDescription: "",
      uploadedVideo: null,
    },

    validate: {
      videoName: (value) => {
        if (value.length < 3) {
          return "Video Name must be at least 3 characters long";
        }
      },
      videoDescription: (value) => {
        if (value.length < 3) {
          return "Video Description must be at least 3 characters long";
        }
      },
      uploadedVideo: (value) => {
        if (!value) {
          return "Please upload a video";
        }
      },
    },
  });

  // Function to handle the upload of the video
  const handleUploadVideo = (values) => {
    console.log(values);
  };

  return (
    <ModalRoot
      loadingOverlay={modalLoadingOverlay}
      showModal={isUploadVideoModalOpen}
      onClose={() => {
        setIsUploadVideoModalOpen(false);
      }}
    >
      <div className="flex flex-col gap-[24px] w-[738px]">
        <h3 className="text-[24px] font-medium">Upload Video</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.onSubmit(handleUploadVideo);
          }}
          className="flex flex-col gap-[16px]"
        >
          <TextInput
            label="Video Name"
            placeholder="Enter Video Name"
            {...form.getInputProps("videoName")}
            id="videoName"
            className="w-[350px]"
          />
          <Textarea
            id="videoDescription"
            className="w-[350px]"
            label="Video Description"
            placeholder="Enter Video Description"
            {...form.getInputProps("videoDescription")}
          />
          <CustomVideoInput form={form} />
        </form>
        <button
          type="button"
          className="bg-primary rounded-[8px] p-[10px_28px] text-white font-medium w-fit"
          onClick={() => {}}
        >
          Publish Video
        </button>
      </div>
    </ModalRoot>
  );
};

// Modal to edit the video details
export const EditVideoModal = () => {
  const setModalLoadingOverlay = useGlobalModals(
    (state) => state.setModalLoadingOverlay
  );

  const modalLoadingOverlay = useGlobalModals(
    (state) => state.modalLoadingOverlay
  );
  const isEditVideoModalOpen = useGlobalModals(
    (state) => state.isEditVideoModalOpen
  );
  const setIsEditVideoModalOpen = useGlobalModals(
    (state) => state.setIsEditVideoModalOpen
  );
  const videoToBeEdited = useGlobalModals((state) => state.videoToBeEdited);

  const setVideoToBeEdited = useGlobalModals(
    (state) => state.setVideoToBeEdited
  );

  const videosData = useUserStore((state) => state.videosData);
  const setVideosData = useUserStore((state) => state.setVideosData);

  // Modal Form
  const form = useForm({
    initialValues: {
      videoName: videoToBeEdited?.title,
      videoDescription: videoToBeEdited?.description,
    },

    validate: {
      videoName: (value) => {
        if (value.length < 3) {
          console.log("Video Name must be at least 3 characters long");
          return "Video Name must be at least 3 characters long";
        } else {
          return null;
        }
      },
    },
  });

  // Function to handle the update of the video
  const handleUpdateVideo = async (values) => {
    setModalLoadingOverlay(true);

    const response = await updateVideo({
      accountId: videoToBeEdited.accountId,
      videoId: videoToBeEdited._id,
      title: values.videoName,
      description: values.videoDescription,
    });

    if (response.success) {
      console.log("Video Updated Successfully", response.data);
    } else {
      console.log("Error while updating video: ", response.error);
    }

    // Find the Video in the Videos Data and update it

    const updatedVideosData = videosData.map((video) => {
      if (video._id === videoToBeEdited._id) {
        return response.data.video;
      }
      return video;
    });

    setVideosData(updatedVideosData);

    setModalLoadingOverlay(false);
    setIsEditVideoModalOpen(false);
    setVideoToBeEdited({});
  };

  const formRef = useRef(form);

  useEffect(() => {
    formRef.current.setValues({
      videoName: videoToBeEdited?.title,
      videoDescription: videoToBeEdited?.description,
    });
  }, [videoToBeEdited]);

  return (
    <ModalRoot
      loadingOverlay={modalLoadingOverlay}
      showModal={isEditVideoModalOpen}
      onClose={() => {
        setIsEditVideoModalOpen(false);
        setVideoToBeEdited({});
      }}
    >
      <div className="flex flex-col gap-[24px] w-[534px]">
        <h3 className="text-[24px] font-medium">Make Changes in Video</h3>
        <form
          className="flex flex-col gap-[16px]"
          onSubmit={form.onSubmit(handleUpdateVideo)}
        >
          <TextInput
            label="Video Name"
            placeholder="Enter Video Name"
            {...form.getInputProps("videoName")}
            id="videoName"
          />
          <TextInput
            label="Video Description"
            placeholder="Enter Video Description"
            {...form.getInputProps("videoDescription")}
            id="videoDescription"
          />
          <div className="flex items-center gap-[16px]">
            <CustomButton
              label="Save Changes"
              varient="filled"
              className="w-fit"
              type="submit"
            />
            <CustomButton
              label="Cancel"
              varient="outlined"
              className="w-fit"
              onClick={() => {
                setIsEditVideoModalOpen(false);
                setVideoToBeEdited({});
              }}
            />
          </div>
        </form>
      </div>
    </ModalRoot>
  );
};

// Modal to share the video
export const ShareVideoModal = () => {
  const selectedContacts = useGlobalModals((state) => state.selectedContacts);
  const setSelectedContacts = useGlobalModals(
    (state) => state.setSelectedContacts
  );

  const selectedSMSContacts = useGlobalModals(
    (state) => state.selectedSMSContacts
  );
  const setSelectedSMSContacts = useGlobalModals(
    (state) => state.setSelectedSMSContacts
  );

  const modalLoadingOverlay = useGlobalModals(
    (state) => state.modalLoadingOverlay
  );

  const setModalLoadingOverlay = useGlobalModals(
    (state) => state.setModalLoadingOverlay
  );
  const isShareVideoModalOpen = useGlobalModals(
    (state) => state.isShareVideoModalOpen
  );
  const setIsShareVideoModalOpen = useGlobalModals(
    (state) => state.setIsShareVideoModalOpen
  );
  const setIsContactsSelectionModalOpen = useGlobalModals(
    (state) => state.setIsContactsSelectionModalOpen
  );

  const setIsSMSContactsSelectionModalOpen = useGlobalModals(
    (state) => state.setIsSMSContactsSelectionModalOpen
  );

  const setSendToAllContacts = useGlobalModals(
    (state) => state.setSendToAllContacts
  );

  const historyData = useUserStore((state) => state.historyData);
  const setHistoryData = useUserStore((state) => state.setHistoryData);

  const sendToAllContacts = useGlobalModals((state) => state.sendToAllContacts);

  const videoToBeShared = useGlobalModals((state) => state.videoToBeShared);

  const contactTagsData = useGlobalModals((state) => state.contactTagsData);

  const setContactTagsData = useGlobalModals(
    (state) => state.setContactTagsData
  );

  const setIsVideoLinkNotAttachedModalOpen = useGlobalModals(
    (state) => state.setIsVideoLinkNotAttachedModalOpen
  );

  const [activeTab, setActiveTab] = useState("email");
  const [activeSubTab, setActiveSubTab] = useState("contacts");

  // State to store the content of Input Field of SMS
  const [smsContent, setSmsContent] = useState("");

  // State for Email Subject
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [selectedContactTags, setSelectedContactTags] = useState([]);
  const [noSelectedContactsError, setNoSelectedContactsError] = useState("");
  const [noSMSContentError, setNoSMSContentError] = useState("");
  const [noEmailSubjectError, setNoEmailSubjectError] = useState("");
  const [noEmailContentError, setNoEmailContentError] = useState("");

  // Use a ref to access the quill instance directly
  const quillRef = useRef();

  // Function to handle Initail Email Send
  const ValidateEmailSend = () => {
    let delta = quillRef.current.getContents();
    const quillHTML = quillGetHTML(delta);

    setEmailContent(quillHTML);

    // Validation Checks
    if (
      selectedContactTags.length === 0 &&
      selectedContacts.length === 0 &&
      !sendToAllContacts
    ) {
      setNoSelectedContactsError(
        "Please select the contacts or tags to send the SMS!"
      );
      return;
    }

    if (emailSubject === "") {
      setNoEmailSubjectError("Please enter the Email Subject!");
      return;
    }

    if (quillHTML === "<p><br></p>") {
      setNoEmailContentError("Please enter the Email Content!");
      return;
    }

    if (quillHTML.includes(videoToBeShared?.shareableLink)) {
      return handleSubmitEmail(quillHTML);
    }

    setIsVideoLinkNotAttachedModalOpen(true);
    setIsShareVideoModalOpen(false);
  };

  const ValidateSMSSend = () => {
    // Validation Checks
    if (
      selectedContactTags.length === 0 &&
      selectedSMSContacts.length === 0 &&
      !sendToAllContacts
    ) {
      setNoSelectedContactsError(
        "Please select the contacts or tags to send the SMS!"
      );
      return;
    }

    if (smsContent === "") {
      setNoSMSContentError("Please enter the SMS Content!");
      return;
    }

    if (smsContent.includes(videoToBeShared?.shareableLink)) {
      return handleSubmitEmail();
    }

    setIsVideoLinkNotAttachedModalOpen(true);
    setIsShareVideoModalOpen(false);
  };

  const handleSubmitEmail = async (htmlContent) => {
    setModalLoadingOverlay(true);
    let API_DATA;

    if (selectedContacts.length > 0 || sendToAllContacts) {
      API_DATA = {
        contactIds: sendToAllContacts ? [] : selectedContacts,
        tags: [],
        message: emailContent || htmlContent,
        subject: emailSubject,
        sendToAll: sendToAllContacts,
        videoId: videoToBeShared._id,
      };
    } else {
      API_DATA = {
        contactIds: [],
        tags: selectedContactTags,
        message: emailContent || htmlContent,
        subject: emailSubject,
        sendToAll: false,
        videoId: videoToBeShared._id,
      };
    }

    // Send Email API
    const response = await sendEmailToSelectedContacts(API_DATA);

    if (response.success) {
      toast.success(response.data.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      const rawHistoryData = response.data.data;

      const newHistoryData = rawHistoryData.map((history) => {
        return {
          _id: history.data._id,
          videoTitle: history.videoName,
          contactName: history.data.contactName,
          contactAddress: history.data.contactAddress,
          sendType: history.data.sendType,
          subject: history.data.subject,
          status: history.data.status,
        };
      });

      setHistoryData([...historyData, ...newHistoryData]);

      // Clear the selected contacts
      setSelectedContacts([]);

      // Clear the Quill Editor
      // quillRef.current.setContents("");

      // Close the Modal
      setIsVideoLinkNotAttachedModalOpen(false);
      setModalLoadingOverlay(false);
      setIsShareVideoModalOpen(false);
      setSendToAllContacts(false);
      setSelectedContactTags([]);
      setEmailSubject("");
      setNoEmailContentError("");
      setNoEmailSubjectError("");
      setEmailContent("");
      setActiveTab("email");
      setActiveSubTab("contacts");
    } else {
      setModalLoadingOverlay(false);
      toast.error(response.error || "Error while sending emails", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleSubmitSMS = async () => {
    setModalLoadingOverlay(true);

    let API_DATA;

    if (selectedSMSContacts.length > 0 || sendToAllContacts) {
      setSelectedContactTags([]);
      API_DATA = {
        contactIds: sendToAllContacts ? [] : selectedSMSContacts,
        tags: [],
        message: smsContent,
        sendToAll: sendToAllContacts,
        videoId: videoToBeShared._id,
      };
    } else {
      setSelectedContacts([]);
      setSendToAllContacts(false);
      API_DATA = {
        contactIds: [],
        tags: selectedContactTags,
        message: smsContent,
        sendToAll: false,
        videoId: videoToBeShared._id,
      };
    }

    // Send Email API
    const response = await sendSMSToSelectedContacts(API_DATA);
    if (response.success) {
      toast.success(response.data.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      const rawHistoryData = response.data.data;
      const newHistoryData = rawHistoryData.map((history) => {
        return {
          _id: history.data._id,
          videoTitle: history.videoName,
          contactName: history.data.contactName,
          contactAddress: history.data.contactAddress,
          sendType: history.data.sendType,
          subject: history.data.subject,
          status: history.data.status,
        };
      });
      setHistoryData([...historyData, ...newHistoryData]);

      setIsVideoLinkNotAttachedModalOpen(false);
      setModalLoadingOverlay(false);
      setSendToAllContacts(false);
      // Clear the selected contacts
      setSelectedSMSContacts([]);
      // Clear the Tags
      setSelectedContactTags([]);
      // Clear the SMS Content
      setSmsContent("");
      // Close the Modal
      setIsShareVideoModalOpen(false);
      setActiveTab("email");
      setActiveSubTab("contacts");

      setNoSMSContentError("");
    } else {
      console.log("Error while sending SMS: ", response.error);
      toast.error(response.error || "Error while sending SMS", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setModalLoadingOverlay(false);
    }
  };

  useEffect(() => {
    if (
      sendToAllContacts ||
      selectedContacts.length > 0 ||
      selectedContactTags.length > 0
    ) {
      setNoSelectedContactsError("");
    }

    if (emailSubject !== "") {
      setNoEmailSubjectError("");
    }
  }, [selectedContacts, sendToAllContacts, selectedContactTags, emailSubject]);

  useEffect(() => {
    if (
      sendToAllContacts ||
      selectedSMSContacts.length > 0 ||
      selectedContactTags.length > 0
    ) {
      setNoSelectedContactsError("");
    }

    if (smsContent !== "") {
      setNoSMSContentError("");
    }
  }, [selectedSMSContacts, sendToAllContacts, selectedContactTags, smsContent]);

  useEffect(() => {
    if (activeSubTab === "contacts") {
      setSelectedContactTags([]);
    } else {
      setSelectedSMSContacts([]);
      setSendToAllContacts(false);
    }
  }, [activeSubTab, setSelectedSMSContacts, setSendToAllContacts]);

  useEffect(() => {
    const fetchContactTags = async () => {
      const response = await getContactTags();

      if (response.success) {
        const tagsData = response.data.userTags.map((tag) => {
          return tag.name;
        });
        setContactTagsData(tagsData);
      } else {
        console.log("Error while fetching Contact Tags: ", response.error);
      }
    };

    fetchContactTags();
  }, [setContactTagsData]);

  return (
    <>
      <VideoLinkNotAttachedModal
        onSendAnyway={() => {
          activeTab === "email" ? handleSubmitEmail() : handleSubmitSMS();
        }}
        onCancel={() => {
          setIsShareVideoModalOpen(true);
        }}
      />

      <ModalRoot
        loadingOverlay={modalLoadingOverlay}
        showModal={isShareVideoModalOpen}
        onClose={() => {
          setIsShareVideoModalOpen(false);
          setActiveTab("email");
          setActiveSubTab("contacts");
        }}
      >
        <div className="flex flex-col gap-[24px] w-[70vw]">
          <h3 className="text-[24px] font-medium">Share Video</h3>
          <div className="flex flex-col gap-[24px]">
            <Tabs color="#2A85FF" value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab
                  value="email"
                  leftSection={
                    <EMAIL_ICON
                      className={`${
                        activeTab === "email"
                          ? "!text-darkBlue"
                          : "!text-gray-dark"
                      }`}
                    />
                  }
                  className={`${
                    activeTab === "email" ? "!text-darkBlue" : "!text-gray-dark"
                  } font-medium`}
                >
                  Email
                </Tabs.Tab>
                <Tabs.Tab
                  value="sms"
                  leftSection={
                    <SMS_ICON
                      className={`${
                        activeTab === "sms"
                          ? "!text-darkBlue"
                          : "!text-gray-dark"
                      }`}
                    />
                  }
                  className={`${
                    activeTab === "sms" ? "!text-darkBlue" : "!text-gray-dark"
                  } font-medium`}
                >
                  SMS
                </Tabs.Tab>
                <Tabs.Tab
                  value="embed"
                  leftSection={
                    <EMBED_ICON
                      className={`${
                        activeTab === "embed"
                          ? "!text-darkBlue"
                          : "!text-gray-dark"
                      }`}
                    />
                  }
                  className={`${
                    activeTab === "embed" ? "!text-darkBlue" : "!text-gray-dark"
                  } font-medium`}
                >
                  Embed
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel
                value="email"
                className="pt-[24px]  flex flex-col gap-[24px]"
              >
                <div className="flex flex-col gap-[8px]">
                  <Tabs
                    color="#6C668526"
                    variant="pills"
                    radius="xl"
                    value={activeSubTab}
                    onChange={setActiveSubTab}
                  >
                    <Tabs.List>
                      <Tabs.Tab
                        value="contacts"
                        className={`${
                          activeSubTab === "contacts"
                            ? "!text-darkBlue font-bold"
                            : "!text-[#6C6685] font-medium"
                        } `}
                      >
                        Contacts
                      </Tabs.Tab>
                      <Tabs.Tab
                        value="tags"
                        className={`${
                          activeSubTab === "tags"
                            ? "!text-darkBlue font-bold"
                            : "!text-[#6C6685] font-medium"
                        } `}
                      >
                        Tags
                      </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="contacts" className="mt-[12px]">
                      <button
                        className="flex justify-center items-center border border-[##E9E8ED] rounded-[8px] p-[8px_12px] text-[14px] gap-[8px] font-medium text-darkBlue"
                        type="button"
                        onClick={() => {
                          setIsContactsSelectionModalOpen(true);
                          setIsShareVideoModalOpen(false);
                        }}
                      >
                        <p>Select Contacts</p>
                        <ARROW_RIGHT />
                      </button>
                    </Tabs.Panel>

                    <Tabs.Panel value="tags" className="mt-[12px]">
                      <MultiSelect
                        className="md:w-1/2 w-full"
                        placeholder="Select one or Multiple Tags"
                        data={contactTagsData}
                        value={selectedContactTags}
                        onChange={(value) => {
                          setSelectedContactTags(value);
                        }}
                        clearable
                        searchable
                        nothingFoundMessage="Nothing found..."
                        hidePickedOptions
                      />
                    </Tabs.Panel>
                  </Tabs>
                  {noSelectedContactsError !== "" && (
                    <p className="text-[12px] text-red-500">
                      {noSelectedContactsError}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-[8px]">
                  <TextInput
                    label="Email Subject"
                    placeholder="Email Subject"
                    className="w-full max-w-[350px]"
                    id="emailSubject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                  {noEmailSubjectError !== "" && (
                    <p className="text-[12px] text-red-500">
                      {noEmailSubjectError}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-[8px]">
                  <TextEditor ref={quillRef} />
                  {noEmailContentError !== "" && (
                    <p className="text-[12px] text-red-500">
                      {noEmailContentError}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-[16px]">
                  <CustomButton
                    label="Send Email"
                    varient="filled"
                    className="w-fit"
                    onClick={ValidateEmailSend}
                  />
                  <CustomButton
                    label="Cancel"
                    varient="outlined"
                    className="w-fit"
                    onClick={() => {
                      setIsShareVideoModalOpen(false);
                    }}
                  />
                </div>
              </Tabs.Panel>

              <Tabs.Panel
                value="sms"
                className="pt-[24px] flex flex-col gap-[24px]"
              >
                <div className="flex flex-col gap-[8px]">
                  <Tabs
                    color="#6C668526"
                    variant="pills"
                    radius="xl"
                    value={activeSubTab}
                    onChange={setActiveSubTab}
                  >
                    <Tabs.List>
                      <Tabs.Tab
                        value="contacts"
                        className={`${
                          activeSubTab === "contacts"
                            ? "!text-darkBlue font-bold"
                            : "!text-[#6C6685] font-medium"
                        } `}
                      >
                        Contacts
                      </Tabs.Tab>
                      <Tabs.Tab
                        value="tags"
                        className={`${
                          activeSubTab === "tags"
                            ? "!text-darkBlue font-bold"
                            : "!text-[#6C6685] font-medium"
                        } `}
                      >
                        Tags
                      </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="contacts" className="mt-[12px]">
                      <button
                        className="flex justify-center items-center border border-[##E9E8ED] rounded-[8px] p-[8px_12px] text-[14px] gap-[8px] font-medium text-darkBlue"
                        type="button"
                        onClick={() => {
                          setIsSMSContactsSelectionModalOpen(true);
                          setIsShareVideoModalOpen(false);
                        }}
                      >
                        <p>Select Contacts</p>
                        <ARROW_RIGHT />
                      </button>
                    </Tabs.Panel>

                    <Tabs.Panel value="tags" className="mt-[12px]">
                      <MultiSelect
                        className="md:w-1/2 w-full"
                        placeholder="Select one or Multiple Tags"
                        data={contactTagsData}
                        value={selectedContactTags}
                        onChange={(value) => {
                          setSelectedContactTags(value);
                        }}
                        clearable
                        searchable
                        nothingFoundMessage="Nothing found..."
                        hidePickedOptions
                      />
                    </Tabs.Panel>
                  </Tabs>
                  {noSelectedContactsError !== "" && (
                    <p className="text-[12px] text-red-500">
                      {noSelectedContactsError}
                    </p>
                  )}
                </div>
                <div className="w-full">
                  <p className="text-[14px] mb-[8px]">Content</p>
                  <div className="relative rounded-[12px] w-full h-[350px] !bg-[#F7F7F8] border border-[#D7D5DD] overflow-hidden">
                    <button
                      type="button"
                      className="bg-white p-[8px] text-darkBlue text-[14px] font-medium shadow-sm w-full text-start"
                      onClick={() => {
                        setSmsContent(
                          `${smsContent} ${videoToBeShared?.shareableLink} `
                        );
                      }}
                    >
                      Paste Video Link
                    </button>

                    <textarea
                      id="smsContent-container"
                      placeholder="SMS Content"
                      value={smsContent}
                      onChange={(e) => setSmsContent(e.target.value)}
                      className="!bg-transparent h-[calc(100%-40px)] w-full text-[14px] outline-none p-[8px]"
                    />
                  </div>
                  {noSMSContentError !== "" && (
                    <p className="text-[12px] text-red-500 mt-[8px]">
                      {noSMSContentError}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-[16px]">
                  <CustomButton
                    label="Send SMS"
                    varient="filled"
                    className="w-fit"
                    onClick={ValidateSMSSend}
                  />
                  <CustomButton
                    label="Cancel"
                    varient="outlined"
                    className="w-fit"
                    onClick={() => {
                      setIsShareVideoModalOpen(false);
                    }}
                  />
                </div>
              </Tabs.Panel>

              <Tabs.Panel
                value="embed"
                className="pt-[24px] flex flex-col gap-[24px] items-end"
              >
                <div className="w-full">
                  <p className="text-[14px] mb-[8px]">Embed Link</p>
                  <div className="relative rounded-[12px] w-full h-[350px] bg-[#F7F7F8] border border-[#D7D5DD] overflow-hidden">
                    <CopyButton
                      value={`<div
                              style={{
                              position: "relative",
                              paddingBottom: "56.25%",
                              height: "0",
                            }}  
                          >
                            <iframe
                              src="${videoToBeShared?.embeddedLink}"
                              frameBorder="0"
                              webkitallowfullscreen
                              mozallowfullscreen
                              allowfullscreen
                              style={{
                                position: "absolute",
                                top: "0",
                                left: "0",
                                width: "100%",
                                height: "100%",
                              }}
                            ></iframe></div>`}
                    >
                      {({ copied, copy }) => (
                        <ActionIcon
                          onClick={copy}
                          className="!w-fit !bg-white rounded-tl-[12px] !p-[8px] !h-[35px]"
                          timeout={3000}
                        >
                          {!copied ? (
                            <div className="flex items-center gap-[8px]">
                              <p className="text-[14px] text-darkBlue font-medium">
                                Copy The Embed Link
                              </p>
                              <COPY_TEXT_ICON className="text-darkBlue" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-[8px]">
                              <COPY_TEXT_ICON className="text-green-500" />
                              <p className="text-[14px] text-green-500 font-medium">
                                Link Copied
                              </p>
                            </div>
                          )}
                        </ActionIcon>
                      )}
                    </CopyButton>
                    <p className="px-[16px] py-[24px] w-[80%]">{`
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "56.25%",
                      height: "0",
                    }}
                  >
                    <iframe
                      src="${videoToBeShared?.embeddedLink}"
                      frameBorder="0"
                      webkitallowfullscreen
                      mozallowfullscreen
                      allowfullscreen
                      style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                      }}
                    ></iframe>
                  </div>
                  `}</p>
                  </div>
                </div>
                <CopyButton value={videoToBeShared.videoLink}>
                  {({ copied, copy }) => (
                    <ActionIcon
                      onClick={copy}
                      className="!w-fit !bg-transparent"
                    >
                      {!copied ? (
                        <div className="flex items-center gap-[8px]">
                          <COPY_TEXT_ICON className="text-darkBlue" />
                          <p className="text-[14px] text-darkBlue font-medium">
                            Copy Video Link
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-[8px]">
                          <COPY_TEXT_ICON className="text-green-500" />
                          <p className="text-[14px] text-green-500 font-medium">
                            Link Copied
                          </p>
                        </div>
                      )}
                    </ActionIcon>
                  )}
                </CopyButton>
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </ModalRoot>
    </>
  );
};

// Modal to confirm the deletion of a video
export const DeleteVideoConfirmationModal = () => {
  const modalLoadingOverlay = useGlobalModals(
    (state) => state.modalLoadingOverlay
  );

  const setModalLoadingOverlay = useGlobalModals(
    (state) => state.setModalLoadingOverlay
  );

  const isDeleteVideoModalOpen = useGlobalModals(
    (state) => state.isDeleteVideoModalOpen
  );
  const setIsDeleteVideoModalOpen = useGlobalModals(
    (state) => state.setIsDeleteVideoModalOpen
  );
  const videoToBeDeleted = useGlobalModals((state) => state.videoToBeDeleted);
  const setVideoToBeDeleted = useGlobalModals(
    (state) => state.setVideoToBeDeleted
  );

  const videosData = useUserStore((state) => state.videosData);
  const setVideosData = useUserStore((state) => state.setVideosData);

  const handleDeleteVideo = async () => {
    setModalLoadingOverlay(true);

    const response = await deleteVideo({
      videoId: videoToBeDeleted._id,
    });

    if (response.success) {
      console.log("Video Deleted Successfully", response.data);

      // Remove the Video from the Videos Data
      const updatedVideosData = videosData.filter(
        (video) => video._id !== videoToBeDeleted._id
      );

      setVideosData(updatedVideosData);
    } else {
      console.log("Error while deleting video: ", response.error);
    }

    setModalLoadingOverlay(false);
    setIsDeleteVideoModalOpen(false);
    setVideoToBeDeleted({});
  };

  return (
    <ModalRoot
      loadingOverlay={modalLoadingOverlay}
      showModal={isDeleteVideoModalOpen}
      onClose={() => {
        setIsDeleteVideoModalOpen(false);
        setVideoToBeDeleted({});
      }}
    >
      <div className="flex flex-col gap-[24px] w-[535px]">
        <div className="flex flex-col gap-[12px]">
          <h3 className="text-[24px] font-medium">
            Please Confirm to delete the Video
          </h3>
          <p>
            Press Confirm to delete the Video&nbsp;
            <b>{`"${videoToBeDeleted?.title}"`}</b>.
          </p>
        </div>
        <div className="flex items-center gap-[16px]">
          <button
            type="button"
            className="bg-[#FF1F00] rounded-[8px] p-[10px_39px] text-white font-medium"
            onClick={handleDeleteVideo}
          >
            Confirm
          </button>
          <button
            type="button"
            className="border border-gray-light rounded-[8px] p-[10px_39px] text-darkBlue font-medium"
            onClick={() => {
              setIsDeleteVideoModalOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalRoot>
  );
};

export const ContactsSelectionModalEmail = () => {
  const selectedContacts = useGlobalModals((state) => state.selectedContacts);
  const setSelectedContacts = useGlobalModals(
    (state) => state.setSelectedContacts
  );

  const modalLoadingOverlay = useGlobalModals(
    (state) => state.modalLoadingOverlay
  );

  const setModalLoadingOverlay = useGlobalModals(
    (state) => state.setModalLoadingOverlay
  );

  const setIsShareVideoModalOpen = useGlobalModals(
    (state) => state.setIsShareVideoModalOpen
  );
  const isContactsSelectionModalOpen = useGlobalModals(
    (state) => state.isContactsSelectionModalOpen
  );

  const setIsContactsSelectionModalOpen = useGlobalModals(
    (state) => state.setIsContactsSelectionModalOpen
  );

  const userContactsData = useUserStore((state) => state.userContactsData);
  const setUserContactsData = useUserStore(
    (state) => state.setUserContactsData
  );

  const setSendToAllContacts = useGlobalModals(
    (state) => state.setSendToAllContacts
  );

  const [contactsPagination, setContactsPagination] = useState(1);

  const filteredContacts = userContactsData?.contacts?.filter((contact) => {
    return (
      contact?.email !== null &&
      contact?.email !== undefined &&
      contact?.email !== ""
    );
  });

  const handleSelectContact = (contactDetails) => {
    // Check if the Contact is already selected then on unchecking remove it from the selected contacts
    const isContactSelected = selectedContacts.some(
      (contact) => contact.id === contactDetails.id
    );

    if (isContactSelected) {
      const updatedSelectedContacts = selectedContacts.filter(
        (contact) => contact.id !== contactDetails.id
      );
      setSelectedContacts(updatedSelectedContacts);
    } else {
      setSelectedContacts([
        ...selectedContacts,
        {
          ...contactDetails,
          isChecked: true,
        },
      ]);
    }
  };

  const handleSaveSelectedContacts = () => {
    setSendToAllContacts(false);
    setIsContactsSelectionModalOpen(false);
    setIsShareVideoModalOpen(true);
  };

  useEffect(() => {
    const fetchContacts = async () => {
      setModalLoadingOverlay(true);
      // Fetch Contacts from the Database
      const response = await getContacts({
        page: contactsPagination,
        pageLimit: 100,
      });

      if (response.success) {
        setUserContactsData(response.data.contacts);
      } else {
        console.log("Error while fetching contacts: ", response.error);
      }
      setModalLoadingOverlay(false);
    };

    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setModalLoadingOverlay, setUserContactsData]);

  const handleLoadMoreContacts = async () => {
    setModalLoadingOverlay(true);

    // Fetch Contacts from the Database
    const response = await getContacts({
      page: contactsPagination + 1,
      pageLimit: 100,
    });

    if (response.success) {
      const updatedContacts = {
        ...userContactsData, // Spread existing data
        contacts: [
          ...userContactsData.contacts, // Append existing contacts
          ...response.data.contacts.contacts, // Add new contacts
        ],
      };

      // Update the state with the merged contacts
      setUserContactsData(updatedContacts);
      setContactsPagination(contactsPagination + 1);
    } else {
      console.log("Error while fetching contacts: ", response.error);
    }

    setModalLoadingOverlay(false);
  };

  return (
    <ModalRoot
      loadingOverlay={modalLoadingOverlay}
      showModal={isContactsSelectionModalOpen}
      onClose={() => {
        setIsContactsSelectionModalOpen(false);
        setIsShareVideoModalOpen(true);
        setUserContactsData({});
        setSelectedContacts([]);
      }}
    >
      <div className="w-[70vw] flex flex-col gap-[10px] h-[70dvh] max-h-[90vh]">
        <div className="flex flex-col gap-[16px] h-[calc(100%-110px)] overflow-auto">
          <h2 className="font-medium text-[24px]">Select Contacts</h2>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Contact Name</Table.Th>
                <Table.Th>Email Address</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredContacts?.map((contact) => {
                const isChecked = selectedContacts?.some(
                  (selectedContact) =>
                    selectedContact?.id === contact?.id &&
                    selectedContact?.isChecked
                );

                return (
                  <Table.Tr key={contact.id}>
                    <Table.Td className="capitalize">
                      {contact?.firstNameLowerCase +
                        " " +
                        contact?.lastNameLowerCase}
                    </Table.Td>
                    <Table.Td>{contact.email}</Table.Td>
                    <Table.Td>
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleSelectContact(contact)}
                      />
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </div>
        <div className="bg-white p-[12px_24px] flex flex-col gap-[16px] justify-center items-center">
          <button
            className="loadMoreContactsBtn p-[10px_16px] border border-[##DBDBDB] rounded-[8px] text-[14px] font-medium text-darkBlue mx-auto"
            type="button"
            onClick={handleLoadMoreContacts}
            disabled={
              userContactsData?.contacts?.length === userContactsData?.total
            }
          >
            Load More
          </button>
          <div className="flex items-center gap-[16px]">
            <button
              className="p-[10px_16px] bg-primary text-white rounded-[8px] text-[14px] font-medium w-fit"
              type="button"
              onClick={() => {
                setSendToAllContacts(true);
                setIsContactsSelectionModalOpen(false);
                setIsShareVideoModalOpen(true);
              }}
            >
              Send To All Contacts
            </button>
            <button
              className={`p-[10px_16px] ${
                selectedContacts.length === 0
                  ? "bg-[#CBCBCB] text-white hover:cursor-not-allowed"
                  : "bg-primary text-white"
              } rounded-[8px] text-[14px] font-medium w-fit`}
              type="button"
              onClick={handleSaveSelectedContacts}
              disabled={selectedContacts.length === 0}
            >
              Send To Selected Contacts
            </button>
          </div>
        </div>
      </div>
    </ModalRoot>
  );
};

export const ContactsSelectionModalSMS = () => {
  const selectedSMSContacts = useGlobalModals(
    (state) => state.selectedSMSContacts
  );
  const setSelectedSMSContacts = useGlobalModals(
    (state) => state.setSelectedSMSContacts
  );
  const modalLoadingOverlay = useGlobalModals(
    (state) => state.modalLoadingOverlay
  );

  const setSendToAllContacts = useGlobalModals(
    (state) => state.setSendToAllContacts
  );

  const setModalLoadingOverlay = useGlobalModals(
    (state) => state.setModalLoadingOverlay
  );

  const setIsShareVideoModalOpen = useGlobalModals(
    (state) => state.setIsShareVideoModalOpen
  );
  const isSMSContactsSelectionModalOpen = useGlobalModals(
    (state) => state.isSMSContactsSelectionModalOpen
  );

  const setIsSMSContactsSelectionModalOpen = useGlobalModals(
    (state) => state.setIsSMSContactsSelectionModalOpen
  );

  const userContactsData = useUserStore((state) => state.userContactsData);
  const setUserContactsData = useUserStore(
    (state) => state.setUserContactsData
  );

  const [contactsPagination, setContactsPagination] = useState(1);

  const filteredContacts = userContactsData?.contacts?.filter((contact) => {
    return (
      contact?.phone !== null &&
      contact?.phone !== undefined &&
      contact?.phone !== ""
    );
  });

  const handleSelectContact = (contactDetails) => {
    // Check if the Contact is already selected then on unchecking remove it from the selected contacts
    const isContactSelected = selectedSMSContacts.some(
      (contact) => contact.id === contactDetails.id
    );

    if (isContactSelected) {
      const updatedSelectedContacts = selectedSMSContacts.filter(
        (contact) => contact.id !== contactDetails.id
      );
      setSelectedSMSContacts(updatedSelectedContacts);
    } else {
      setSelectedSMSContacts([
        ...selectedSMSContacts,
        {
          ...contactDetails,
          isChecked: true,
        },
      ]);
    }
  };

  const handleSaveSelectedContacts = () => {
    setSendToAllContacts(false);
    setIsSMSContactsSelectionModalOpen(false);
    setIsShareVideoModalOpen(true);
  };

  useEffect(() => {
    const fetchContacts = async () => {
      setModalLoadingOverlay(true);
      // Fetch Contacts from the Database
      const response = await getContacts({
        page: contactsPagination,
        pageLimit: 100,
      });

      if (response.success) {
        setUserContactsData(response.data.contacts);
      } else {
        console.log("Error while fetching contacts: ", response.error);
      }
      setModalLoadingOverlay(false);
    };

    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setModalLoadingOverlay, setUserContactsData]);

  const handleLoadMoreContacts = async () => {
    setModalLoadingOverlay(true);

    // Fetch Contacts from the Database
    const response = await getContacts({
      page: contactsPagination + 1,
      pageLimit: 100,
    });

    if (response.success) {
      const updatedContacts = {
        ...userContactsData, // Spread existing data
        contacts: [
          ...userContactsData.contacts, // Append existing contacts
          ...response.data.contacts.contacts, // Add new contacts
        ],
      };

      // Update the state with the merged contacts
      setUserContactsData(updatedContacts);
      setContactsPagination(contactsPagination + 1);
    } else {
      console.log("Error while fetching contacts: ", response.error);
    }

    setModalLoadingOverlay(false);
  };

  return (
    <ModalRoot
      loadingOverlay={modalLoadingOverlay}
      showModal={isSMSContactsSelectionModalOpen}
      onClose={() => {
        setIsSMSContactsSelectionModalOpen(false);
        setIsShareVideoModalOpen(true);
        setSelectedSMSContacts([]);
        setUserContactsData({});
      }}
    >
      <div className="w-[70vw] flex flex-col gap-[10px] h-[70dvh] max-h-[90vh]">
        <div className="flex flex-col gap-[16px] h-[calc(100%-110px)] overflow-auto">
          <h2 className="font-medium text-[24px]">Select Contacts</h2>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Contact Name</Table.Th>
                <Table.Th>Phone Number</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredContacts?.map((contact) => {
                const isChecked = selectedSMSContacts?.some(
                  (selectedContact) =>
                    selectedContact?.id === contact?.id &&
                    selectedContact?.isChecked
                );

                return (
                  <Table.Tr key={contact.id}>
                    <Table.Td className="capitalize">
                      {contact?.firstNameLowerCase +
                        " " +
                        contact?.lastNameLowerCase}
                    </Table.Td>
                    <Table.Td>{contact.phone}</Table.Td>
                    <Table.Td>
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleSelectContact(contact)}
                      />
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </div>
        <div className="bg-white p-[12px_24px] flex flex-col gap-[16px] justify-center items-center">
          <button
            className="loadMoreContactsBtn p-[10px_16px] border border-[##DBDBDB] rounded-[8px] text-[14px] font-medium text-darkBlue mx-auto"
            type="button"
            onClick={handleLoadMoreContacts}
            disabled={
              userContactsData?.contacts?.length === userContactsData?.total
            }
          >
            Load More
          </button>
          <div className="flex items-center gap-[16px]">
            <button
              className="p-[10px_16px] bg-primary text-white rounded-[8px] text-[14px] font-medium w-fit"
              type="button"
              onClick={() => {
                setSendToAllContacts(true);
                setIsSMSContactsSelectionModalOpen(false);
                setIsShareVideoModalOpen(true);
              }}
            >
              Send To All Contacts
            </button>
            <button
              className={`p-[10px_16px] ${
                selectedSMSContacts.length === 0
                  ? "bg-[#CBCBCB] text-white hover:cursor-not-allowed"
                  : "bg-primary text-white"
              } rounded-[8px] text-[14px] font-medium w-fit`}
              type="button"
              onClick={handleSaveSelectedContacts}
              disabled={selectedSMSContacts.length === 0}
            >
              Send To Selected Contacts
            </button>
          </div>
        </div>
      </div>
    </ModalRoot>
  );
};

const VideoLinkNotAttachedModal = ({ onSendAnyway, onCancel }) => {
  const isVideoLinkNotAttachedModalOpen = useGlobalModals(
    (state) => state.isVideoLinkNotAttachedModalOpen
  );
  const setIsVideoLinkNotAttachedModalOpen = useGlobalModals(
    (state) => state.setIsVideoLinkNotAttachedModalOpen
  );
  const modalLoadingOverlay = useGlobalModals(
    (state) => state.modalLoadingOverlay
  );

  return (
    <ModalRoot
      loadingOverlay={modalLoadingOverlay}
      showModal={isVideoLinkNotAttachedModalOpen}
      onClose={() => {
        setIsVideoLinkNotAttachedModalOpen(false);
        onCancel();
      }}
    >
      <div className="flex flex-col items-center text-center gap-[12px] w-[500px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 24 24"
          fill="red"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
        </svg>
        <p className="text-[16px] text-gray-500">
          Video Link is not attached to the Video!
        </p>
        <div className="flex items-center gap-[12px]">
          <button
            className="bg-primary text-[16px] font-medium w-[150px] p-[12px_16px] text-white rounded-[8px] mt-[12px]"
            type="button"
            onClick={() => {
              onSendAnyway();
            }}
          >
            Send Anyway
          </button>
          <button
            className="bg-red-500 text-[16px] font-medium w-[150px] p-[12px_16px] text-white rounded-[8px] mt-[12px]"
            type="button"
            onClick={() => {
              setIsVideoLinkNotAttachedModalOpen(false);
              onCancel();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalRoot>
  );
};
