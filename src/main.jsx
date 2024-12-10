import { createTheme, MantineProvider } from "@mantine/core";
import ReactDOM from "react-dom/client";
import "./index.css";

// Importing the router
import { router } from "./Router.jsx";
import { RouterProvider } from "react-router-dom";

//react toastify
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

// Mantine Dev Styles
import "@mantine/core/styles.css";
import {
  DeleteVideoConfirmationModal,
  EditVideoModal,
  PreRecordingDataInputModal,
  ShareVideoModal,
  StartRecordingWarningModal,
  UploadVideoModal,
} from "./components/ui/GlobalModals.jsx";
import LoadingBackdrop from "./components/ui/LoadingBackdrop.jsx";

const theme = createTheme({
  cursorType: "pointer",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <MantineProvider theme={theme}>
    {/* Modals */}
    <DeleteVideoConfirmationModal />
    <UploadVideoModal />
    <EditVideoModal />
    <ShareVideoModal />
    <PreRecordingDataInputModal />
    <StartRecordingWarningModal />
    {/* Modals */}
    <LoadingBackdrop />
    {/* REACT TOASTIFY - CONTAINER */}
    <ToastContainer />
    <RouterProvider router={router} />
  </MantineProvider>
);
