import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDecryptedUserData } from "./api/auth";
import { useGlobalModals } from "./store/globalModals";
import {
  ContactsSelectionModalEmail,
  ContactsSelectionModalSMS,
} from "./components/ui/GlobalModals";
import { useUserStore } from "./store/userStore";
import { useLoadingBackdrop } from "./store/loadingBackdrop";
import { getAllVideos } from "./api/libraryAPIs";
import { getHistoryOfMessages } from "./api/commsAPIs";
import { toast } from "react-toastify";

function App() {
  const isSMSContactsSelectionModalOpen = useGlobalModals(
    (state) => state.isSMSContactsSelectionModalOpen
  );

  const isContactsSelectionModalOpen = useGlobalModals(
    (state) => state.isContactsSelectionModalOpen
  );

  const [error, setError] = useState(false);

  const setVideosData = useUserStore((state) => state.setVideosData);
  const setHistoryData = useUserStore((state) => state.setHistoryData);
  const setLoading = useLoadingBackdrop((state) => state.setLoading);

  // Function to Fetch all the Data
  const fetchData = async (accessToken) => {
    try {
      // Fetch all data in parallel
      const [videosResponse, historyResponse] = await Promise.all([
        getAllVideos(accessToken),
        getHistoryOfMessages(accessToken),
      ]);

      // Check responses and set state only after all are resolved
      if (videosResponse.success && historyResponse.success) {
        // Update states
        setVideosData(videosResponse.data.videos);
        setHistoryData(historyResponse.data.histories);
      } else {
        if (!videosResponse.success) {
          toast.error(videosResponse.error || "Error Fetching Videos", {
            position: "bottom-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        if (!historyResponse.success) {
          toast.error(historyResponse.error || "Error Fetching History", {
            position: "bottom-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      toast.error("Error Fetching Data", {
        position: "bottom-right",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  useEffect(() => {
    const postKeyToAPIAndCheckUserId = async () => {
      setLoading(true);

      const key = await new Promise((resolve) => {
        window.parent.postMessage({ message: "REQUEST_USER_DATA" }, "*");
        window.addEventListener("message", ({ data }) => {
          if (data.message === "REQUEST_USER_DATA_RESPONSE") {
            resolve(data.payload);
          } else {
            resolve(null);
            setLoading(false);
          }
        });
      });

      // Send Data to the Backend API to Decrypt the code
      const response = await getDecryptedUserData({ tokenKey: key });

      if (!response.success || response.data.accessToken === undefined) {
        setError(true);
        return setLoading(false);
      }

      // Fetch all the Data
      await fetchData(response.data.accessToken);

      // Save the accountId and userLocationId in the Local Storage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("userLocationId", response.data.user.userLocationId);

      setLoading(false);
    };

    postKeyToAPIAndCheckUserId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setError, setLoading, error]);

  return (
    <main className="App overflow-x-hidden md:p-[32px] p-[20px]">
      {isContactsSelectionModalOpen && <ContactsSelectionModalEmail />}
      {isSMSContactsSelectionModalOpen && <ContactsSelectionModalSMS />}
      <Outlet />
    </main>
  );
}

export default App;
