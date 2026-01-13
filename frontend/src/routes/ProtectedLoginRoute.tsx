import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedLoginRouteProps {
  children: JSX.Element;
  flag: boolean;
}
export default function ProtectedLoginRoute({
  children,
  flag,
}: ProtectedLoginRouteProps) {
  
  if (flag === true) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
