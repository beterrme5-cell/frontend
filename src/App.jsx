import { Outlet } from "react-router-dom";
import { useEffect } from "react";

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

      console.log(key);
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
