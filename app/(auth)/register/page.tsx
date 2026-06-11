import React from "react";
import { Wind } from "lucide-react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { RegisterForm } from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <PhoneFrame bgWhite={true}>

      {/* --- SERVER CONTAINER CORE VIEW LAYER --- */}
      <div className="flex flex-col gap-[40px] w-full flex-1">

        {/* Structural Logo Identity Title */}
        <div className="flex flex-col gap-6 w-full text-left">
          <div className="flex items-center gap-[15px] text-[#16212E]">
            <Wind size={34} className="text-[#2A6FDB]" strokeWidth={2.5} />
            <span className="font-extrabold text-[28px] tracking-tight leading-[34px]">
              Breezy
            </span>
          </div>
          <h1 className="text-[25px] font-extrabold text-[#16212E] tracking-tight leading-[30px]">
            Créer un compte
          </h1>
        </div>

        {/* Interactive Secure Client Input Stack Component */}
        <RegisterForm />

      </div>

    </PhoneFrame>
  );
}