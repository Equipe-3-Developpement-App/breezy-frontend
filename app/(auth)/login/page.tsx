import React from "react";
import { Wind } from "lucide-react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <PhoneFrame bgWhite={true}>
      
      <header className="flex flex-col items-start gap-6 w-full mb-[100px]">
        <div className="flex items-baseline mb-2">
          <div className="flex items-baseline text-[#16212E]">
            <span className="font-extrabold text-[34px] tracking-tight leading-none">Breez</span>
            <img 
              src="/breezy-icon.png" 
              alt="y" 
              className="w-auto h-[36px] object-contain -ml-[1px] translate-y-[3px]" 
            />
          </div>
        </div>

        <h2 className="text-[25px] font-extrabold text-[#16212E] tracking-[-0.5px] leading-[30px]">
          Se connecter
        </h2>
      </header>

      <LoginForm />

    </PhoneFrame>
  );
}