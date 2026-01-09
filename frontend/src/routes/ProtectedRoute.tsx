// import auth context
import { useAuth } from "@/context/AuthContext";
import type { JSX } from "react";
import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }   
    return children;
}

