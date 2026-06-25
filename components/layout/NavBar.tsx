"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Search, User, Settings, UserPlus, Feather } from "lucide-react";
import { fetchCurrentUser } from "@/utils/api";
import { SettingsModal } from "../modals/SettingsModal";
import { AdminRegisterModal } from "../modals/AdminRegisterModal";
import { ComposeModal } from "../modals/ComposeModal";

interface NavBarProps {
  activePage: "home" | "profile" | "search";
}

export function NavBar({ activePage }: NavBarProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    fetchCurrentUser().then(user => { if (user) setUserRole(user.role); });
  }, []);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-[68px] md:top-0 md:bottom-auto md:right-auto md:w-[80px] lg:w-[250px] md:h-screen bg-white/95 backdrop-blur-sm border-t md:border-t-0 md:border-r border-breezy-border-light z-50 flex md:flex-col justify-evenly md:justify-start items-center lg:items-start px-6 md:px-0 md:pt-6 pb-4 md:pb-0 pt-2 md:gap-4">

        <Link 
          href="/feed" 
          className="hidden md:flex lg:w-full lg:px-8 mb-2 items-center justify-center lg:justify-start shrink-0 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-breezy-blue rounded-lg no-underline"
          title="Retour au flux"
          aria-label="Retour au flux"
        >
          <span className="text-[26px] font-extrabold text-[#16212E] tracking-tight leading-none">Breez</span>
          <img
            src="/breezy-icon.png"
            alt="y"
            className="w-auto h-[28px] object-contain -ml-[1px] translate-y-[2px]"
          />
        </Link>

        <button
          type="button"
          onClick={() => setShowCompose(true)}
          className="hidden md:flex items-center justify-center gap-3 w-[50px] h-[50px] lg:w-[90%] lg:h-[48px] lg:ml-[5%] bg-breezy-blue hover:bg-breezy-darkBlue text-white font-bold rounded-full transition-all active:scale-95 cursor-pointer border-none shadow-md mb-4 shrink-0"
          title="Nouveau post"
          aria-label="Nouveau post"
        >
          <Feather size={20} />
          <span className="hidden lg:block text-[16px]">Nouveau post</span>
        </button>

        <Link href="/feed" className={`flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition rounded-full md:p-3 lg:px-6 lg:py-3 lg:w-[90%] lg:ml-[5%] ${activePage === "home" ? "text-breezy-blue" : "text-breezy-gray hover:text-breezy-blue"}`}>
          <Home size={26} strokeWidth={activePage === "home" ? 2.5 : 2} />
          <span className={`hidden lg:block text-[19px] ${activePage === "home" ? "font-extrabold" : "font-medium"}`}>Accueil</span>
        </Link>

        <Link href="/search" className={`flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition rounded-full md:p-3 lg:px-6 lg:py-3 lg:w-[90%] lg:ml-[5%] ${activePage === "search" ? "text-breezy-blue" : "text-breezy-gray hover:text-breezy-blue"}`}>
          <Search size={26} strokeWidth={activePage === "search" ? 2.5 : 2} />
          <span className={`hidden lg:block text-[19px] ${activePage === "search" ? "font-extrabold" : "font-medium"}`}>Explorer</span>
        </Link>

        <Link href="/profile" className={`flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition rounded-full md:p-3 lg:px-6 lg:py-3 lg:w-[90%] lg:ml-[5%] ${activePage === "profile" ? "text-breezy-blue" : "text-breezy-gray hover:text-breezy-blue"}`}>
          <User size={26} strokeWidth={activePage === "profile" ? 2.5 : 2} />
          <span className={`hidden lg:block text-[19px] ${activePage === "profile" ? "font-extrabold" : "font-medium"}`}>Profil</span>
        </Link>

        <div className="hidden md:flex flex-col mt-auto mb-6 gap-2 w-full lg:px-4 shrink-0">
          {userRole === "admin" && (
            <button type="button" onClick={() => setShowAdmin(true)} className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition rounded-full md:p-3 lg:px-6 lg:py-3 lg:w-[90%] lg:ml-[5%] text-breezy-gray hover:text-breezy-blue border-none bg-transparent">
              <UserPlus size={26} strokeWidth={2} />
              <span className="hidden lg:block text-[19px] font-medium">Créer un compte</span>
            </button>
          )}
          <button type="button" onClick={() => setShowSettings(true)} className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition rounded-full md:p-3 lg:px-6 lg:py-3 lg:w-[90%] lg:ml-[5%] text-breezy-gray hover:text-breezy-blue border-none bg-transparent">
            <Settings size={26} strokeWidth={2} />
            <span className="hidden lg:block text-[19px] font-medium">Paramètres</span>
          </button>
        </div>
      </nav>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showAdmin && <AdminRegisterModal onClose={() => setShowAdmin(false)} />}
      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
    </>
  );
}