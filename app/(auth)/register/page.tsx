import React from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <PhoneFrame bgWhite={true}>
      <div className="flex flex-col gap-[40px] w-full flex-1">
        <div className="flex flex-col gap-6 w-full text-left">
          {/* LOGO COMBINÉ AJUSTÉ */}
          <div className="flex items-baseline text-[#16212E]">
            <span className="font-extrabold text-[34px] tracking-tight leading-none">Breez</span>
            <img 
              src="/breezy-icon.png" 
              alt="y" 
              className="w-auto h-[36px] object-contain -ml-[1px] translate-y-[3px]" 
            />
          </div>
          <h1 className="text-[25px] font-extrabold text-[#16212E] tracking-tight leading-[30px]">
            Créer un compte
          </h1>
        </div>
        <RegisterForm />
      </div>
    </PhoneFrame>
  );
}