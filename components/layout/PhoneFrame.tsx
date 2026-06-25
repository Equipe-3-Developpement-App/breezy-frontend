"use client";

import React from "react";
import { RightSidebar } from "./RightSidebar";

interface PhoneFrameProps {
  children: React.ReactNode;
  bgWhite?: boolean;
}

export function PhoneFrame({ children, bgWhite = false }: PhoneFrameProps) {
  return (
    <div className={`flex justify-center min-h-[100dvh] w-full font-sans transition-colors ${
      bgWhite ? "bg-white" : "bg-[#EEF4FA]"
    }`}>
      
      <main className={`relative flex flex-col w-full sm:max-w-[600px] min-h-[100dvh] sm:border-x border-[#E2EAF2] ${
        bgWhite ? "px-[26px] pt-[30px] pb-[60px]" : "bg-white"
      }`}>
        {children}
      </main>

      {!bgWhite && <RightSidebar />}

    </div>
  );
}