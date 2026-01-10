import {
  BrowserRouter as Router,
} from "react-router-dom";
import AppRoutes from "./routes/Route.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { Toaster } from "sonner";
import { SocketListener } from "./context/SocketContext.tsx";
export default function App() {
  
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <SocketListener />
          <Toaster position="bottom-right" richColors closeButton />
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
