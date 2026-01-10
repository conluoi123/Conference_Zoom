import { AuthService } from "@/services/authApi";
import { useEffect, useState, type JSX } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const [target, setTarget] = useState<string | null>(null);
  const [flag, setFlag] = useState<boolean>(false);
  useEffect(() => {
    const check = async () => {
      setFlag(await AuthService.checkRefreshToken());
      setTarget(flag ? "/home" : "/login");
      console.log(target);
      if (target === "/login") {
        console.log(1);
        return <Navigate to="/login" />;
      }
      console.log(flag);
    };
    check();
  }, [target, flag]);

  return children;
}
