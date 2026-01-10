import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { setAccessToken, getAccessToken } from "@/services/service";
import { setLogoutHandler } from "@/services/service";
import api from "@/services/service";
interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => void;
  isLogout: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogout, setIsLogout] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        await refreshUser();
      } catch (err) {
        console.log("User not authenticated");
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);
  useEffect(() => {
    setLogoutHandler(() => {
      logout();
    });
  }, []);
  const login = (userData: User, token: string) => {
    setIsLogout(false);
    setUser(userData);
    setAccessToken(token);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Xoa cookie khong thanh cong", error);
    } finally {
      setUser(null);
      setIsLoading(false);
      setIsLogout(true);
      navigate("/login");
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      console.log("refresh user success");
      const { userId, email, displayName, avatar } = res.data.data;
      const token = getAccessToken();

      if (!token) throw new Error("No access token");

      setUser({
        id: userId,
        email,
        displayName,
        avatar,
      });
    } catch (err) {
      console.log("refresh user failed");
      throw err;
    } 
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
    isLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
