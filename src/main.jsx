import { createTheme, MantineProvider } from "@mantine/core";
import ReactDOM from "react-dom/client";
import "./index.css";

// Importing the router
import { router } from "./Router.jsx";
import { RouterProvider } from "react-router-dom";

// Mantine Dev Styles
import "@mantine/core/styles.css";
import { DeleteVideoConfirmationModal } from "./components/ui/GlobalModals.jsx";

const theme = createTheme({
  cursorType: "pointer",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <MantineProvider theme={theme}>
    <DeleteVideoConfirmationModal />
    <RouterProvider router={router} />
  </MantineProvider>
);
