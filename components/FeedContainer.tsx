"use client";

import React, { useState, useEffect } from "react";
import { TweetList } from "./tweets/TweetList";
import { NavBar } from "./layout/NavBar";
import { ComposeModal } from "./modals/ComposeModal";
import { AdminRegisterModal } from "./modals/AdminRegisterModal"; 
import { Wind, UserPlus, Settings, LogOut, X } from "lucide-react"; 
import { getCurrentUserProfile, UserProfile, fetchCurrentUser, logoutApi } from "@/utils/api";
import { useRouter } from "next/navigation";

export function FeedContainer() {
  const router = useRouter();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isAdminRegisterOpen, setIsAdminRegisterOpen] = useState(false); 
  const [showSettings, setShowSettings] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); 

  useEffect(() => {
    getCurrentUserProfile().then(setCurrentUser);
    fetchCurrentUser().then(user => {
      if (user) setUserRole(user.role);
    });
  }, []);

  const handleLogout = async () => {
    try { 
      await logoutApi(); 
    } catch (err) {
      console.error(err);
    } finally { 
      router.push("/login"); 
    }
  };

  return (
    <>
      <header className="flex justify-between items-center px-[18px] pt-[35px] pb-[20px] bg-[#EEF4FA]/80 backdrop-blur-md z-10 border-b border-gray-200/50 w-full">
        <div className="flex items-center gap-2 font-extrabold text-[19px] text-[#16212E] tracking-tight">
          <Wind size={20} className="text-[#2A6FDB]" strokeWidth={2.5} />
          <span>Breezy</span>
        </div>
        
        <div className="flex items-center gap-4">
          {userRole === "admin" && (
            <button 
              type="button" 
              onClick={() => setIsAdminRegisterOpen(true)}
              aria-label="Créer un compte utilisateur" 
              title="Créer un compte utilisateur" 
              className="text-[#5C708A] hover:text-[#2A6FDB] hover:scale-110 transition cursor-pointer bg-transparent border-none p-0 flex"
            >
              <UserPlus size={20} strokeWidth={2} />
            </button>
          )}

          <button 
            type="button" 
            onClick={() => setShowSettings(true)}
            aria-label="Ouvrir les paramètres" 
            title="Ouvrir les paramètres" 
            className="text-[#5C708A] hover:text-[#2A6FDB] hover:scale-110 transition cursor-pointer bg-transparent border-none p-0 flex"
          >
            <Settings size={20} strokeWidth={2} />
          </button>
        </div>
      </header>

      <div 
        onClick={() => setIsComposeOpen(true)}
        className="flex items-start p-4 bg-white gap-3 border-b border-[#E2EAF2] z-10 cursor-pointer hover:bg-gray-50/50 transition-colors"
      >
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
        className="absolute bottom-24 right-6 w-[56px] h-[56px] bg-[#2A6FDB] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-blue-700 active:scale-95 transition-all z-30 font-bold text-2xl cursor-pointer border-none"
      >
        +
      </button>

      <NavBar activePage="home" />

      {isComposeOpen && <ComposeModal onClose={() => setIsComposeOpen(false)} />}
      
      {isAdminRegisterOpen && <AdminRegisterModal onClose={() => setIsAdminRegisterOpen(false)} />}

      {showSettings && (
        <>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity" onClick={() => setShowSettings(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-8 z-[60] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex flex-col gap-4 animate-in slide-in-from-bottom">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-[19px] font-extrabold text-breezy-dark">Options</h3>
              <button type="button" onClick={() => setShowSettings(false)} aria-label="Fermer" title="Fermer" className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-breezy-gray cursor-pointer border-none"><X size={18} /></button>
            </div>
            <button type="button" onClick={handleLogout} aria-label="Se déconnecter" title="Se déconnecter" className="flex items-center gap-4 w-full p-4 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-xl transition-all cursor-pointer border-none bg-transparent text-left">
              <LogOut size={20} /> <span className="font-bold text-[16px]">Se déconnecter</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}