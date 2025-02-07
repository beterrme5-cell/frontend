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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoadingBackdrop from "./components/ui/LoadingBackdrop.jsx";

// Create a client
const queryClient = new QueryClient();

const theme = createTheme({
  cursorType: "pointer",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <MantineProvider theme={theme}>
    {/* LOADING BACKDROP */}
    <LoadingBackdrop />
    {/* REACT TOASTIFY - CONTAINER */}
    <ToastContainer />
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </MantineProvider>
);
