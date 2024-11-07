import { create } from "zustand";

export const useGlobalModals = create((set) => ({
  // Modal Loading Overlay
  modalLoadingOverlay: false,
  setModalLoadingOverlay: (isLoading) =>
    set({ modalLoadingOverlay: isLoading }),

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
}));
