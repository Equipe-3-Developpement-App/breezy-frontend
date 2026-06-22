"use client";

import React, { useState, useEffect } from "react";
import { TweetList } from "./tweets/TweetList";
import { NavBar } from "./layout/NavBar";
import { ComposeModal } from "./modals/ComposeModal";
import { Search, Wind } from "lucide-react";
import { getCurrentUserProfile, UserProfile } from "@/utils/api";

export function FeedContainer() {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getCurrentUserProfile().then(setCurrentUser);
  }, []);

  return (
    <>
      <header className="flex justify-between items-center px-[18px] pt-[35px] pb-[20px] bg-[#EEF4FA]/80 backdrop-blur-md z-10 border-b border-gray-200/50 w-full">
        <div className="flex items-center gap-2 font-extrabold text-[19px] text-[#16212E] tracking-tight">
          <Wind size={20} className="text-[#2A6FDB]" strokeWidth={2.5} />
          <span>Breezy</span>
        </div>
        <button type="button" aria-label="Recherche" title="Recherche" className="text-[#5C708A] hover:text-[#2A6FDB] hover:scale-110 transition cursor-pointer bg-transparent border-none p-0">
          <Search size={20} strokeWidth={2} />
        </button>
      </header>

      <div 
        onClick={() => setIsComposeOpen(true)}
        className="flex items-start p-4 bg-white gap-3 border-b border-[#E2EAF2] z-10 cursor-pointer hover:bg-gray-50/50 transition-colors"
      >
        {/* AVATAR DYNAMIQUE */}
        {currentUser?.avatar_url ? (
          <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-gradient-to-br from-[#D2D2D2] to-[#767676] flex items-center justify-center font-bold text-white text-[16px] overflow-hidden">
            {currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : ""}
          </div>
        )}
        <div className="flex-1 pt-2">
          <span className="text-[15px] text-[#9AABBF]">Comment ça va ?</span>
        </div>
      </div>

      <TweetList />

      <button 
        type="button" 
        onClick={() => setIsComposeOpen(true)}
        aria-label="Créer un tweet" 
        className="absolute bottom-24 right-6 w-[56px] h-[56px] bg-[#2A6FDB] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-blue-700 active:scale-95 transition-all z-30 font-bold text-2xl cursor-pointer"
      >
        +
      </button>

      <NavBar activePage="home" />

      {isComposeOpen && <ComposeModal onClose={() => setIsComposeOpen(false)} />}
    </>
  );
}