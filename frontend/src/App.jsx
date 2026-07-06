
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import HRPayroll from "./pages/HRPayroll";
import Finance from "./pages/Finance";
import SupplyChain from "./pages/InventoryLive";
import Procurement from "./pages/Procurement";
import Analytics from "./pages/AnalyticsLive";
import AIForecasting from "./pages/AIForecasting";
import AICopilot from "./pages/AICopilot";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { ROLES } from "./utils/permissions";

function App() {
  const { user, loading } = useAuth()
  const token = localStorage.getItem("token")
  const isAuthenticated = Boolean(user && token)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base text-white">
        Loading authentication...
      </div>
    )
  }

  return (
      <Routes>

        {/* Public Routes */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
        />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
        />

        {/* Common Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* HR Dashboard */}
        <Route
          path="/hr-payroll"
          element={
            <RoleRoute
              allowedRoles={[
                ROLES.HR_MANAGER,
                ROLES.OWNER,
              ]}
            >
              <HRPayroll />
            </RoleRoute>
          }
        />

        {/* Finance Dashboard */}
        <Route
          path="/finance"
          element={
            <RoleRoute
              allowedRoles={[
                ROLES.FINANCE_MANAGER,
                ROLES.OWNER,
              ]}
            >
              <Finance />
            </RoleRoute>
          }
        />

        {/* Supply Chain / Project */}
        <Route
          path="/supply-chain"
          element={
            <RoleRoute
              allowedRoles={[
                ROLES.PROJECT_MANAGER,
                ROLES.OWNER,
              ]}
            >
              <SupplyChain />
            </RoleRoute>
          }
        />

        <Route
          path="/procurement"
          element={
            <RoleRoute
              allowedRoles={[
                ROLES.PROJECT_MANAGER,
                ROLES.OWNER,
              ]}
            >
              <Procurement />
            </RoleRoute>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <RoleRoute
              allowedRoles={[
                ROLES.OWNER,
              ]}
            >
              <Analytics />
            </RoleRoute>
          }
        />

        {/* AI Forecasting */}
        <Route
          path="/ai-forecasting"
          element={
            <RoleRoute
              allowedRoles={[
                ROLES.OWNER,
              ]}
            >
              <AIForecasting />
            </RoleRoute>
          }
        />

        <Route
          path="/ai-copilot"
          element={
            <RoleRoute
              allowedRoles={[
                ROLES.OWNER,
                ROLES.HR_MANAGER,
                ROLES.FINANCE_MANAGER,
                ROLES.PROJECT_MANAGER,
              ]}
            >
              <AICopilot />
            </RoleRoute>
          }
        />

        <Route
          path="/owner"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/hr"
          element={<Navigate to="/hr-payroll" replace />}
        />

        <Route
          path="/projects"
          element={<Navigate to="/supply-chain" replace />}
        />

        <Route
          path="/employee"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
        />

      </Routes>
    
  );
}

export default App;
