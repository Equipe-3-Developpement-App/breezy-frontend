import React from "react";

interface PhoneFrameProps {
  children: React.ReactNode;
  bgWhite?: boolean; // Allows switching the background to white for login/register
}

export function PhoneFrame({ children, bgWhite = false }: PhoneFrameProps) {
  return (
    <div className="flex justify-center items-center bg-gray-900 min-h-screen w-full p-4 select-none">
      <main className={`relative flex flex-col w-full max-w-[499px] h-[900px] shadow-2xl rounded-3xl overflow-hidden border border-gray-800 font-sans ${
        bgWhite ? "bg-white px-[26px] pt-[30px] pb-[60px]" : "bg-[#EEF4FA]"
      }`}>
        {children}
      </main>
    </div>
  );
}