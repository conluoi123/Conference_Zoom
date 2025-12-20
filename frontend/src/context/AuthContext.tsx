import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const email = localStorage.getItem('email');
        const displayName = localStorage.getItem('displayName');
        const peerId = localStorage.getItem('peerId');

        if (token && email && displayName && peerId) {
          setUser({
            id: peerId,
            email,
            displayName,
          });
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('email', userData.email);
    localStorage.setItem('displayName', userData.displayName);
    localStorage.setItem('peerId', userData.id);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('email');
    localStorage.removeItem('displayName');
    localStorage.removeItem('peerId');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...userData };
    if (userData.email) localStorage.setItem('email', userData.email);
    if (userData.displayName) localStorage.setItem('displayName', userData.displayName);
    setUser(updatedUser);
  };

  const refreshUser = () => {
    const user = localStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user));
    }
  }
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}