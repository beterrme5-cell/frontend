import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { getDecryptedUserData } from "./api/auth";

function App() {
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

      // Save the accountId and userLocationId in the Local Storage
      localStorage.setItem("accessToken", response?.data?.accessToken);
    };

    postKeyToAPIAndCheckUserId();
  }, []);

  return (
    <main className="App overflow-x-hidden md:p-[32px] p-[20px]">
      <Outlet />
    </main>
  );
}

export default App;
