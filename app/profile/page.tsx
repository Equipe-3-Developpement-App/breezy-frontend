"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Home, Search, Bell, Mail, User, MessageCircle, Repeat2, Heart, Share, Edit3, Settings, LogOut, X } from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("messages");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(64);
  
  // Local state for opening and closing the settings drawer
  const [showSettings, setShowSettings] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    // Global centered container on the PC screen
    <div className="flex justify-center items-center bg-gray-900 min-h-screen w-full p-4 select-none">
      
      {/* Profile page fake phone frame -> same height as the feed page */}
      <main className="relative flex flex-col w-full max-w-[499px] h-[900px] bg-[#EEF4FA] shadow-2xl rounded-3xl overflow-hidden border border-gray-800 font-sans">
        
        {/* Main scroll zone -> content scrolls inside this area */}
        <div className="flex-1 overflow-y-auto pb-[68px]">
          
          {/* Top info row -> avatar and action buttons */}
          <div className="flex justify-between items-end px-5 pt-[35px] pb-4 w-full bg-transparent">
            
            {/* Avatar wrapper -> 84x84 gradient circle with white outline */}
            <div className="w-[84px] h-[84px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[33.6px] shadow-[0_0_0_4px_#FFFFFF]">
              CR
            </div>
            
            {/* Settings and Edit Profile controls on the right side */}
            <div className="flex flex-col items-end gap-[30px] w-full max-w-[375px]">
              
              {/* BtnSettings -> w/h: 34px, type et label configurés pour éviter les erreurs Edge */}
              <button 
                type="button" 
                onClick={() => setShowSettings(true)}
                aria-label="Ouvrir les paramètres"
                className="w-[34px] h-[34px] flex items-center justify-center text-[#16212E] hover:text-[#2A6FDB] hover:bg-white/50 rounded-full transition-colors cursor-pointer bg-transparent border-none p-0">
                <Settings size={24} />
              </button>

              {/* ButtonModifProfile -> w: 138px, h: 40px, border: #B4B8BC */}
              <button 
                type="button"
                className="w-[138px] h-[40px] border border-[#B4B8BC] bg-white hover:bg-gray-50 text-[#16212E] font-semibold text-[15px] rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 select-none"
              >
                <span>Modifier le profil</span>
              </button>

            </div>
          </div>

          {/* Info block: name, handle, bio, and follower stats */}
          <div className="flex flex-col gap-3.5 w-full pb-[15px]">
            
            {/* Name section with profile display name and handle */}
            <div className="flex flex-col text-left px-5">
              <h2 className="text-[21px] font-extrabold text-[#16212E] tracking-tight leading-[25px]">
                Camille Roy
              </h2>
              <p className="text-[15px] text-[#5C708A] leading-[18px]">
                @camille
              </p>
            </div>

            {/* Bio and follower stats section */}
            <div className="flex flex-col gap-3.5 text-left px-5">
              <p className="text-[14.5px] text-[#16212E] leading-[22px]">
                Designer produit basée à Lyon. Je peaufine des marges et je bois du café froid.
              </p>
              
              {/* div.bz-profile-stats -> gap: 22px */}
              <div className="flex items-center gap-[22px] text-[13.5px]">
                <span className="text-[#5C708A]">
                  <strong className="font-extrabold text-[#16212E]">312</strong> abonnements
                </span>
                <span className="text-[#5C708A]">
                  <strong className="font-extrabold text-[#16212E]">1 284</strong> abonnés
                </span>
              </div>
            </div>
          </div>

          {/* Tabs bar -> switch between Messages, Responses, and Media */}
          <div className="flex justify-between items-center px-5 h-[44px] w-full bg-transparent border-b border-[#E2EAF2]">
            
            {/* Messages tab */}
            <button 
              type="button"
              onClick={() => setActiveTab("messages")}
              className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative
                ${activeTab === "messages" ? "text-[#16212E] font-extrabold" : "text-[#5C708A] font-semibold hover:text-[#16212E]"}`}
            >
              <span>Messages</span>
              {activeTab === "messages" && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#2A6FDB]" />
              )}
            </button>

            {/* Responses tab */}
            <button 
              type="button"
              onClick={() => setActiveTab("responses")}
              className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative
                ${activeTab === "responses" ? "text-[#16212E] font-extrabold" : "text-[#5C708A] font-semibold hover:text-[#16212E]"}`}
            >
              <span>Réponses</span>
              {activeTab === "responses" && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#2A6FDB]" />
              )}
            </button>

            {/* Media tab */}
            <button 
              type="button"
              onClick={() => setActiveTab("medias")}
              className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative
                ${activeTab === "medias" ? "text-[#16212E] font-extrabold" : "text-[#5C708A] font-semibold hover:text-[#16212E]"}`}
            >
              <span>Médias</span>
              {activeTab === "medias" && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#2A6FDB]" />
              )}
            </button>
          </div>

          {/* Rendered tweet feed section for the selected tab */}
          <div className="w-full text-left">
            {activeTab === "messages" && (
              /* TweetCard Camille Roy -> Conforme aux structures du projet */
              <div className="flex p-4 bg-[#EEF4FA] border-b border-[#E2EAF2] w-full">
                <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[16.8px]">
                  CR
                </div>
                <div className="flex flex-col gap-2.5 ml-3 w-full">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[14.5px] text-[#16212E]">Camille Roy</span>
                      <span className="text-[13px] text-[#5C708A]">@camille</span>
                      <span className="text-[14px] text-[#5C708A]">·</span>
                      <span className="text-[13px] text-[#5C708A]">2 h</span>
                    </div>
                  </div>
                  <p className="text-[14.5px] text-[#16212E] leading-[22px]">
                    Petit rappel du matin : un bon espacement vaut mille décorations. Je repars peaufiner mes marges ✨
                  </p>
                  
                  {/* Tweet action buttons */}
                  <div className="flex justify-between items-center text-[#5C708A] text-[13px] font-medium max-w-[280px] mt-1 w-full">
                    <button type="button" aria-label="Commenter" className="flex items-center gap-1.5 cursor-pointer hover:text-blue-500 transition bg-transparent border-none p-0">
                      <MessageCircle size={17} strokeWidth={2} />
                      <span>12</span>
                    </button>
                    <button type="button" aria-label="Retweeter" className="flex items-center gap-1.5 cursor-pointer hover:text-green-500 transition bg-transparent border-none p-0">
                      <Repeat2 size={17} strokeWidth={2} />
                      <span>8</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={handleLike}
                      aria-label="Aimer"
                      className={`flex items-center gap-1.5 cursor-pointer hover:text-red-500 transition bg-transparent border-none p-0 ${isLiked ? "text-red-500" : ""}`}
                    >
                      <Heart size={17} strokeWidth={2} className={isLiked ? "fill-red-500" : ""} />
                      <span>{likeCount}</span>
                    </button>
                    <button type="button" aria-label="Partager" className="cursor-pointer hover:text-blue-500 transition bg-transparent border-none p-0">
                      <Share size={17} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "responses" && (
              <div className="text-center p-8 text-[#5C708A] text-[14.5px]">Aucune réponse à afficher.</div>
            )}

            {activeTab === "medias" && (
              <div className="text-center p-8 text-[#5C708A] text-[14.5px]">Aucun média disponible.</div>
            )}
          </div>
        </div>

        {/* Floating compose button */}
        <button 
          type="button"
          aria-label="Créer un tweet"
          className="absolute bottom-24 right-6 w-[56px] h-[56px] bg-[#2A6FDB] hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl z-30 font-bold text-2xl cursor-pointer transition-all active:scale-95 select-none"
        >
          +
        </button>

        {/* Bottom navigation bar */}
        <nav className="absolute bottom-0 left-0 right-0 h-[68px] flex justify-around items-center px-6 pb-4 pt-2 bg-white/95 backdrop-blur-sm border-t border-[#E2EAF2] z-20">
          <Link href="/" aria-label="Accueil" className="text-[#9AABBF] hover:text-[#2A6FDB] cursor-pointer hover:scale-110 transition">
            <Home size={22} strokeWidth={2} />
          </Link>
          <button type="button" aria-label="Recherche" className="text-[#9AABBF] hover:text-[#2A6FDB] cursor-pointer hover:scale-110 transition bg-transparent border-none p-0">
            <Search size={22} strokeWidth={2} />
          </button>
          <button type="button" aria-label="Notifications" className="text-[#9AABBF] hover:text-[#2A6FDB] cursor-pointer hover:scale-110 transition bg-transparent border-none p-0">
            <Bell size={22} strokeWidth={2} />
          </button>
          <button type="button" aria-label="Messages" className="text-[#9AABBF] hover:text-[#2A6FDB] cursor-pointer hover:scale-110 transition bg-transparent border-none p-0">
            <Mail size={22} strokeWidth={2} />
          </button>
          <Link href="/profile" aria-label="Profil" className="text-[#2A6FDB] cursor-pointer hover:scale-110 transition">
            <User size={22} strokeWidth={2.5} />
          </Link>
        </nav>

        {/* Interactive settings drawer */}
        {showSettings && (
          <>
            {/* Semi-transparent backdrop to close the drawer */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity duration-300"
              onClick={() => setShowSettings(false)}
            />
            
            {/* Bottom sliding drawer with modern rounded style */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-8 z-[60] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex flex-col gap-4 animate-in slide-in-from-bottom duration-300">
              
              {/* Small drag indicator bar */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />
              
              {/* Drawer header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-[19px] font-extrabold text-[#16212E]">Options</h3>
                <button 
                  type="button" 
                  onClick={() => setShowSettings(false)}
                  aria-label="Fermer les options"
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-[#5C708A] cursor-pointer transition-colors border-none"  >
                  <X size={18} />
                </button>
              </div>

              {/* Options list -> includes logout link */}
              <div className="flex flex-col w-full pt-1">
                <Link 
                  href="/auth" 
                  className="flex items-center gap-4 w-full p-4 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-xl transition-all cursor-pointer select-none group">
                  <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-[16px]">Se déconnecter</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}