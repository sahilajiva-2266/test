import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../Helpers/Context/UserContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" replace />;

  // if route restricted to certain roles
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role?.toLowerCase())
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
