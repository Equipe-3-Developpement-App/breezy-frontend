"use client";

import React from "react";
import Link from "next/link";
import { Home, Search, User } from "lucide-react";

interface NavBarProps {
  activePage: "home" | "profile" | "search";
}

export function NavBar({ activePage }: NavBarProps) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 h-[68px] flex justify-evenly items-center px-6 pb-4 pt-2 bg-white/95 backdrop-blur-sm border-t border-breezy-border-light z-20">
      <Link href="/feed" aria-label="Accueil" className={`cursor-pointer hover:scale-110 transition ${activePage === "home" ? "text-breezy-blue" : "text-breezy-gray hover:text-breezy-blue"}`}>
        <Home size={22} strokeWidth={activePage === "home" ? 2.5 : 2} />
      </Link>
      
      <Link href="/search" aria-label="Recherche" className={`cursor-pointer hover:scale-110 transition flex items-center justify-center ${activePage === "search" ? "text-breezy-blue" : "text-breezy-gray hover:text-breezy-blue"}`}>
        <Search size={22} strokeWidth={activePage === "search" ? 2.5 : 2} />
      </Link>
      
      <Link href="/profile" aria-label="Profil" className={`cursor-pointer hover:scale-110 transition ${activePage === "profile" ? "text-breezy-blue" : "text-breezy-gray hover:text-breezy-blue"}`}>
        <User size={22} strokeWidth={activePage === "profile" ? 2.5 : 2} />
      </Link>
    </nav>
  );
}