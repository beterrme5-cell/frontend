import { createTheme, MantineProvider } from "@mantine/core";
import { createRoot } from "react-dom/client";
import "./index.css";

// Importing the router
import { router } from "./Router.jsx";
import { RouterProvider } from "react-router-dom";

// Mantine Dev Styles
import "@mantine/core/styles.css";

const theme = createTheme({
  cursorType: "pointer",
});

createRoot(document.getElementById("root")).render(
  <MantineProvider theme={theme}>
    <RouterProvider router={router} />
  </MantineProvider>
);
