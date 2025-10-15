import { Navigate, replace } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading.....</p>;
  if (!user) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedRoute;
