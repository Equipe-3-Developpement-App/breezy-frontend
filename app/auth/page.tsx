import React from "react";
import Link from "next/link";
import { Wind } from "lucide-react";

export default function AuthPage() {
    return (
      // Auth page centered container (smartphone simulator on PC)
      <div className="flex justify-center items-center bg-gray-900 min-h-screen w-full p-4">

            {/* Phone frame container -> white background and vertical spacing */}
            <main className="relative flex flex-col justify-between items-center w-full max-w-[499px] h-[900px] bg-white shadow-2xl rounded-3xl overflow-hidden p-6 py-[60px] border border-gray-800 font-sans">

                {/* Logo and slogan block -> fills available space and pushes actions down */}
                <div className="flex flex-col justify-center items-center flex-1 gap-[34px] w-full">

                    {/* Centered logo */}
                    <div className="flex flex-col items-center gap-[5px]">
                        {/* WindIcon -> width/height: 70px */}
                        <Wind size={70} className="text-[#2A6FDB]" strokeWidth={2.5} />
                        {/* Breezy title -> font-size: 32px, font-weight: 800 */}
                        <h1 className="text-[32px] font-extrabold text-[#16212E] tracking-tight text-center">
                            Breezy
                        </h1>
                    </div>

                    {/* Slogan block with vertical spacing */}
                    <div className="flex flex-col items-center gap-2 text-center px-4">
                        {/* Slogan -> font-size: 20px, Bold */}
                        <p className="text-[20px] font-bold text-black leading-tight">
                            Des idées légères,
                        </p>
                        {/* Bottom text -> font-size: 20px, Regular, #5C708A */}
                        <p className="text-[20px] font-normal text-[#5C708A] leading-tight">
                            qui voyagent vite.
                        </p>
                    </div>

                </div>

                {/* Action buttons section -> stretched links with spacing */}
                <div className="flex flex-col gap-3 w-full max-w-[451px]">

                    <Link
                        href="/register"
                        className="w-full h-[48px] bg-[#2A6FDB] text-white font-bold text-[16px] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1e52a4] active:scale-98 transition-all select-none">
                        Créer un compte
                    </Link>

                    <Link
                        href="/login"
                        className="w-full h-[48px] border border-[#CDD9E6] text-[#16212E] font-bold text-[16px] rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 active:scale-98 transition-all select-none">
                        Se connecter
                    </Link>

                </div>

            </main>

        </div>
    );
}