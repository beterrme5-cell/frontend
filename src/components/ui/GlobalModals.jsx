import { Modal, TextInput } from "@mantine/core";
import { useGlobalModals } from "../../store/globalModals";
import { LoadingOverlay } from "@mantine/core";
import closeIcon from "../../assets/icons/cancel-icon.svg";
import { useForm } from "@mantine/form";
import CustomVideoInput from "./CustomVideoInput";
import CustomButton from "./CustomButton";
import { useEffect, useRef } from "react";

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
          <TextInput
            label="Video Description"
            placeholder="Enter Video Description"
            {...form.getInputProps("videoDescription")}
            id="videoDescription"
            className="w-[350px]"
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

  // Modal Form
  const form = useForm({
    initialValues: {
      videoName: videoToBeEdited?.title,
      videoDescription: videoToBeEdited?.description,
    },

    validate: {
      videoName: (value) => {
        if (value.length < 3) {
          return "Video Name must be at least 3 characters long";
        }
      },
    },
  });

  // Function to handle the update of the video
  const handleUpdateVideo = (values) => {
    console.log(values);
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
      }}
    >
      <div className="flex flex-col gap-[24px] w-[534px]">
        <h3 className="text-[24px] font-medium">Make Changes in Video</h3>
        <form
          onSubmit={() => {
            form.onSubmit(handleUpdateVideo);
          }}
          className="flex flex-col gap-[16px]"
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
        </form>
        <div className="flex items-center gap-[16px]">
          <CustomButton
            label="Save Changes"
            varient="filled"
            className="w-fit"
            onClick={() => {}}
          />
          <CustomButton
            label="Cancel"
            varient="outlined"
            className="w-fit"
            onClick={() => {
              setIsEditVideoModalOpen(false);
            }}
          />
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
  const isDeleteVideoModalOpen = useGlobalModals(
    (state) => state.isDeleteVideoModalOpen
  );
  const setIsDeleteVideoModalOpen = useGlobalModals(
    (state) => state.setIsDeleteVideoModalOpen
  );
  const videoToBeDeleted = useGlobalModals((state) => state.videoToBeDeleted);

  return (
    <ModalRoot
      loadingOverlay={modalLoadingOverlay}
      showModal={isDeleteVideoModalOpen}
      onClose={() => {
        setIsDeleteVideoModalOpen(false);
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
            onClick={() => {}}
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
