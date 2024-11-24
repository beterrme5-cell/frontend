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
import closeIcon from "../../assets/icons/cancel-icon.svg";
import { useForm } from "@mantine/form";
import CustomVideoInput from "./CustomVideoInput";
import CustomButton from "./CustomButton";
import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import {
  COPY_TEXT_ICON,
  EMAIL_ICON,
  EMBED_ICON,
  SMS_ICON,
} from "../../assets/icons/DynamicIcons";
import { TextEditor } from "./LibraryComponents";
import { deleteVideo, getContacts, updateVideo } from "../../api/libraryAPIs";
import { useUserStore } from "../../store/userStore";
import ArrowRightIcon from "../../assets/icons/ArrowRight.svg";
import { sendEmailToSelectedContacts } from "../../api/commsAPIs";

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
      onClose={onClose}
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
        <img src={closeIcon} alt="close icon" />
      </button>
      {children}
    </Modal>
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

  const videoToBeShared = useGlobalModals((state) => state.videoToBeShared);

  const [activeTab, setActiveTab] = useState("email");
  const [activeSubTab, setActiveSubTab] = useState("contacts");

  // State to store the content of Input Field of SMS
  const [smsContent, setSmsContent] = useState("");

  // Use a ref to access the quill instance directly
  const quillRef = useRef();

  const handleSubmitEmail = async () => {
    // Get the Delta of the Quill Editor
    let delta = quillRef.current.getContents();

    setModalLoadingOverlay(true);

    // extract the emails from the selected contacts
    const selectedContactIds = selectedContacts.map((contact) => contact.id);

    // Send Email API
    const response = await sendEmailToSelectedContacts({
      contactIds: selectedContactIds,
      message: quillGetHTML(delta),
    });

    if (response.success) {
      console.log("Email Sent Successfully", response.data);

      // Clear the selected contacts
      setSelectedContacts([]);

      // Clear the Quill Editor
      quillRef.current.setContents("");

      // Close the Modal
      setIsShareVideoModalOpen(false);
    } else {
      console.log("Error while sending email: ", response.error);
    }
    setModalLoadingOverlay(false);
  };

  const handleSubmitSMS = async () => {
    console.log("SMS Content:", smsContent);

    console.log("selectedContacts", selectedContacts);
  };

  return (
    <ModalRoot
      loadingOverlay={modalLoadingOverlay}
      showModal={isShareVideoModalOpen}
      onClose={() => {
        setIsShareVideoModalOpen(false);
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
                      activeTab === "sms" ? "!text-darkBlue" : "!text-gray-dark"
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
                    <img src={ArrowRightIcon} alt="Arrow Right Icon" />
                  </button>
                </Tabs.Panel>

                <Tabs.Panel value="tags" className="mt-[12px]">
                  <MultiSelect
                    className="md:w-1/2 w-full"
                    placeholder="Select one or Multiple Tags"
                    data={["#tag1", "#tag2", "#tag3", "#tag4"]}
                    clearable
                    searchable
                    nothingFoundMessage="Nothing found..."
                    hidePickedOptions
                  />
                </Tabs.Panel>
              </Tabs>
              <TextEditor ref={quillRef} />
              <div className="flex items-center gap-[16px]">
                <CustomButton
                  label="Send Email"
                  varient="filled"
                  className="w-fit"
                  onClick={handleSubmitEmail}
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
                    <img src={ArrowRightIcon} alt="Arrow Right Icon" />
                  </button>
                </Tabs.Panel>

                <Tabs.Panel value="tags" className="mt-[12px]">
                  <MultiSelect
                    className="md:w-1/2 w-full"
                    placeholder="Select one or Multiple Tags"
                    data={["#tag1", "#tag2", "#tag3", "#tag4"]}
                    clearable
                    searchable
                    nothingFoundMessage="Nothing found..."
                    hidePickedOptions
                  />
                </Tabs.Panel>
              </Tabs>
              <div className="w-full">
                <p className="text-[14px] mb-[8px]">Content</p>
                <div className="relative rounded-[12px] w-full h-[350px] !bg-[#F7F7F8] border border-[#D7D5DD] overflow-hidden">
                  <button
                    type="button"
                    className="bg-white p-[8px] text-darkBlue text-[14px] font-medium shadow-sm w-full text-start"
                    onClick={() => {
                      setSmsContent(`${videoToBeShared.videoLink}`);
                    }}
                  >
                    Paste Video Link
                  </button>
                  <textarea
                    placeholder="SMS Content"
                    value={smsContent}
                    onChange={(e) => setSmsContent(e.target.value)}
                    className="!bg-transparent h-full w-full text-[14px] outline-none p-[8px]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-[16px]">
                <CustomButton
                  label="Send SMS"
                  varient="filled"
                  className="w-fit"
                  onClick={handleSubmitSMS}
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
                    value={`<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe 
      src="https://www.loom.com/embed/6a7bcbcd29264a68bcee20242ce7a1f7?sid=c906d7a2-87c5-40b8-8ac3-8c6fd5bac5a9" 
      frameborder="0" 
      webkitallowfullscreen 
      mozallowfullscreen 
      allowfullscreen 
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
    </iframe>
  </div>`}
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
                  <p className="px-[16px] py-[24px] w-[80%]">{`<div style="position: relative; padding-bottom: 56.25%; height: 0;">
    <iframe 
      src="https://www.loom.com/embed/6a7bcbcd29264a68bcee20242ce7a1f7?sid=c906d7a2-87c5-40b8-8ac3-8c6fd5bac5a9" 
      frameborder="0" 
      webkitallowfullscreen 
      mozallowfullscreen 
      allowfullscreen 
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
    </iframe>
  </div>`}</p>
                </div>
              </div>
              <CopyButton value={videoToBeShared.videoLink}>
                {({ copied, copy }) => (
                  <ActionIcon onClick={copy} className="!w-fit !bg-transparent">
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

  const [selectAllValue, setSelectAllValue] = useState(false);

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
      setSelectAllValue(
        updatedSelectedContacts.length === filteredContacts.length
      );
    } else {
      setSelectedContacts([
        ...selectedContacts,
        {
          ...contactDetails,
          isChecked: true,
        },
      ]);
      setSelectAllValue(
        [...selectedContacts, contactDetails].length === filteredContacts.length
      );
    }
  };

  const handleSelectAll = (isChecked) => {
    setSelectAllValue(isChecked);
    if (isChecked) {
      // Select all contacts
      const updatedSelectedContacts = filteredContacts.map((contact) => ({
        ...contact,
        isChecked: true,
      }));
      setSelectedContacts(updatedSelectedContacts);
    } else {
      // Deselect all contacts
      setSelectedContacts([]);
    }
  };

  const handleSaveSelectedContacts = () => {
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
                <Table.Th>Contact ID</Table.Th>
                <Table.Th>Contact Name</Table.Th>
                <Table.Th>Date Added</Table.Th>
                <Table.Th>
                  <Checkbox
                    value={selectAllValue}
                    onChange={(event) => handleSelectAll(event.target.checked)}
                    labelPosition="left"
                    label={
                      <p className="text-[14px] font-bold">
                        Action{" "}
                        <span className="!font-normal">
                          {selectAllValue ? "(Deselect All)" : "(Select All)"}
                        </span>
                      </p>
                    }
                  />
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredContacts?.map((contact) => {
                const date = new Date(contact.dateAdded);

                // Format the date as MM/DD/YYYY
                const formattedDate = `${String(date.getMonth() + 1).padStart(
                  2,
                  "0"
                )}/${String(date.getDate()).padStart(
                  2,
                  "0"
                )}/${date.getFullYear()}`;

                const isChecked =
                  selectAllValue ||
                  selectedContacts?.some(
                    (selectedContact) =>
                      selectedContact?.id === contact?.id &&
                      selectedContact?.isChecked
                  );

                return (
                  <Table.Tr key={contact.id}>
                    <Table.Td>{contact.id}</Table.Td>
                    <Table.Td className="capitalize">
                      {contact?.firstNameLowerCase +
                        " " +
                        contact?.lastNameLowerCase}
                    </Table.Td>
                    <Table.Td>{formattedDate}</Table.Td>
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
        <div className="bg-white p-[12px_24px] flex flex-col">
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
            className="p-[10px_16px] bg-primary text-white rounded-[8px] text-[14px] font-medium w-[125px]"
            type="button"
            onClick={handleSaveSelectedContacts}
          >
            Save
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

  const [selectAllValue, setSelectAllValue] = useState(false);

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
      selectedSMSContacts(updatedSelectedContacts);
      setSelectAllValue(
        updatedSelectedContacts.length === filteredContacts.length
      );
    } else {
      selectedSMSContacts([
        ...selectedSMSContacts,
        {
          ...contactDetails,
          isChecked: true,
        },
      ]);
      setSelectAllValue(
        [...selectedSMSContacts, contactDetails].length ===
          filteredContacts.length
      );
    }
  };

  const handleSelectAll = (isChecked) => {
    setSelectAllValue(isChecked);
    if (isChecked) {
      // Select all contacts
      const updatedSelectedContacts = filteredContacts.map((contact) => ({
        ...contact,
        isChecked: true,
      }));
      selectedSMSContacts(updatedSelectedContacts);
    } else {
      // Deselect all contacts
      selectedSMSContacts([]);
    }
  };

  const handleSaveSelectedContacts = () => {
    console.log("Selected Contacts: ", selectedSMSContacts);
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
                <Table.Th>Contact ID</Table.Th>
                <Table.Th>Contact Name</Table.Th>
                <Table.Th>Date Added</Table.Th>
                <Table.Th>
                  <Checkbox
                    value={selectAllValue}
                    onChange={(event) => handleSelectAll(event.target.checked)}
                    labelPosition="left"
                    label={
                      <p className="text-[14px] font-bold">
                        Action{" "}
                        <span className="!font-normal">
                          {selectAllValue ? "(Deselect All)" : "(Select All)"}
                        </span>
                      </p>
                    }
                  />
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredContacts?.map((contact) => {
                const date = new Date(contact.dateAdded);

                // Format the date as MM/DD/YYYY
                const formattedDate = `${String(date.getMonth() + 1).padStart(
                  2,
                  "0"
                )}/${String(date.getDate()).padStart(
                  2,
                  "0"
                )}/${date.getFullYear()}`;

                const isChecked =
                  selectAllValue ||
                  selectedSMSContacts?.some(
                    (selectedContact) =>
                      selectedContact?.id === contact?.id &&
                      selectedContact?.isChecked
                  );

                return (
                  <Table.Tr key={contact.id}>
                    <Table.Td>{contact.id}</Table.Td>
                    <Table.Td className="capitalize">
                      {contact?.firstNameLowerCase +
                        " " +
                        contact?.lastNameLowerCase}
                    </Table.Td>
                    <Table.Td>{formattedDate}</Table.Td>
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
        <div className="bg-white p-[12px_24px] flex flex-col">
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
            className="p-[10px_16px] bg-primary text-white rounded-[8px] text-[14px] font-medium w-[125px]"
            type="button"
            onClick={handleSaveSelectedContacts}
          >
            Save
          </button>
        </div>
      </div>
    </ModalRoot>
  );
};
