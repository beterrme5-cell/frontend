import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { getDecryptedUserData } from "./api/auth";
import { useGlobalModals } from "./store/globalModals";
import {
  ContactsSelectionModalEmail,
  ContactsSelectionModalSMS,
} from "./components/ui/GlobalModals";
import { useUserStore } from "./store/userStore";

function App() {
  const isSMSContactsSelectionModalOpen = useGlobalModals(
    (state) => state.isSMSContactsSelectionModalOpen
  );

  const isContactsSelectionModalOpen = useGlobalModals(
    (state) => state.isContactsSelectionModalOpen
  );

  const setFetchVideosData = useUserStore((state) => state.setFetchVideosData);

  useEffect(() => {
    const postKeyToAPIAndCheckUserId = async () => {
      const key = await new Promise((resolve) => {
        window.parent.postMessage({ message: "REQUEST_USER_DATA" }, "*");
        window.addEventListener("message", ({ data }) => {
          if (data.message === "REQUEST_USER_DATA_RESPONSE") {
            resolve(data.payload);
          }
        });
      });

      // Send Data to the Backend API to Decrypt the code
      const response = await getDecryptedUserData({ tokenKey: key });

      console.log("Response: ", response);

      // Save the accountId and userLocationId in the Local Storage
      localStorage.setItem("accessToken", response?.data?.accessToken);

      // Set the fetchVideosData to true
      setFetchVideosData((prev) => !prev);
    };

    postKeyToAPIAndCheckUserId();
  }, [setFetchVideosData]);

  return (
    <main className="App overflow-x-hidden md:p-[32px] p-[20px]">
      {isContactsSelectionModalOpen && <ContactsSelectionModalEmail />}
      {isSMSContactsSelectionModalOpen && <ContactsSelectionModalSMS />}
      <Outlet />
    </main>
  );
}

export default App;
