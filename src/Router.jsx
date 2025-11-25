import { createBrowserRouter, Link } from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./pages/dashboard/Dashboard";
import VideoDetail from "./pages/videoDetail/VideoDetail.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RecordVideo from "./pages/recordVideo/RecordVideo";
import UploadedVideoDetail from "./pages/uploadedVideoDetail/UploadedVideoDetail.jsx";
import VideoViewer from "./components/ui/VideoViewer.jsx";
import Test from "./components/ui/Test.jsx";

import D from "./components/ui/D.jsx";
import PublicVideoView from "./pages/publicvideoview/PublicVideoView.jsx";

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
        path: "uploaded-video-detail",
        element: <UploadedVideoDetail />,
      },
      {
        path: "recordings/:accessToken/:userLocationId",
        element: <RecordVideo />,
      },
      {
        path: "video-detail/:videoId",
        element: <VideoDetail />,
      },
      //new route for page video viewer
      {
        path: "videoviewer/:id",
        element: <VideoViewer />,
      },
      {
        path: "recordings/:accessToken/:userLocationId/video-detail/:videoId",
        element: <VideoDetail />,
      },
      {
        path: "recordings/:accessToken/:userLocationId/uploaded-video-detail",
        element: <UploadedVideoDetail />,
      },
      //temp routes
      {
        path: "test",
        element: <Test />,
      },
      {
        path: "/d",
        element: <D />,
      },
      {
        path: "/v/:id",
        element: <PublicVideoView />,
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
