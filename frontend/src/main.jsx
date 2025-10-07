import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Test from "./components/test.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import InterviewRoom from "./pages/InterviewRoom.jsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/interview", element: <InterviewRoom /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
