import { Navigate } from "react-router-dom";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
  isAuth,
}: {
  children: JSX.Element;
  isAuth: boolean;
}) {
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  } 
  return children;
}
