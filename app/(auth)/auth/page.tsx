import React from "react";
import Link from "next/link";
import { PhoneFrame } from "@/components/layout/PhoneFrame";

export default function AuthPage() {
  return (
    <PhoneFrame bgWhite={true}>
      <div className="flex flex-col justify-center items-center flex-1 gap-[34px] w-full">
        
        <div className="flex flex-col items-center gap-[5px]">
          <div className="flex items-baseline mb-[10px]">
            <h1 className="text-[42px] font-extrabold text-[#16212E] tracking-tight leading-none">Breez</h1>
            <img 
              src="/breezy-icon.png" 
              alt="y" 
              className="w-auto h-[44px] object-contain -ml-[2px] translate-y-[4px]" 
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center px-4">
          <p className="text-[20px] font-bold text-black leading-tight">Des idées légères,</p>
          <p className="text-[20px] font-normal text-[#5C708A] leading-tight">qui voyagent vite.</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 w-full max-w-[451px] mx-auto mb-10">
        <Link href="/register" className="w-full h-[48px] bg-[#2A6FDB] text-white font-bold text-[16px] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1e52a4] active:scale-98 transition-all select-none">
          Créer un compte
        </Link>
        <Link href="/login" className="w-full h-[48px] border border-[#CDD9E6] text-[#16212E] font-bold text-[16px] rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 active:scale-98 transition-all select-none">
          Se connecter
        </Link>
      </div>
    </PhoneFrame>
  );
}