import { createBrowserRouter, RouterProvider } from "react-router-dom";
import InterviewRoom from "./pages/InterviewRoom.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Layout from "./Layout.jsx";
import Jobs from "./pages/Jobs.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/job", element: <Jobs /> },
    ],
  },
  { path: "/interview", element: <InterviewRoom /> },
]);

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
