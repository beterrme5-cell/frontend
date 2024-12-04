import { createBrowserRouter, Link } from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./pages/dashboard/Dashboard";
import VideoDetail from "./pages/videoDetail/VideoDetail.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RecordVideo from "./pages/recordVideo/RecordVideo";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "recordings/:accessToken",
        element: <RecordVideo />,
      },
      {
        path: "video-detail/:videoId",
        element: <VideoDetail />,
      },
      {
        path: "recordings/:accessToken/video-detail/:videoId",
        element: <VideoDetail />,
      },
      {
        path: "*",
        element: (
          <div className="flex justify-center items-center h-screen w-screen bg-slate-100">
            <div className="flex flex-col justify-center gap-5 items-center">
              <h1 className="text-5xl font-black text-darkBlue">
                404 Not Found
              </h1>
              <p className="text-2xl text-gray-dark">
                The page you are looking for does not exist.
              </p>
              <Link
                href="/"
                className="text-xl text-white bg-black px-4 py-2 rounded-[8px]"
              >
                Go back to home
              </Link>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);
