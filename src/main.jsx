import { createTheme, MantineProvider } from "@mantine/core";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Mantine Dev Styles
import "@mantine/core/styles.css";

const theme = createTheme({
  cursorType: "pointer",
});

createRoot(document.getElementById("root")).render(
  <MantineProvider theme={theme}>
    <App />
  </MantineProvider>
);
