import { create } from "zustand";

export const useUserStore = create((set) => ({
  // State to fetch the videos data when the access token is available
  fetchVideosData: false,
  setFetchVideosData: (fetchVideosData) => set({ fetchVideosData }),

  // --------------------------------------------------
  // User State
  // --------------------------------------------------
  user: {
    name: "Babar",
    email: "babaratwork786@gmail.com",
  }, // Initialize the user as null or an empty object
  setUser: (user) => set({ user }), // Function to set the user object
  clearUser: () => set({ user: null }),

  // --------------------------------------------------
  videosData: [],
  setVideosData: (videosData) => set({ videosData }),

  // --------------------------------------------------
  // User Contacts
  // --------------------------------------------------
  userContactsData: {},
  setUserContactsData: (contacts) => set({ userContactsData: contacts }),

  // --------------------------------------------------
  // Sharing History
  // --------------------------------------------------
  historyData: [],
  setHistoryData: (historyData) => set({ historyData }),

  // --------------------------------------------------
  // Video's Data for VideoDetail Page
  // --------------------------------------------------

  videoDetail: {},
  setVideoDetail: (videoDetail) => set({ videoDetail }),

  userDomain: "",
  setUserDomain: (userDomain) => set({ userDomain }),

  // --------------------------------------------------
  // Video View Mode (grid/list)
  // --------------------------------------------------
  videoViewMode: localStorage.getItem('videoViewMode') || 'grid',
  setVideoViewMode: (mode) => {
    localStorage.setItem('videoViewMode', mode);
    set({ videoViewMode: mode });
  },
}));
