import React from "react";
import Link from "next/link";
import { Wind } from "lucide-react";
import { PhoneFrame } from "@/components//layout/PhoneFrame";

export default function AuthPage() {
  return (
    /* Using bgWhite variant to fit the Figma gate page design rules */
    <PhoneFrame bgWhite={true}>

      {/* --- LOGO & SLOGAN VERTICAL BLOCK --- */}
      <div className="flex flex-col justify-center items-center flex-1 gap-[34px] w-full">

        {/* Centered Brand Header */}
        <div className="flex flex-col items-center gap-[5px]">
          <Wind size={70} className="text-[#2A6FDB]" strokeWidth={2.5} />
          <h1 className="text-[32px] font-extrabold text-[#16212E] tracking-tight text-center">
            Breezy
          </h1>
        </div>

        {/* Marketing Slogan Text Layout */}
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <p className="text-[20px] font-bold text-black leading-tight">
            Des idées légères,
          </p>
          <p className="text-[20px] font-normal text-[#5C708A] leading-tight">
            qui voyagent vite.
          </p>
        </div>

      </div>

      {/* --- ACTION CTA BUTTONS SECTION --- */}
      <div className="flex flex-col gap-3 w-full max-w-[451px]">
        <Link
          href="/register"
          className="w-full h-[48px] bg-[#2A6FDB] text-white font-bold text-[16px] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1e52a4] active:scale-98 transition-all select-none"
        >
          Créer un compte
        </Link>

        <Link
          href="/login"
          className="w-full h-[48px] border border-[#CDD9E6] text-[#16212E] font-bold text-[16px] rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 active:scale-98 transition-all select-none"
        >
          Se connecter
        </Link>
      </div>

    </PhoneFrame>
  );
}