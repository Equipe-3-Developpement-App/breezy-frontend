"use client";

import React from "react";
import { X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutApi } from "@/utils/api";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try { 
      await logoutApi(); 
    } catch (err) {} finally { 
      router.push("/login"); 
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#080E1C]/50 backdrop-blur-[6px] z-[100] transition-opacity duration-300" 
        onClick={onClose} 
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] bg-white rounded-[24px] shadow-2xl z-[110] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-breezy-border-light overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-breezy-border-light bg-white">
          <button type="button" onClick={onClose} title="Fermer" aria-label="Fermer" className="p-1 hover:bg-gray-100 rounded-full transition-colors text-breezy-dark cursor-pointer border-none bg-transparent">
            <X size={20} />
          </button>
          <span className="font-extrabold text-[16px] text-breezy-dark">Paramètres</span>
          <div className="w-8" />
        </div>
        <div className="p-4 bg-white flex flex-col">
          <button type="button" onClick={handleLogout} className="flex items-center gap-4 w-full p-4 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-xl transition-all cursor-pointer border-none bg-transparent text-left">
            <LogOut size={20} /> <span className="font-bold text-[16px]">Se déconnecter</span>
          </button>
        </div>
      </div>
    </>
  );
}