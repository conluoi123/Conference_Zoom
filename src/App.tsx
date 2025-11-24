import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage.tsx";

type Page = "login" | "register";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");

  return (
    <div 
      className="content-stretch flex items-center justify-center relative w-full h-screen overflow-hidden bg-white" 
      style={{ 
        backgroundImage: "linear-gradient(150.291deg, rgb(21, 93, 252) 0%, rgb(20, 71, 230) 50%, rgb(110, 17, 176) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" 
      }}
    >
      {currentPage === "login" ? (
        <LoginPage onSwitchToRegister={() => setCurrentPage("register")} />
      ) : (
        <RegisterPage onSwitchToLogin={() => setCurrentPage("login")} />
      )}
    </div>
  );
}
