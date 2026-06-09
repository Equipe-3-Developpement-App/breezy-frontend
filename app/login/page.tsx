"use client";

import React from "react";
import Link from "next/link";
import { Wind } from "lucide-react";

export default function LoginPage() {
  return (
    // Centered container (dark gray background behind the phone)
    <div className="flex justify-center items-center bg-gray-900 min-h-screen w-full p-4">
      
      {/* Login page phone frame */}
      <main className="relative flex flex-col items-center w-full max-w-[499px] h-[900px] bg-white shadow-2xl rounded-3xl overflow-hidden px-[26px] pt-[30px] pb-[60px] font-sans">
        
        {/* Page header section -> 24px gap */}
        <header className="flex flex-col items-start gap-6 w-full mb-[100px]">
          
          {/* Top-left logo container -> 15px gap */}
          <div className="flex items-center gap-[15px] w-full">
            <div className="w-[34px] h-[34px] text-[#2A6FDB]">
               <Wind size={34} strokeWidth={2.5} />
            </div>
            <h1 className="text-[28px] font-extrabold text-[#16212E] tracking-[-0.9px] leading-[34px]">
              Breezy
            </h1>
          </div>

          {/* Page heading -> sign in */}
          <h2 className="text-[25px] font-extrabold text-[#16212E] tracking-[-0.5px] leading-[30px]">
            Se connecter
          </h2>
        </header>

        {/* Form fields container -> vertical spacing between fields */}
        <div className="flex flex-col items-start gap-[30px] w-full flex-1">
          
          {/* Email input field */}
          <div className="flex flex-col gap-[10px] w-full">
            <label htmlFor="email" className="text-[18px] font-bold text-[#16212E] leading-[22px]">
              Courriel
            </label>
            <div className="w-full h-[46px] border border-[#CDD9E6] rounded-[12px] px-[14px] flex items-center bg-white focus-within:border-[#2A6FDB] transition-colors">
              <input 
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full bg-transparent outline-none text-[15px] text-[#16212E] placeholder-[#9AABBF]"
              />
            </div>
          </div>

          {/* InputFieldPassword */}
          <div className="flex flex-col gap-[10px] w-full">
            <label htmlFor="password" className="text-[18px] font-bold text-[#16212E] leading-[22px]">
              Mot de passe
            </label>
            <div className="w-full h-[46px] border border-[#CDD9E6] rounded-[12px] px-[14px] flex items-center bg-white focus-within:border-[#2A6FDB] transition-colors">
              <input 
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-[15px] text-[#16212E] placeholder-[#9AABBF]"
              />
            </div>
          </div>

        </div>

        {/* Action buttons section -> spaced buttons */}
        <footer className="flex flex-col items-center gap-3 w-full">
          
          {/* Sign in button */}
          <Link 
            href="/" 
            className="flex justify-center items-center w-full h-[47.19px] bg-[#2A6FDB] hover:bg-[#1e52a4] text-white font-bold text-[16px] rounded-full tracking-[-0.16px] transition-all active:scale-[0.98]"
          >
            Se connecter
          </Link>

          {/* Alternate auth link section */}
          <div className="pt-[22px] flex flex-col items-center">
            <p className="text-[14px] text-[#5C708A] leading-[17px]">
              Pas de compte ?{" "}
              <Link href="/register" className="text-[#2A6FDB] font-bold hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>

        </footer>

      </main>

    </div>
  );
}