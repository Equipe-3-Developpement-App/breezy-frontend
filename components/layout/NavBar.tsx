"use client";

import React from "react";
import Link from "next/link";
import { Home, Search, Bell, Mail, User } from "lucide-react";

interface NavBarProps {
  activePage: "home" | "profile" | "search" | "notifications" | "messages";
}

export function NavBar({ activePage }: NavBarProps) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 h-[68px] flex justify-around items-center px-6 pb-4 pt-2 bg-white/95 backdrop-blur-sm border-t border-breezy-border-light z-20">
      <Link 
        href="/feed" 
        aria-label="Accueil" 
        className={`cursor-pointer hover:scale-110 transition ${activePage === "home" ? "text-breezy-blue" : "text-breezy-gray hover:text-breezy-blue"}`}
      >
        <Home size={22} strokeWidth={activePage === "home" ? 2.5 : 2} />
      </Link>
      
      <button type="button" aria-label="Recherche" className="text-breezy-gray hover:text-breezy-blue cursor-pointer hover:scale-110 transition bg-transparent border-none p-0">
        <Search size={22} strokeWidth={2} />
      </button>
      
      <button type="button" aria-label="Notifications" className="text-breezy-gray hover:text-breezy-blue cursor-pointer hover:scale-110 transition bg-transparent border-none p-0">
        <Bell size={22} strokeWidth={2} />
      </button>
      
      <button type="button" aria-label="Messages" className="text-breezy-gray hover:text-breezy-blue cursor-pointer hover:scale-110 transition bg-transparent border-none p-0">
        <Mail size={22} strokeWidth={2} />
      </button>
      
      <Link 
        href="/profile" 
        aria-label="Profil" 
        className={`cursor-pointer hover:scale-110 transition ${activePage === "profile" ? "text-breezy-blue" : "text-breezy-gray hover:text-breezy-blue"}`}
      >
        <User size={22} strokeWidth={activePage === "profile" ? 2.5 : 2} />
      </Link>
    </nav>
  );
}