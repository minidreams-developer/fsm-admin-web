import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

export const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};
