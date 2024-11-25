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
}));
