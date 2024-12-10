import { create } from "zustand";

export const useGlobalModals = create((set) => ({
  // Modal Loading Overlay
  modalLoadingOverlay: false,
  setModalLoadingOverlay: (isLoading) =>
    set({ modalLoadingOverlay: isLoading }),

  // New Recording Modal States
  isNewRecordingModalOpen: false,
  setIsNewRecordingModalOpen: (isOpen) =>
    set({ isNewRecordingModalOpen: isOpen }),
  newRecordingVideoData: {
    recordingName: "",
    recordingDescription: "",
  },
  setNewRecordingVideoData: (videoData) =>
    set({ newRecordingVideoData: videoData }),
  isWarningModalOpen: false,
  setIsWarningModalOpen: (isOpen) => set({ isWarningModalOpen: isOpen }),

  // --------------------------------------------------
  // Delete Video Confirmation Modal
  // --------------------------------------------------
  videoToBeDeleted: {},
  setVideoToBeDeleted: (video) => set({ videoToBeDeleted: video }),

  isDeleteVideoModalOpen: false,
  setIsDeleteVideoModalOpen: (isOpen) =>
    set({ isDeleteVideoModalOpen: isOpen }),

  // --------------------------------------------------
  // Upload Video Modal
  // --------------------------------------------------
  isUploadVideoModalOpen: false,
  setIsUploadVideoModalOpen: (isOpen) =>
    set({ isUploadVideoModalOpen: isOpen }),

  // --------------------------------------------------
  // Edit Video Modal
  // --------------------------------------------------
  videoToBeEdited: {},
  setVideoToBeEdited: (video) => set({ videoToBeEdited: video }),
  isEditVideoModalOpen: false,
  setIsEditVideoModalOpen: (isOpen) => set({ isEditVideoModalOpen: isOpen }),

  // --------------------------------------------------
  // Share Video Modal
  // --------------------------------------------------
  videoToBeShared: {},
  setVideoToBeShared: (video) => set({ videoToBeShared: video }),
  isShareVideoModalOpen: false,
  setIsShareVideoModalOpen: (isOpen) => set({ isShareVideoModalOpen: isOpen }),
  isContactsSelectionModalOpen: false,
  setIsContactsSelectionModalOpen: (isOpen) =>
    set({ isContactsSelectionModalOpen: isOpen }),
  selectedContacts: [],
  setSelectedContacts: (contacts) => set({ selectedContacts: contacts }),
  // send to all the contacts in contact list
  sendToAllContacts: false,
  setSendToAllContacts: (sendToAll) => set({ sendToAllContacts: sendToAll }),
  contactTagsData: [],
  setContactTagsData: (data) => set({ contactTagsData: data }),

  // --------------------------------------------------
  // Contacts Selection Modal - SMS
  // --------------------------------------------------
  isSMSContactsSelectionModalOpen: false,
  setIsSMSContactsSelectionModalOpen: (isOpen) =>
    set({ isSMSContactsSelectionModalOpen: isOpen }),
  selectedSMSContacts: [],
  setSelectedSMSContacts: (contacts) => set({ selectedSMSContacts: contacts }),

  // --------------------------------------------------
  // Video Link Not Attched - Warning Modal
  // --------------------------------------------------
  isVideoLinkNotAttachedModalOpen: false,
  setIsVideoLinkNotAttachedModalOpen: (isOpen) =>
    set({ isVideoLinkNotAttachedModalOpen: isOpen }),
}));
