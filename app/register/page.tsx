import React from "react";
import Link from "next/link";
import { Wind } from "lucide-react";

export default function RegisterPage() {
    return (
        // Create account page -> global centered mockup container
        <div className="flex justify-center items-center bg-gray-900 min-h-screen w-full p-4">

            {/* Phone frame -> white background, fixed height, and padding */}
            <main className="relative flex flex-col justify-between items-center w-full max-w-[499px] h-[900px] bg-white shadow-2xl rounded-3xl overflow-hidden px-[26px] pt-[30px] pb-[60px] border border-gray-800 font-sans">

                {/* Top section: contains header and form, flex-grow pushes buttons to the bottom */}
                <div className="flex flex-col gap-[40px] w-full flex-1">

                    {/* Register header section -> 24px gap */}
                    <div className="flex flex-col gap-6 w-full text-left">
                        {/* Top-left logo and title space -> 15px gap */}
                        <div className="flex items-center gap-[15px] text-[#16212E]">
                            <Wind size={34} className="text-[#2A6FDB]" strokeWidth={2.5} />
                            <span className="font-extrabold text-[28px] tracking-tight leading-[34px]">
                                Breezy
                            </span>
                        </div>
                        {/* Page title -> create account */}
                        <h1 className="text-[25px] font-extrabold text-[#16212E] tracking-tight leading-[30px]">
                            Créer un compte
                        </h1>
                    </div>

                    {/* Form fields section -> spacing between each field */}
                    <div className="flex flex-col gap-[30px] w-full">

                        {/* Username field -> label font-size 18px */}
                        <div className="flex flex-col gap-2.5 w-full text-left">
                            <label className="text-[18px] font-bold text-[#16212E]">
                                Nom d'utilisateur
                            </label>
                            {/* InputBox -> padding: 13px 14px, border-radius: 12px, h: 47px */}
                            <input
                                type="text"
                                placeholder="Username"
                                className="w-full h-[47px] px-3.5 border border-[#CDD9E6] rounded-[12px] outline-none text-[16px] text-[#16212E] placeholder-[#16212E]/40 focus:border-[#2A6FDB] transition-colors bg-white"/>
                        </div>
                        {/* Email field */}
                        <div className="flex flex-col gap-2.5 w-full text-left">
                            <label className="text-[18px] font-bold text-[#16212E]">
                                Courriel
                            </label>
                            {/* InputBox -> h: 46px */}
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full h-[46px] px-3.5 border border-[#CDD9E6] rounded-[12px] outline-none text-[15px] text-[#16212E] placeholder-[#16212E]/40 focus:border-[#2A6FDB] transition-colors bg-white"
                            />
                        </div>

                        {/* Password field */}
                        <div className="flex flex-col gap-2.5 w-full text-left">
                            <label className="text-[18px] font-bold text-[#16212E]">
                                Mot de passe
                            </label>
                            {/* InputBox -> h: 46px */}
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full h-[46px] px-3.5 border border-[#CDD9E6] rounded-[12px] outline-none text-[15px] text-[#16212E] placeholder-[#16212E]/40 focus:border-[#2A6FDB] transition-colors bg-white"
                            />
                        </div>

                    </div>

                </div>

                {/* Bottom section: action buttons area with spacing */}
                <div className="flex flex-col gap-3 w-full items-center mt-6">

                    {/* BtnRegister -> background: #2A6FDB, h: 47.19px, text-size: 16px */}
                    <button className="w-full h-[47.19px] bg-[#2A6FDB] text-white font-bold text-[16px] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1e52a4] active:scale-98 transition-all select-none">
                        Créer un compte
                    </button>

                    {/* div.bz-auth-alt -> padding-top: 22px, font-size: 14px */}
                    <div className="pt-[22px] flex justify-center items-center w-full">
                        <p className="text-[14px] text-[#5C708A] tracking-normal leading-[17px]">
                            Déjà un compte ?{" "}
                            <Link href="/login" className="text-[#2A6FDB] font-bold hover:underline cursor-pointer select-none">
                                Se connecter
                            </Link>
                        </p>
                    </div>

                </div>

            </main>

        </div>
    );
}