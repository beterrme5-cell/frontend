import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Dashboard from "./pages/dashboard/Dashboard";

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
        path: "test",
        element: <div>Test</div>,
      },
    ],
  },
]);
