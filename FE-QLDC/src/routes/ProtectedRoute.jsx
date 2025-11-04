"use client";

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const isLeader = user.role === "TO_TRUONG";
    const normalized = isLeader ? "leader" : "citizen";
    if (normalized !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};
