import { createTheme, MantineProvider } from "@mantine/core";
import ReactDOM from "react-dom/client";
import "./index.css";

// Importing the router
import { router } from "./Router.jsx";
import { RouterProvider } from "react-router-dom";

// Mantine Dev Styles
import "@mantine/core/styles.css";
import {
  ContactsSelectionModalEmail,
  DeleteVideoConfirmationModal,
  EditVideoModal,
  ShareVideoModal,
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
    <ContactsSelectionModalEmail />
    {/* Modals */}
    <LoadingBackdrop />
    <RouterProvider router={router} />
  </MantineProvider>
);
