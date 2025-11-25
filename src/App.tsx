import { useState } from "react";
import { LoginPage } from "./components/LoginPage.tsx";
import { OTPPage } from "./components/OTPPage.tsx";
import { HomePage } from "./components/Home.tsx";
//type Page = "otp" | "register"| "home";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"login" | "otp" | "home">("login");
  const [email, setEmail] = useState("");
  return (
    <div 
      className="content-stretch flex items-center justify-center relative w-full h-screen overflow-hidden bg-white" 
      style={{ 
        backgroundImage: "linear-gradient(150.291deg, rgb(21, 93, 252) 0%, rgb(20, 71, 230) 50%, rgb(110, 17, 176) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" 
      }}
    >
      {currentPage === "login" ? (
        <LoginPage  
        onSwitchToOTP={(enteredEmail) => { 
          setEmail(enteredEmail); 
          setCurrentPage("otp"); 
        }}
        email= {email} 
        />
      ) : currentPage === "otp" ? (
        <OTPPage 
          email={email} 
          onBack={() => {setCurrentPage("login")}} 
          onSwitchHome={() => {setCurrentPage("home")}} 
        />
      ) : (
        <HomePage   userEmail={email} />
      )}
    </div>
  );
}
