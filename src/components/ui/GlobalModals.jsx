import {
  Modal,
  TextInput,
  Tabs,
  CopyButton,
  ActionIcon,
  Textarea,
  Table,
  Checkbox,
  Loader,
  Divider,
} from "@mantine/core";
import { useGlobalModals } from "../../store/globalModals";
import { LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import CustomVideoInput from "./CustomVideoInput";
import CustomButton from "./CustomButton";
import { useCallback, useEffect, useRef, useState } from "react";
import Quill from "quill";
import {
  ARROW_RIGHT,
  CANCAL_ICON,
  COPY_TEXT_ICON,
  EMAIL_ICON,
  EMBED_ICON,
  SMS_ICON,
} from "../../assets/icons/DynamicIcons.jsx";
import {
  // SMSTextEditor,
  StartRecordingBtn,
  TextEditor,
} from "./LibraryComponents";
import {
  deleteVideo,
  getContacts,
  updateUserDomain,
  updateVideo,
} from "../../api/libraryAPIs";
import { useUserStore } from "../../store/userStore";
import {
  getContactsBasedOnTags,
  sendEmailToSelectedContacts,
  sendSMSToSelectedContacts,
} from "../../api/commsAPIs";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import CustomMultiSelect from "./CustomMultiSelect.jsx";
import CustomTagsSelect from "./CustomTagsSelect.jsx";

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

const ShareModalRoot = ({ loadingOverlay, showModal, onClose, children }) => {
  const divRef = useRef(null); // Reference to the div
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (divRef.current) {
      const element = divRef.current;
      const elementHeight = element.scrollHeight;
      const viewportHeight = window.innerHeight * 0.8; // 80vh in pixels

      // Check if the element height exceeds 80vh
      setIsOverflowing(elementHeight > viewportHeight);
    }
  }, [children]);

  return (
    <Modal
      id="share-modal"
      opened={showModal}
      centered
      size="auto"
      withCloseButton={false}
      radius={12}
      padding={24}
    >
      <LoadingOverlay
        visible={loadingOverlay ? loadingOverlay : false}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <button className="absolute top-[16px] right-[16px]" onClick={onClose}>
        <CANCAL_ICON />
      </button>
      <div
        id="share-modal-scrollableDiv"
        ref={divRef}
        className={`overflow-auto h-full max-h-[80vh] w-full ${
          isOverflowing ? "mr-[10px] mt-[10px]" : ""
        }`}
      >
        {children}
      </div>
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

  useEffect(() => {
    let timeoutId;

    if (isWarningModalOpen) {
      timeoutId = setTimeout(() => {
        setIsWarningModalOpen(false);
      }, 30000);
    }

    return () => {
      clearTimeout(timeoutId); // Clear the specific timeout using the ID
    };
  }, [isWarningModalOpen, setIsWarningModalOpen]);

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
        <h2 className="font-bold text-[24px]">Notice</h2>
        <p className="text-[16px] text-gray-500">
          Screen recording is not supported in this window.
          <br />
          Please switch to the opened tab to continue recording.
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

  // State to update the Video Detail Screen State
  const setVideoDetail = useUserStore((state) => state.setVideoDetail);

  // Modal Form
  const form = useForm({
    initialValues: {
      videoName: videoToBeEdited?.title || "",
      videoDescription: videoToBeEdited?.description || "",
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
      setVideoDetail(response.data.video);

      toast.success("Video Updated Successfully", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.error(response.error || "Error while updating video", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    // Find the Video in the Videos Data and update it

    const updatedVideosData = videosData.recordedVideos.map((video) => {
      if (video._id === videoToBeEdited._id) {
        return response.data.video;
      }
      return video;
    });

    setVideosData({
      ...videosData,
      recordedVideos: updatedVideosData,
    });

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
  const pagePath = window.location.pathname.split("/")[1];

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

  const historyData = useUserStore((state) => state.historyData);
  const setHistoryData = useUserStore((state) => state.setHistoryData);

  const videoToBeShared = useGlobalModals((state) => state.videoToBeShared);

  const contactTagsData = useGlobalModals((state) => state.contactTagsData);

  const setIsVideoLinkNotAttachedModalOpen = useGlobalModals(
    (state) => state.setIsVideoLinkNotAttachedModalOpen
  );

  const openContactsLinkedWithTagsModal = useGlobalModals(
    (state) => state.openContactsLinkedWithTagsModal
  );
  const setOpenContactsLinkedWithTagsModal = useGlobalModals(
    (state) => state.setOpenContactsLinkedWithTagsModal
  );

  const [activeTab, setActiveTab] = useState("email");
  const [activeSubTab, setActiveSubTab] = useState("contacts");

  // State to store the content of Input Field of SMS
  const [sendAttachmentWithSMS, setSendAttachmentWithSMS] = useState(true);

  const emailForm = useForm({
    initialValues: {
      emailSubject: "",
      selectedEmailContacts: [],
      selectedContactTags: [],
    },

    validate: {
      emailSubject: (value) => {
        if (value.length < 3) {
          return "Email Subject must be at least 3 characters long";
        }
      },

      selectedEmailContacts: (value) => {
        if (activeSubTab === "contacts" && value.length === 0) {
          return "Please select at least one contact";
        }
      },

      // Validate contact tags if active sub tab is tags
      selectedContactTags: (value) => {
        if (activeSubTab === "tags" && value.length === 0) {
          return "Please select at least one tag";
        }
      },
    },
  });

  const smsForm = useForm({
    initialValues: {
      smsContent: videoToBeShared?.shareableLink
        ? `\n\n${videoToBeShared.shareableLink}`
        : "",
      selectedSMSContacts: [],
      selectedContactTags: [],
    },

    validate: {
      selectedSMSContacts: (value) => {
        if (activeSubTab === "contacts" && value.length === 0) {
          return "Please select at least one contact";
        }
      },
      // Validate contact tags if active sub tab is tags
      selectedContactTags: (value) => {
        if (activeSubTab === "tags" && value.length === 0) {
          return "Please select at least one tag";
        }
      },
    },
  });

  // State for Email Subject
  const [emailContent, setEmailContent] = useState("");
  // const [selectedContactTags, setSelectedContactTags] = useState([]);
  const [editorContent, setEditorContent] = useState(null);

  const [contactsLinkedWithTags, setContactsLinkedWithTags] = useState([]);
  const [fetchingContactsLinkedWithTags, setFetchingContactsLinkedWithTags] =
    useState(false);

  //  States to store Contacts in the required Formate for MultiSelect
  const [emailContacts, setEmailContacts] = useState([]);
  const [smsContacts, setSMSContacts] = useState([]);
  const [contactsPage, setContactsPage] = useState(1);
  // const [searchQuery, setSearchQuery] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [loadingSearchedContacts, setLoadingSearchedContacts] = useState(false);
  const [noContactSelectedError, setNoContactSelectedError] = useState(false);
  // For undo/redo functionality
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Use a ref to access the quill instance directly
  const quillRef = useRef();

  // SMS Ref for finding cursor position
  const textAreaRef = useRef();

  // Testing Query
  const fetchContactsQuery = useQuery({
    queryKey: ["fetchContactsQuery", contactsPage],
    queryFn: () =>
      getContacts({ page: contactsPage, pageLimit: 100, search: "" }),
    placeholderData: keepPreviousData,
  });

  // Function to handle Initail Email Send
  const ValidateEmailSend = () => {
    let delta = quillRef.current.getContents();
    const quillHTML = quillGetHTML(delta);

    setEmailContent(quillHTML);

    // Validation Checks
    const validation = emailForm.validate();

    if (validation.errors.selectedEmailContacts) {
      return setNoContactSelectedError(true);
    }

    if (validation.hasErrors) {
      return console.log("Email Form Validation Failed!");
    }

    if (quillHTML.includes(videoToBeShared?.shareableLink)) {
      return handleSubmitEmail(quillHTML);
    }

    setIsVideoLinkNotAttachedModalOpen(true);
    setIsShareVideoModalOpen(false);
  };

  const handleSendWithoutVideoLink = () => {
    if (activeTab === "email") {
      return handleSubmitEmail(emailContent);
    }

    return handleSubmitSMS();
  };

  const ValidateSMSSend = () => {
    // Validation Checks
    const validation = smsForm.validate();

    if (validation.hasErrors) {
      return setNoContactSelectedError(true);
    }

    if (smsForm.values.smsContent.includes(videoToBeShared?.shareableLink)) {
      return handleSubmitSMS();
    }

    setIsVideoLinkNotAttachedModalOpen(true);
    setIsShareVideoModalOpen(false);
  };

  const handleSubmitEmail = async (htmlContent) => {
    setModalLoadingOverlay(true);

    const API_DATA = {
      contactIds:
        activeTab === "email" && activeSubTab === "tags"
          ? contactsLinkedWithTags || []
          : emailForm.values.selectedEmailContacts || [],
      message: htmlContent,
      subject: emailForm.values.emailSubject,
      videoId: videoToBeShared._id || "",
      uploadedVideoName: videoToBeShared?.title,
    };

    // // Send Email API
    const response = await sendEmailToSelectedContacts(API_DATA);

    if (response.success) {
      setEditorContent(null);

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
          uploadedVideoName: history.videoName,
          contactName: history.data.contactName,
          contactAddress: history.data.contactAddress,
          sendType: history.data.sendType,
          subject: history.data.subject,
          status: history.data.status,
          createdAt: history.data.createdAt,
        };
      });

      setHistoryData([...historyData, ...newHistoryData]);

      emailForm.reset();

      // Clear the Quill Editor
      // quillRef.current.setContents("");

      // Close the Modal
      setIsVideoLinkNotAttachedModalOpen(false);
      setModalLoadingOverlay(false);
      setIsShareVideoModalOpen(false);
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

    const API_DATA = {
      contactIds:
        activeTab === "sms" && activeSubTab === "tags"
          ? contactsLinkedWithTags || []
          : smsForm.values.selectedSMSContacts || [],
      message: smsForm.values.smsContent,
      videoId: videoToBeShared._id || "",
      sendAttachment: sendAttachmentWithSMS,
      uploadedVideoName: videoToBeShared?.title,
    };

    // Send SMS API
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
          uploadedVideoName: history.videoName,
          contactName: history.data.contactName,
          contactAddress: history.data.contactAddress,
          sendType: history.data.sendType,
          subject: history.data.subject,
          status: history.data.status,
          createdAt: history.data.createdAt,
        };
      });
      setHistoryData([...historyData, ...newHistoryData]);

      setIsVideoLinkNotAttachedModalOpen(false);
      setModalLoadingOverlay(false);

      smsForm.reset();

      // Close the Modal
      setIsShareVideoModalOpen(false);
      setActiveTab("email");
      setActiveSubTab("contacts");
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

  const handleSelectEmailTag = async (selectedTags) => {
    if (activeTab === "email") {
      emailForm.setFieldValue("selectedContactTags", selectedTags);
    }

    if (activeTab === "sms") {
      smsForm.setFieldValue("selectedContactTags", selectedTags);
    }

    setFetchingContactsLinkedWithTags(true);

    const updatedTagsArray = selectedTags.map((tag) => tag.label);

    if (updatedTagsArray.length < 1) {
      setFetchingContactsLinkedWithTags(false);
      return setContactsLinkedWithTags([]);
    }

    const response = await getContactsBasedOnTags(updatedTagsArray);

    if (response.success) {
      if (activeTab === "email") {
        // Filter out the contacts with no email address
        const filteredContacts = response.data.contacts.filter(
          (contact) => contact.email && contact.email.trim() !== ""
        );

        setContactsLinkedWithTags(filteredContacts);
      } else {
        // Filter out the contacts with no phone number
        const filteredContacts = response.data.contacts.filter(
          (contact) => contact.phone && contact.phone.trim() !== ""
        );

        setContactsLinkedWithTags(filteredContacts);
      }
    } else {
      console.log("Error while getting Contact Tags: ", response.error);
    }

    setFetchingContactsLinkedWithTags(false);
  };

  // Function to Find cursor position
  const handleCursorPosition = () => {
    if (textAreaRef.current) {
      setCursorPos(textAreaRef.current.selectionStart);
    }
  };

  // ===============================================================
  //===================================================================
  const insertFirstNameAtCursor = () => {
    if (textAreaRef.current) {
      const start = textAreaRef.current.selectionStart;
      const end = textAreaRef.current.selectionEnd;
      const value = textAreaRef.current.value;
      const insertText = "{{contact.first_name}}";

      // Add current value to undo stack before changing
      setUndoStack([...undoStack, value]);
      // Clear redo stack on new changes
      setRedoStack([]);

      const newValue =
        value.substring(0, start) + insertText + value.substring(end);

      smsForm.setFieldValue("smsContent", newValue);

      // Focus and set cursor position after React updates DOM
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          const newPosition = start + insertText.length;
          textAreaRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPos(newPosition);
        }
      }, 0);
    }
  };

  const insertVideoLinkAtCursor = () => {
    if (textAreaRef.current && videoToBeShared?.shareableLink) {
      const start = textAreaRef.current.selectionStart;
      const end = textAreaRef.current.selectionEnd;
      const value = textAreaRef.current.value;
      const insertText = videoToBeShared.shareableLink;

      // Add current value to undo stack before changing
      setUndoStack([...undoStack, value]);
      // Clear redo stack on new changes
      setRedoStack([]);

      const newValue =
        value.substring(0, start) + insertText + value.substring(end);

      smsForm.setFieldValue("smsContent", newValue);

      // Focus and set cursor position after React updates DOM
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          const newPosition = start + insertText.length;
          textAreaRef.current.setSelectionRange(newPosition, newPosition);
          setCursorPos(newPosition);
        }
      }, 0);
    }
  };

  // ===============================================================
  //===================================================================

  // UseEffect to set the Contacts States
  useEffect(() => {
    if (fetchContactsQuery.isSuccess && fetchContactsQuery.data) {
      // Stop the Loading Overlay
      setModalLoadingOverlay(false);

      // Filter our the contacts that has email address
      const filteredEmailContacts = fetchContactsQuery.data.contacts.filter(
        (contact) => {
          return contact?.email && contact?.email.trim() !== "";
        }
      );

      // Filter our the contacts that has phone
      const filteredPhoneContacts = fetchContactsQuery.data.contacts.filter(
        (contact) => {
          return contact?.phone && contact?.phone.trim() !== "";
        }
      );

      // Create a new array containing objects with value and label
      if (filteredEmailContacts.length > 0) {
        const formattedContactsData = filteredEmailContacts.map((contact) => {
          return {
            value: contact.id,
            label:
              `${contact.firstNameLowerCase || ""} ${
                contact.lastNameLowerCase || ""
              }` + ` (${contact.email})`,
            ...contact,
          };
        });

        // Avoid duplicates by checking if the email already exists in the list
        setEmailContacts((prevContacts) => {
          const uniqueContacts = [
            ...prevContacts,
            ...formattedContactsData.filter(
              (newContact) =>
                !prevContacts.some(
                  (existingContact) =>
                    existingContact.email === newContact.email
                )
            ),
          ];
          return uniqueContacts;
        });
      }

      if (filteredPhoneContacts.length > 0) {
        const formattedContactsData = filteredPhoneContacts.map((contact) => {
          return {
            value: contact.id,
            label:
              `${contact.firstNameLowerCase || ""} ${
                contact.lastNameLowerCase || ""
              }` + ` (${contact.phone})`,
            ...contact,
          };
        });

        // Avoid duplicates by checking if the email already exists in the list
        setSMSContacts((prevContacts) => {
          const uniqueContacts = [
            ...prevContacts,
            ...formattedContactsData.filter(
              (newContact) =>
                !prevContacts.some(
                  (existingContact) =>
                    existingContact.phone === newContact.phone
                )
            ),
          ];
          return uniqueContacts;
        });
      }
    }

    // clean up
    return () => {};
  }, [
    fetchContactsQuery.data,
    fetchContactsQuery.isSuccess,
    setModalLoadingOverlay,
  ]);

  if (fetchContactsQuery.isError) {
    return toast.error("Couldn't fetch contacts", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  if (fetchContactsQuery.isPending) {
    setModalLoadingOverlay(true);
  }

  const fetchContactonSearch = async (query) => {
    try {
      const response = await getContacts({
        page: 1,
        pageLimit: 100,
        search: query,
      });

      if (response.contacts.length > 0) {
        // Filter our the contacts that has email address
        const filteredEmailContacts = response.contacts.filter((contact) => {
          return contact?.email && contact?.email.trim() !== "";
        });

        // Filter our the contacts that has phone
        const filteredPhoneContacts = response.contacts.filter((contact) => {
          return contact?.phone && contact?.phone.trim() !== "";
        });

        // Create a new array containing objects with value and label
        if (filteredEmailContacts.length > 0) {
          const formattedContactsData = filteredEmailContacts.map((contact) => {
            return {
              value: contact.id,
              label:
                `${contact.firstNameLowerCase || ""} ${
                  contact.lastNameLowerCase || ""
                }` + ` (${contact.email})`,
              ...contact,
            };
          });

          // Avoid duplicates by checking if the email already exists in the list
          setEmailContacts((prevContacts) => {
            const uniqueContacts = [
              ...prevContacts,
              ...formattedContactsData.filter(
                (newContact) =>
                  !prevContacts.some(
                    (existingContact) =>
                      existingContact.email === newContact.email
                  )
              ),
            ];
            return uniqueContacts;
          });
        }

        if (filteredPhoneContacts.length > 0) {
          const formattedContactsData = filteredPhoneContacts.map((contact) => {
            return {
              value: contact.id,
              label:
                `${contact.firstNameLowerCase || ""} ${
                  contact.lastNameLowerCase || ""
                }` + ` (${contact.phone})`,
              ...contact,
            };
          });

          // Avoid duplicates by checking if the email already exists in the list
          setSMSContacts((prevContacts) => {
            const uniqueContacts = [
              ...prevContacts,
              ...formattedContactsData.filter(
                (newContact) =>
                  !prevContacts.some(
                    (existingContact) =>
                      existingContact.phone === newContact.phone
                  )
              ),
            ];
            return uniqueContacts;
          });
        }
      }
      setLoadingSearchedContacts(false);
    } catch (error) {
      console.log("Error while fetching contacts: ", error);
      setLoadingSearchedContacts(false);
    }
  };

  // Function to handle the Search of Contacts
  const handleInputChange = (value) => {
    setLoadingSearchedContacts(true);
    if (
      activeTab === "email" &&
      value.length > 2 &&
      !emailContacts.some((contact) =>
        contact?.email?.toLowerCase()?.includes(value?.toLowerCase())
      )
    ) {
      debounce(() => {
        fetchContactonSearch(value);
      }, 500)();
    } else if (
      activeTab === "sms" &&
      value.length > 2 &&
      !smsContacts.some((contact) =>
        contact?.phone?.toLowerCase()?.includes(value?.toLowerCase())
      )
    ) {
      debounce(() => {
        fetchContactonSearch(value);
      }, 500)();
    } else {
      setLoadingSearchedContacts(false);
    }
  };

  //====================================================================

  //=======================================================================

  // Updated cursor tracking function - no changes needed if you're already using this

  // Add this effect to set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Make sure we only handle events when our textarea is focused
      if (document.activeElement !== textAreaRef.current) return;

      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (undoStack.length > 0) {
          const prevValue = undoStack.pop();
          setRedoStack([...redoStack, smsForm.values.smsContent]);
          smsForm.setFieldValue("smsContent", prevValue);
        }
      }

      // Redo: Ctrl/Cmd + Y
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        if (redoStack.length > 0) {
          const nextValue = redoStack.pop();
          setUndoStack([...undoStack, smsForm.values.smsContent]);
          smsForm.setFieldValue("smsContent", nextValue);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undoStack, redoStack, smsForm.values.smsContent]);

  //=========================================================================

  return (
    <>
      <VideoLinkNotAttachedModal
        onSendAnyway={() => {
          handleSendWithoutVideoLink();
        }}
        onCancel={() => {
          setIsShareVideoModalOpen(true);
        }}
      />

      {openContactsLinkedWithTagsModal && (
        <ShowContactsWithTagsModal
          contactsData={contactsLinkedWithTags}
          contactType={activeTab}
        />
      )}

      <ShareModalRoot
        loadingOverlay={modalLoadingOverlay}
        showModal={isShareVideoModalOpen}
        onClose={() => {
          setIsShareVideoModalOpen(false);
          setActiveTab("email");
          setActiveSubTab("contacts");
          // setShortCodesSelected([]);
          // setCustomFieldsSelected([]);
          setEmailContent("");
          emailForm.reset();
          smsForm.reset();
          setContactsLinkedWithTags([]);
          setEditorContent(null);
        }}
      >
        <div className="flex flex-col gap-[24px] w-[70vw]">
          <h3 className="text-[24px] font-medium">Share Video</h3>
          <div className="flex flex-col gap-[24px]">
            <Tabs
              color="#2A85FF"
              value={activeTab}
              onChange={(value) => {
                setActiveTab(value);
                setActiveSubTab("contacts");
                if (value === "email") {
                  smsForm.reset();
                }
                if (value === "sms") {
                  setEditorContent(null);
                  emailForm.reset();
                }
                setContactsLinkedWithTags([]);
                setNoContactSelectedError(false);
              }}
            >
              <Tabs.List className="flex items-center">
                {" "}
                {/* Ensure flex is enabled */}
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
                {/*  ml-auto here to push buttons to the right */}
                {/* Right-aligned buttons (conditionally rendered) */}
                <div className="flex items-center gap-[16px] ml-auto">
                  {activeTab === "email" ? (
                    <>
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
                        onClick={() => setIsShareVideoModalOpen(false)}
                      />
                    </>
                  ) : activeTab === "sms" ? (
                    <>
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
                        onClick={() => setIsShareVideoModalOpen(false)}
                      />
                    </>
                  ) : null}
                </div>
              </Tabs.List>

              <Tabs.Panel
                value="email"
                className="pt-[24px]  flex flex-col gap-[24px]"
              >
                <Tabs
                  color="#6C668526"
                  variant="pills"
                  radius="xl"
                  value={activeSubTab}
                  onChange={(value) => {
                    setActiveSubTab(value);
                    emailForm.setFieldValue("selectedContactTags", []);

                    setContactsLinkedWithTags([]);
                    emailForm.setFieldValue("selectedEmailContacts", []);
                  }}
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
                  <Tabs.Panel
                    value="contacts"
                    className="mt-[12px] flex flex-col gap-[8px]"
                  >
                    <div className="flex flex-col gap-[5px]">
                      <CustomMultiSelect
                        contactsData={emailContacts}
                        totalContacts={fetchContactsQuery?.data?.total}
                        currentPage={contactsPage}
                        setCurrentPage={setContactsPage}
                        isLoading={
                          fetchContactsQuery?.isRefetching ||
                          loadingSearchedContacts
                        }
                        isDisabled={fetchContactsQuery?.isPending}
                        // valueRef={emailForm.getInputProps(
                        //   "selectedEmailContacts"
                        // )}
                        value={emailForm.values.selectedEmailContacts}
                        onChange={(value) =>
                          emailForm.setFieldValue(
                            "selectedEmailContacts",
                            value
                          )
                        }
                        onInputChange={(value) => handleInputChange(value)}
                        currentTab="email"
                      />
                      {noContactSelectedError && (
                        <p className="text-[#fa5252] text-[12px] ms-[2px]">
                          {emailForm.errors.selectedEmailContacts}
                        </p>
                      )}
                    </div>
                    <p className="text-[#868e96] text-[14px] font-semibold">
                      - Please add at least 3 characters to search by name or
                      email.
                    </p>
                  </Tabs.Panel>

                  <Tabs.Panel value="tags" className="mt-[12px]">
                    <div className="flex lg:flex-row flex-col lg:items-center gap-[8px]">
                      <CustomTagsSelect
                        tagsData={contactTagsData}
                        value={emailForm.values.selectedContactTags}
                        onChange={(value) => handleSelectEmailTag(value)}
                      />
                      {/* <MultiSelect
                        className="lg:w-1/2 w-full"
                        placeholder={
                          emailForm.values.selectedContactTags?.length > 0
                            ? ""
                            : "Select one or Multiple Tags"
                        }
                        data={contactTagsData}
                        value={emailForm.values.selectedContactTags}
                        onChange={(value) => handleSelectEmailTag(value)}
                        maxDropdownHeight={200}
                        clearable
                        searchable
                        nothingFoundMessage="Nothing found..."
                        hidePickedOptions
                      /> */}
                      {fetchingContactsLinkedWithTags && (
                        <Loader color="#2A85FF" size="sm" />
                      )}
                      <div className="flex items-center gap-[4px]">
                        {contactsLinkedWithTags
                          .slice(0, 2)
                          .map((contact, index) => (
                            <p
                              key={index}
                              className="font-medium bg-[#2a85ff24] p-[5px_12px] rounded-full text-[12px]"
                            >
                              {contact.email}
                            </p>
                          ))}

                        {contactsLinkedWithTags.length > 2 && (
                          <p className="font-medium bg-[#2a85ff24] p-[5px_12px] rounded-full text-[12px]">
                            ...
                          </p>
                        )}
                        {contactsLinkedWithTags.length > 2 && (
                          <button
                            type="button"
                            className="text-primary text-[12px] ms-[8px] font-medium hover:underline"
                            onClick={() => {
                              setOpenContactsLinkedWithTagsModal(true);
                              setIsShareVideoModalOpen(false);
                            }}
                          >
                            View all {contactsLinkedWithTags?.length} Contacts
                          </button>
                        )}
                      </div>
                    </div>
                  </Tabs.Panel>
                </Tabs>
                <TextInput
                  label="Email Subject"
                  placeholder="Email Subject"
                  className="w-full max-w-[350px]"
                  id="emailSubject"
                  {...emailForm.getInputProps("emailSubject")}
                />
                <TextEditor
                  ref={quillRef}
                  editorContent={editorContent}
                  setEditorContent={setEditorContent}
                />
              </Tabs.Panel>

              <Tabs.Panel
                value="sms"
                className="pt-[24px] flex flex-col gap-[24px]"
              >
                <Tabs
                  color="#6C668526"
                  variant="pills"
                  radius="xl"
                  value={activeSubTab}
                  onChange={(value) => {
                    setActiveSubTab(value);
                    smsForm.setFieldValue("selectedContactTags", []);
                    setContactsLinkedWithTags([]);
                    smsForm.setFieldValue("selectedSMSContacts", []);
                  }}
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

                  <Tabs.Panel
                    value="contacts"
                    className="mt-[12px] flex flex-col gap-[8px]"
                  >
                    <div className="flex flex-col gap-[5px]">
                      <CustomMultiSelect
                        contactsData={smsContacts}
                        totalContacts={fetchContactsQuery?.data?.total}
                        currentPage={contactsPage}
                        setCurrentPage={setContactsPage}
                        isLoading={
                          fetchContactsQuery?.isRefetching ||
                          loadingSearchedContacts
                        }
                        isDisabled={fetchContactsQuery?.isPending}
                        // valueRef={smsForm.getInputProps("selectedSMSContacts")}
                        value={smsForm.values.selectedSMSContacts}
                        onChange={(value) =>
                          smsForm.setFieldValue("selectedSMSContacts", value)
                        }
                        onInputChange={(value) => handleInputChange(value)}
                        currentTab="sms"
                      />
                      {noContactSelectedError && (
                        <p className="text-red-500 text-[12px] font-semibold">
                          {smsForm.errors.selectedSMSContacts}
                        </p>
                      )}
                    </div>
                    <p className="text-[#868e96] text-[14px] font-semibold">
                      - Please add at least 3 characters to search by name, or
                      at least 5 numbers after the country code. i.e, +1
                    </p>
                  </Tabs.Panel>

                  <Tabs.Panel value="tags" className="mt-[12px]">
                    <div className="flex lg:flex-row flex-col lg:items-center gap-[8px]">
                      <CustomTagsSelect
                        tagsData={contactTagsData}
                        value={smsForm.values.selectedContactTags}
                        onChange={(value) => handleSelectEmailTag(value)}
                      />

                      {/* <MultiSelect
                        className="lg:w-1/2 w-full"
                        placeholder={
                          smsForm.values.selectedContactTags.length > 0
                            ? ""
                            : "Select one or Multiple Tags"
                        }
                        data={contactTagsData}
                        value={smsForm.values.selectedContactTags}
                        onChange={(value) => handleSelectEmailTag(value)}
                        clearable
                        searchable
                        nothingFoundMessage="Nothing found..."
                        hidePickedOptions
                      /> */}
                      {fetchingContactsLinkedWithTags && (
                        <Loader color="#2A85FF" size="sm" />
                      )}
                      <div className="flex items-center gap-[4px]">
                        {contactsLinkedWithTags
                          .slice(0, 2)
                          .map((contact, index) => (
                            <p
                              key={index}
                              className="font-medium bg-[#2a85ff24] p-[5px_12px] rounded-full text-[12px]"
                            >
                              {contact.name}
                            </p>
                          ))}

                        {contactsLinkedWithTags.length > 2 && (
                          <p className="font-medium bg-[#2a85ff24] p-[5px_12px] rounded-full text-[12px]">
                            ...
                          </p>
                        )}
                        {contactsLinkedWithTags.length > 2 && (
                          <button
                            type="button"
                            className="text-primary text-[12px] ms-[8px] font-medium hover:underline"
                            onClick={() => {
                              setOpenContactsLinkedWithTagsModal(true);
                              setIsShareVideoModalOpen(false);
                            }}
                          >
                            View all {contactsLinkedWithTags?.length} Contacts
                          </button>
                        )}
                      </div>
                    </div>
                  </Tabs.Panel>
                </Tabs>

                <div className="w-full">
                  {/* <p className="text-[14px] mb-[8px]">Content</p>
                  <div className="relative rounded-[12px] w-full h-[250px] !bg-[#F7F7F8] border border-[#D7D5DD] overflow-hidden">
                    <div className="flex items-center gap-[4px] w-full bg-white py-[8px] shadow-sm">
                      <button
                        type="button"
                        className="px-[8px] text-darkBlue text-[14px] font-medium w-fit text-start"
                        onClick={insertFirstNameAtCursor}
                        // onClick={() => {
                        //   smsForm.setFieldValue(
                        //     "smsContent",
                        //     `${smsForm.values.smsContent} {{contact.first_name}}`
                        //   );
                        // }}
                      >
                        Add First Name
                      </button>
                      <Divider orientation="vertical" className="!h-3/2" />
                      <button
                        type="button"
                        className="px-[8px] text-darkBlue text-[14px] font-medium w-fit text-start"
                        // onClick={() => {
                        //   smsForm.setFieldValue(
                        //     "smsContent",
                        //     `${smsForm.values.smsContent} ${videoToBeShared?.shareableLink} `
                        //   );
                        // }}

                        onClick={insertVideoLinkAtCursor}
                      >
                        Paste Video Link
                      </button>
                    </div>

                    <Textarea
                      id="smsContent-container"
                      ref={textAreaRef}
                      placeholder="SMS Content"
                      {...smsForm.getInputProps("smsContent")}
                      onClick={handleCursorPosition}
                      onKeyUp={handleCursorPosition}
                      minRows={8}
                      maxRows={8}
                      autosize
                      classNames={{
                        input: "background: transparent!;",
                      }}
                    />
                  </div> */}

                  {/* This is the updated div element to replace your existing one */}
                  <p className="text-[14px] mb-[8px]">Content</p>
                  <div className="relative rounded-[12px] w-full h-[250px] !bg-[#F7F7F8] border border-[#D7D5DD] overflow-hidden">
                    <div className="flex items-center gap-[4px] w-full bg-white py-[8px] shadow-sm">
                      <button
                        type="button"
                        className="px-[8px] text-darkBlue text-[14px] font-medium w-fit text-start"
                        onClick={() => {
                          if (textAreaRef.current) {
                            const start = textAreaRef.current.selectionStart;
                            const end = textAreaRef.current.selectionEnd;
                            const value = textAreaRef.current.value;
                            const insertText = "{{contact.first_name}}";

                            const newValue =
                              value.substring(0, start) +
                              insertText +
                              value.substring(end);

                            smsForm.setFieldValue("smsContent", newValue);

                            // Focus and set cursor position after React updates DOM
                            setTimeout(() => {
                              if (textAreaRef.current) {
                                textAreaRef.current.focus();
                                const newPosition = start + insertText.length;
                                textAreaRef.current.setSelectionRange(
                                  newPosition,
                                  newPosition
                                );
                                setCursorPos(newPosition);
                              }
                            }, 0);
                          }
                        }}
                      >
                        Add First Name
                      </button>
                      <Divider orientation="vertical" className="!h-3/2" />
                      <button
                        type="button"
                        className="px-[8px] text-darkBlue text-[14px] font-medium w-fit text-start"
                        onClick={() => {
                          if (textAreaRef.current) {
                            const start = textAreaRef.current.selectionStart;
                            const end = textAreaRef.current.selectionEnd;
                            const value = textAreaRef.current.value;
                            const insertText =
                              videoToBeShared?.shareableLink || "";

                            const newValue =
                              value.substring(0, start) +
                              insertText +
                              value.substring(end);

                            smsForm.setFieldValue("smsContent", newValue);

                            // Focus and set cursor position after React updates DOM
                            setTimeout(() => {
                              if (textAreaRef.current) {
                                textAreaRef.current.focus();
                                const newPosition = start + insertText.length;
                                textAreaRef.current.setSelectionRange(
                                  newPosition,
                                  newPosition
                                );
                                setCursorPos(newPosition);
                              }
                            }, 0);
                          }
                        }}
                      >
                        Paste Video Link
                      </button>
                      <Divider orientation="vertical" className="!h-3/2" />
                      <button
                        type="button"
                        className="px-[8px] text-darkBlue text-[14px] font-medium w-fit text-start"
                        onClick={() => {
                          // Simple undo functionality
                          if (
                            textAreaRef.current &&
                            undoStack &&
                            undoStack.length > 0
                          ) {
                            const prevValue = undoStack.pop();
                            redoStack.push(smsForm.values.smsContent);
                            smsForm.setFieldValue("smsContent", prevValue);

                            setTimeout(() => {
                              if (textAreaRef.current) {
                                textAreaRef.current.focus();
                              }
                            }, 0);
                          }
                        }}
                      >
                        Undo
                      </button>
                      <button
                        type="button"
                        className="px-[8px] text-darkBlue text-[14px] font-medium w-fit text-start"
                        onClick={() => {
                          // Simple redo functionality
                          if (
                            textAreaRef.current &&
                            redoStack &&
                            redoStack.length > 0
                          ) {
                            const nextValue = redoStack.pop();
                            undoStack.push(smsForm.values.smsContent);
                            smsForm.setFieldValue("smsContent", nextValue);

                            setTimeout(() => {
                              if (textAreaRef.current) {
                                textAreaRef.current.focus();
                              }
                            }, 0);
                          }
                        }}
                      >
                        Redo
                      </button>
                    </div>

                    <Textarea
                      id="smsContent-container"
                      ref={textAreaRef}
                      placeholder="SMS Content"
                      {...smsForm.getInputProps("smsContent")}
                      onClick={handleCursorPosition}
                      onKeyUp={handleCursorPosition}
                      onChange={(e) => {
                        // Store current value in undo stack before changing
                        if (typeof undoStack !== "undefined") {
                          undoStack.push(smsForm.values.smsContent);
                          // Clear redo stack on new changes
                          if (typeof redoStack !== "undefined") {
                            redoStack.length = 0;
                          }
                        }
                        // Process normal onChange behavior
                        smsForm.getInputProps("smsContent").onChange(e);
                        handleCursorPosition();
                      }}
                      onKeyDown={(e) => {
                        // Add keyboard shortcuts for undo/redo
                        if ((e.ctrlKey || e.metaKey) && e.key === "z") {
                          e.preventDefault();
                          // Trigger undo button click
                          document.querySelector("button:nth-child(5)").click();
                        }
                        if ((e.ctrlKey || e.metaKey) && e.key === "y") {
                          e.preventDefault();
                          // Trigger redo button click
                          document.querySelector("button:nth-child(6)").click();
                        }
                      }}
                      minRows={8}
                      maxRows={8}
                      autosize
                      classNames={{
                        input: "background: transparent!;",
                      }}
                    />
                  </div>

                  <Checkbox
                    checked={sendAttachmentWithSMS}
                    value={sendAttachmentWithSMS}
                    onChange={(e) => setSendAttachmentWithSMS(e.target.checked)}
                    label="Attach thumbnail to SMS"
                    className="mt-[8px]"
                  />
                </div>
              </Tabs.Panel>

              <Tabs.Panel
                value="embed"
                className="pt-[24px] flex flex-col gap-[24px] items-end"
              >
                <div className="w-full">
                  {pagePath !== "recordings" && (
                    <div className="mb-[24px] flex flex-col gap-[8px]">
                      <h3 className="font-normal text-[14px]">Video Link</h3>
                      <div className="w-full rounded-[8px] bg-[#F7F7F8] border border-[#D7D5DD] p-[16px]">
                        {videoToBeShared.shareableLink}
                      </div>
                    </div>
                  )}

                  <div className="mb-[8px] flex gap-[100px] items-end">
                    <p className="text-[14px]">Embed Link</p>
                    {pagePath === "recordings" && (
                      <CopyButton
                        value={videoToBeShared.shareableLink}
                        timeout={3000}
                      >
                        {({ copied, copy }) => (
                          <ActionIcon
                            onClick={copy}
                            className="!w-fit !bg-gray-200 !p-[4px]"
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
                    )}
                  </div>
                  <div className="relative rounded-[12px] w-full min-h-[250px] h-fit bg-[#F7F7F8] border border-[#D7D5DD] overflow-hidden">
                    {pagePath === "recordings" && (
                      <CopyButton
                        value={videoToBeShared?.embeddedLink}
                        timeout={3000}
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
                    )}
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
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </ShareModalRoot>
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
      toast.success("Video Deleted Successfully", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Remove the Video from the Videos Data
      const updatedVideosData = videosData.recordedVideos.filter(
        (video) => video._id !== videoToBeDeleted._id
      );

      setVideosData({
        ...videosData,
        recordedVideos: updatedVideosData,
      });
    } else {
      toast.error(response.error || "Error while deleting video", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }

    setModalLoadingOverlay(false);
    setIsDeleteVideoModalOpen(false);
    setTimeout(() => {
      setVideoToBeDeleted({});
    }, 1000);
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
  const [searchQuery, setSearchQuery] = useState("");

  const [sortedContacts, setSortedContacts] = useState([]);

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

  const fetchContactsOnSearch = async (query) => {
    setModalLoadingOverlay(true);
    // Fetch Contacts from the Database
    const response = await getContacts({
      page: contactsPagination,
      pageLimit: 100,
      search: query,
    });
    if (response.success) {
      setUserContactsData(response.data.contacts);
    } else {
      console.log("Error while fetching contacts: ", response.error);
    }
    setModalLoadingOverlay(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchContacts = useCallback(
    debounce((query) => fetchContactsOnSearch(query), 500), // Adjust debounce time as needed
    []
  );

  useEffect(() => {
    const fetchContacts = async () => {
      setModalLoadingOverlay(true);
      // Fetch Contacts from the Database
      const response = await getContacts({
        page: 1,
        pageLimit: 100,
        search: "",
      });

      if (response.success) {
        console.log("Contacts", response.data.contacts);
        setUserContactsData(response.data.contacts);
      } else {
        console.log("Error while fetching contacts: ", response.error);
      }
      setModalLoadingOverlay(false);
    };

    if (searchQuery === "") {
      fetchContacts("");
      return;
    }

    if (searchQuery !== "" && searchQuery.length < 3) {
      return;
    }

    // Trigger the debounced function whenever searchQuery changes
    debouncedFetchContacts(searchQuery);

    // Cleanup to cancel any pending debounce on unmount or searchQuery change
    return () => debouncedFetchContacts.cancel();
  }, [
    searchQuery,
    debouncedFetchContacts,
    setModalLoadingOverlay,
    setUserContactsData,
  ]);

  useEffect(() => {
    const filteredContacts = userContactsData?.contacts?.filter((contact) => {
      return contact?.email && contact?.email.trim() !== "";
    });

    let updatedContacts;

    if (searchQuery.length > 2) {
      // Skip combining selectedContacts when searchQuery is greater than 2 characters
      updatedContacts = filteredContacts;
    } else {
      // Create a map for deduplication
      const contactMap = new Map();

      // Add selectedContacts first to ensure they appear at the top
      selectedContacts.forEach((contact) => {
        contactMap.set(contact.id, contact);
      });

      // Add filteredContacts, avoiding duplicates
      filteredContacts?.forEach((contact) => {
        if (!contactMap.has(contact.id)) {
          contactMap.set(contact.id, contact);
        }
      });

      // Convert the map back to an array
      updatedContacts = Array.from(contactMap.values());
    }

    // Sort the array: selected contacts on top
    const sortedArray = updatedContacts.sort((a, b) => {
      const isSelectedA = selectedContacts.some((sel) => sel.id === a.id);
      const isSelectedB = selectedContacts.some((sel) => sel.id === b.id);

      if (isSelectedA && !isSelectedB) return -1;
      if (!isSelectedA && isSelectedB) return 1;
      return 0;
    });

    setSortedContacts(sortedArray);
  }, [selectedContacts, userContactsData?.contacts, searchQuery]);

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
      <div className="w-[70vw] flex flex-col gap-[10px] h-[70dvh] justify-between">
        <div className="flex flex-col gap-[16px]">
          <h2 className="font-medium text-[24px]">Select Contacts</h2>
          <div className="flex items-start gap-[16px]">
            <div className="flex flex-col gap-[4px]">
              <TextInput
                placeholder="Search Contacts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-[350px] searchContactsInput"
              />
              <p className="text-[#868e96] text-[14px] font-semibold">
                - Please add at least 3 characters to search by name or email.
              </p>
            </div>
            <button
              className="p-[10px_16px] bg-primary text-white rounded-[8px] text-[14px] font-medium w-fit min-w-[168.59px]"
              type="button"
              onClick={() => {
                setSendToAllContacts(true);
                setIsContactsSelectionModalOpen(false);
                setIsShareVideoModalOpen(true);
              }}
            >
              Send To All Contacts
            </button>
          </div>

          {sortedContacts?.length > 0 ? (
            <div className="selectContactsDiv h-[calc(70dvh-298px)] overflow-auto">
              <Table stickyHeader stickyHeaderOffset={0}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Contact Name</Table.Th>
                    <Table.Th>Email Address</Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedContacts?.map((contact) => {
                    const isChecked = selectedContacts?.some(
                      (selectedContact) =>
                        selectedContact?.id === contact?.id &&
                        selectedContact?.isChecked
                    );

                    const fullName = [
                      contact?.firstNameLowerCase,
                      contact?.lastNameLowerCase,
                    ]
                      .filter(Boolean) // Filters out null, undefined, or empty values
                      .join(" "); // Joins the remaining values with a space

                    return (
                      <Table.Tr key={contact.id}>
                        <Table.Td className="capitalize">{fullName}</Table.Td>
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
          ) : (
            <div className="h-[calc(70dvh-310px)] flex justify-center items-center">
              <p className="text-gray-500">
                No Contacts Found. Please add contacts to send emails.
              </p>
            </div>
          )}
        </div>
        <div
          className={`bg-white p-[12px_24px]  flex-col gap-[24px] justify-center items-center ${
            sortedContacts?.length > 0 ? "flex" : "hidden"
          }`}
        >
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
            Send To Selected Contacts ({selectedContacts?.length})
          </button>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortedContacts, setSortedContacts] = useState([]);

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

  const handleLoadMoreContacts = async () => {
    setModalLoadingOverlay(true);

    // Fetch Contacts from the Database
    const response = await getContacts({
      page: contactsPagination + 1,
      pageLimit: 100,
      search: "",
    });

    if (response.success) {
      console.log("agya");

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

  const fetchContactsOnSearch = async (query) => {
    setModalLoadingOverlay(true);
    // Fetch Contacts from the Database
    const response = await getContacts({
      page: 1,
      pageLimit: 100,
      search: query,
    });

    if (response.success) {
      setUserContactsData(response.data.contacts);
    } else {
      console.log("Error while fetching contacts: ", response.error);
    }
    setModalLoadingOverlay(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchContacts = useCallback(
    debounce((query) => fetchContactsOnSearch(query), 500), // Adjust debounce time as needed
    []
  );

  useEffect(() => {
    const fetchContacts = async () => {
      setModalLoadingOverlay(true);
      // Fetch Contacts from the Database
      const response = await getContacts({
        page: 1,
        pageLimit: 100,
        search: "",
      });

      if (response.success) {
        setUserContactsData(response.data.contacts);
      } else {
        console.log("Error while fetching contacts: ", response.error);
      }
      setModalLoadingOverlay(false);
    };

    if (searchQuery === "") {
      fetchContacts("");
      return;
    }

    if (searchQuery !== "" && searchQuery.length < 3) {
      return;
    }

    // Trigger the debounced function whenever searchQuery changes
    debouncedFetchContacts(searchQuery);

    // Cleanup to cancel any pending debounce on unmount or searchQuery change
    return () => debouncedFetchContacts.cancel();
  }, [
    searchQuery,
    debouncedFetchContacts,
    setModalLoadingOverlay,
    setUserContactsData,
  ]);

  useEffect(() => {
    const allContacts = userContactsData?.contacts || [];

    // Filter contacts with a valid phone number
    const filteredContacts = allContacts.filter((contact) => {
      return contact?.phone && contact?.phone.trim() !== "";
    });

    let updatedContacts;

    if (searchQuery.length > 2) {
      // Skip combining selectedContacts when searchQuery is greater than 2 characters
      updatedContacts = filteredContacts;
    } else {
      // Create a map to ensure uniqueness
      const contactMap = new Map();

      // Add selectedSMSContacts first to prioritize them
      selectedSMSContacts.forEach((contact) => {
        contactMap.set(contact.id, contact);
      });

      // Add filteredContacts, avoiding duplicates
      filteredContacts.forEach((contact) => {
        if (!contactMap.has(contact.id)) {
          contactMap.set(contact.id, contact);
        }
      });

      // Convert map to array
      updatedContacts = Array.from(contactMap.values());
    }

    // Sort the array: selected contacts appear at the top
    const sortedArray = updatedContacts.sort((a, b) => {
      const isSelectedA = selectedSMSContacts.some((sel) => sel.id === a.id);
      const isSelectedB = selectedSMSContacts.some((sel) => sel.id === b.id);

      if (isSelectedA && !isSelectedB) return -1;
      if (!isSelectedA && isSelectedB) return 1;
      return 0;
    });

    setSortedContacts(sortedArray);
  }, [selectedSMSContacts, userContactsData?.contacts, searchQuery]);

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
          <div className="flex items-start gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <TextInput
                placeholder="Search Contacts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-[350px] searchContactsInput"
              />
              <p className="text-[#868e96] text-[14px] font-semibold max-w-[400px]">
                - Please add at least 3 characters to search by name, or at
                least 5 numbers after the country code. i.e, +1
              </p>
            </div>

            <button
              className="p-[10px_16px] bg-primary text-white rounded-[8px] text-[14px] font-medium w-fit min-w-[168.59px]"
              type="button"
              onClick={() => {
                setSendToAllContacts(true);
                setIsSMSContactsSelectionModalOpen(false);
                setIsShareVideoModalOpen(true);
              }}
            >
              Send To All Contacts
            </button>
          </div>
          {sortedContacts?.length > 0 ? (
            <div className="selectContactsDiv h-[calc(70dvh-310px)] overflow-auto">
              <Table stickyHeader stickyHeaderOffset={0}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Contact Name</Table.Th>
                    <Table.Th>Phone Number</Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedContacts?.map((contact) => {
                    const isChecked = selectedSMSContacts?.some(
                      (selectedContact) =>
                        selectedContact?.id === contact?.id &&
                        selectedContact?.isChecked
                    );

                    const fullName = [
                      contact?.firstNameLowerCase,
                      contact?.lastNameLowerCase,
                    ]
                      .filter(Boolean) // Filters out null, undefined, or empty values
                      .join(" "); // Joins the remaining values with a space8

                    const formattedNumber =
                      contact?.phone?.slice(0, -7) +
                      "-" +
                      contact?.phone?.slice(-7, -4) +
                      "-" +
                      contact?.phone?.slice(-4);

                    return (
                      <Table.Tr key={contact.id}>
                        <Table.Td className="capitalize">{fullName}</Table.Td>
                        <Table.Td>{formattedNumber}</Table.Td>
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
          ) : (
            <div className="h-[calc(70dvh-310px)] flex justify-center items-center">
              <p className="text-gray-500">
                No Contacts Found. Please add contacts to send emails.
              </p>
            </div>
          )}
        </div>
        <div
          className={`bg-white p-[12px_24px] flex-col gap-[16px] justify-center items-center ${
            sortedContacts?.length > 0 ? "flex" : "hidden"
          }`}
        >
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
            Send To Selected Contacts ({selectedSMSContacts?.length})
          </button>
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
        <div className="flex flex-col items-center gap-[8px]">
          <p className="text-[16px] text-gray-500">
            Video Link is not attached to the message!
          </p>
          <div className="flex items-center gap-[4px] text-[14px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
              width="20"
              height="20"
            >
              <path
                d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"
                fill="currentColor"
              />
            </svg>
            <p style={{ userSelect: "none" }}>Paste Video Link</p>
          </div>
        </div>
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
            Go Back
          </button>
        </div>
      </div>
    </ModalRoot>
  );
};

export const UpdateUserDomainModal = () => {
  const modalLoadingOverlay = useGlobalModals(
    (state) => state.modalLoadingOverlay
  );
  const setModalLoadingOverlay = useGlobalModals(
    (state) => state.setModalLoadingOverlay
  );
  const updateDomainModalOpen = useGlobalModals(
    (state) => state.updateDomainModalOpen
  );
  const setUpdateDomainModalOpen = useGlobalModals(
    (state) => state.setUpdateDomainModalOpen
  );

  const userDomain = useUserStore((state) => state.userDomain);
  const setUserDomain = useUserStore((state) => state.setUserDomain);

  const [newDomain, setNewDomain] = useState("");

  const handleUpdateUserDomain = async () => {
    setModalLoadingOverlay(true);

    const response = await updateUserDomain({
      domain: newDomain,
      showPopupAgain: false,
    });

    if (response.success) {
      setUpdateDomainModalOpen(false);
      setUserDomain(newDomain);

      toast.success("Domain updated successfully.", {
        autoClose: 3000,
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } else {
      toast.error(response.error || "Couldn't update domain.", {
        autoClose: 3000,
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }

    setModalLoadingOverlay(false);
  };

  const handleDontShowPopupAgain = async () => {
    setModalLoadingOverlay(true);

    const response = await updateUserDomain({
      domain: "",
      showPopupAgain: false,
    });

    if (response.success) {
      setUpdateDomainModalOpen(false);
      setUserDomain(newDomain);

      toast.success("Updated Domain Prefernces!", {
        autoClose: 3000,
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } else {
      toast.error(response.error || "Couldn't update domain preferences.", {
        autoClose: 3000,
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }

    setModalLoadingOverlay(false);
  };

  useEffect(() => {
    setNewDomain(userDomain);
  }, [userDomain]);

  return (
    <ModalRoot
      loadingOverlay={modalLoadingOverlay}
      showModal={updateDomainModalOpen}
      onClose={() => {
        setUpdateDomainModalOpen(false);
        setNewDomain(userDomain);
      }}
    >
      <div className="flex flex-col gap-[16px] w-[500px]">
        <h1 className="text-[24px] font-bold">Add Domain</h1>
        <div className="flex flex-col gap-[8px]">
          <p className="text-[16px] font-medium">Domain Name</p>
          <TextInput
            value={newDomain}
            onChange={(e) => {
              setNewDomain(e.target.value);
            }}
            className="w-[350px]"
          />
        </div>
        <div className="flex items-center gap-[24px]">
          <button
            className="bg-primary text-[16px] font-medium w-full p-[12px_16px] text-white rounded-[8px] mt-[12px]"
            type="button"
            onClick={() => {
              handleUpdateUserDomain();
            }}
          >
            Save Domain
          </button>
          <button
            className="bg-red-600 text-[16px] font-medium w-full p-[12px_16px] text-white rounded-[8px] mt-[12px]"
            type="button"
            onClick={() => {
              handleDontShowPopupAgain();
            }}
          >
            Don&apos;t show again
          </button>
        </div>
      </div>
    </ModalRoot>
  );
};

const ShowContactsWithTagsModal = ({ contactsData, contactType }) => {
  const modalLoadingOverlay = useGlobalModals(
    (state) => state.modalLoadingOverlay
  );
  const setIsShareVideoModalOpen = useGlobalModals(
    (state) => state.setIsShareVideoModalOpen
  );

  const openContactsLinkedWithTagsModal = useGlobalModals(
    (state) => state.openContactsLinkedWithTagsModal
  );
  const setOpenContactsLinkedWithTagsModal = useGlobalModals(
    (state) => state.setOpenContactsLinkedWithTagsModal
  );

  const rows = contactsData.map((contact, index) => {
    return (
      <Table.Tr key={index}>
        <Table.Td className=" text-[14px] capitalize">{contact?.name}</Table.Td>
        <Table.Td className=" text-[14px]">
          {contactType === "email" ? contact?.email : contact?.phone}
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <ModalRoot
      loadingOverlay={modalLoadingOverlay}
      showModal={openContactsLinkedWithTagsModal}
      onClose={() => {
        setOpenContactsLinkedWithTagsModal(false);
        setIsShareVideoModalOpen(true);
      }}
    >
      <div className="flex flex-col gap-[24px] w-[70vw] lg:w-[50vw] overflow-hidden max-h-[500px]">
        <h3 className="text-[24px] font-semibold">
          Selected Contacts{" "}
          <span className="text-[18px] text-primary">
            (Total: {contactsData.length})
          </span>
        </h3>
        {contactsData.length > 0 ? (
          <div className="h-[calc(100%-74.81px)] overflow-auto contactsLinkedWithTagsModal">
            <Table
              striped
              highlightOnHover
              withRowBorders={false}
              stripedColor="#F4F9FF"
              verticalSpacing="12px"
              stickyHeader
              stickyHeaderOffset={0}
            >
              <Table.Thead>
                <Table.Tr>
                  {/* <Table.Th>Serial No</Table.Th> */}
                  <Table.Th>Contact Name</Table.Th>
                  <Table.Th className="capitalize">
                    Contact {contactType}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </div>
        ) : (
          <div className="h-[150px] flex items-center justify-center text-center">
            <p className="text-[14px] text-gray-500 font-medium">
              No Tag Selected!
            </p>
          </div>
        )}
      </div>
    </ModalRoot>
  );
};
