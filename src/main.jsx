import { createTheme, MantineProvider } from "@mantine/core";
import ReactDOM from "react-dom/client";
import "./index.css";

// Importing the router
import { router } from "./Router.jsx";
import { RouterProvider } from "react-router-dom";

// Mantine Dev Styles
import "@mantine/core/styles.css";
import {
  DeleteVideoConfirmationModal,
  EditVideoModal,
  ShareVideoModal,
  UploadVideoModal,
} from "./components/ui/GlobalModals.jsx";

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
    {/* Modals */}
    <RouterProvider router={router} />
  </MantineProvider>
);
