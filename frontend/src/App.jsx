import { createBrowserRouter, RouterProvider } from "react-router-dom";
import InterviewRoom from "./pages/InterviewRoom.jsx";
import LandingPage from "./pages/LandingPage.jsx";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/interview", element: <InterviewRoom /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
