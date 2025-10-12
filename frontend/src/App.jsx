import { createBrowserRouter, RouterProvider } from "react-router-dom";
import InterviewRoom from "./pages/InterviewRoom.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Layout from "./Layout.jsx";
import Jobs from "./pages/Jobs.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import Register from "./pages/Register.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/register", element: <Register /> },
      { path: "/job", element: <Jobs /> },
    ],
  },
  { path: "/interview", element: <InterviewRoom /> },
]);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
