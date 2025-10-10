import { createBrowserRouter, RouterProvider } from "react-router-dom";
import InterviewRoom from "./pages/InterviewRoom.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Layout from "./Layout.jsx";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [{ path: "/", element: <LandingPage /> }],
  },
  { path: "/interview", element: <InterviewRoom /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
