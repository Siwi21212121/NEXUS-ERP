import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function RoleRoute({
  children,
  allowedRoles,
}) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const role = user?.role || localStorage.getItem("role")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base text-white">
        Loading authentication...
      </div>
    )
  }

  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!allowedRoles?.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
