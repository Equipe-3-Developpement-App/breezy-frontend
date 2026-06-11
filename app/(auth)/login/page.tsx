import React from "react";
import { Wind } from "lucide-react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { LoginForm } from "@/components/forms/LoginForm"; // Importing our brand new secure form component

export default function LoginPage() {
  return (
    <PhoneFrame bgWhite={true}>
      
      {/* --- VISUAL INTERFACE HEADER --- */}
      <header className="flex flex-col items-start gap-6 w-full mb-[100px]">
        <div className="flex items-center gap-[15px] w-full">
          <div className="w-[34px] h-[34px] text-[#2A6FDB]">
             <Wind size={34} strokeWidth={2.5} />
          </div>
          <h1 className="text-[28px] font-extrabold text-[#16212E] tracking-[-0.9px] leading-[34px]">
            Breezy
          </h1>
        </div>

        <h2 className="text-[25px] font-extrabold text-[#16212E] tracking-[-0.5px] leading-[30px]">
          Se connecter
        </h2>
      </header>

      {/* --- SECURE CLIENT CONTAINER RENDERING --- */}
      <LoginForm />

    </PhoneFrame>
  );
}