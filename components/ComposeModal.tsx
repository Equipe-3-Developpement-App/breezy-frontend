"use client";

import React, { useState } from "react";
import { X, Image, Tag, Smile } from "lucide-react";
import { createTweetApi } from "@/utils/api";

interface ComposeModalProps {
  onClose: () => void;
}

export function ComposeModal({ onClose }: ComposeModalProps) {
  const [text, setText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  
  const maxLength = 280;
  const charsLeft = maxLength - text.length;
  const canPublish = text.trim().length > 0 && charsLeft >= 0 && !isPublishing;

  const handlePublish = async () => {
    if (!canPublish) return;

    try {
      setIsPublishing(true);
      await createTweetApi(text);
      onClose();
      
      // Reload the current route stream to fetch the updated localStorage array
      window.location.reload();
    } catch (err) {
      console.error("Failed to publish new breezy post:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <div 
        className="absolute inset-0 bg-[#080E1C]/50 backdrop-blur-[6px] z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[459px] bg-white rounded-[18px] shadow-2xl z-[60] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="relative flex justify-between items-center px-4 py-3 border-b border-breezy-border-light h-14">
          <button 
            type="button" 
            onClick={onClose}
            aria-label="Fermer la modale"
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-breezy-dark"
          >
            <X size={20} />
          </button>
          
          <span className="absolute left-1/2 -translate-x-1/2 font-extrabold text-[16px] text-breezy-dark">
            Nouveau post
          </span>
        </div>

        <div className="p-4 flex gap-3 min-h-[160px]">
          <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[16.8px]">
            CR
          </div>
          <textarea 
            placeholder="Quoi de neuf dans la brise ?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isPublishing}
            className="flex-1 resize-none outline-none text-[16px] text-breezy-dark placeholder-breezy-dark/40 pt-2 h-full min-h-[120px]"
          />
        </div>

        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-50 bg-white">
          <div className="flex items-center gap-3 text-breezy-blue">
            <button type="button" aria-label="Ajouter une image" className="hover:bg-blue-50 p-1.5 rounded-full transition"><Image size={18} /></button>
            <button type="button" aria-label="Taguer quelqu'hui" className="hover:bg-blue-50 p-1.5 rounded-full transition"><Tag size={18} /></button>
            <button type="button" aria-label="Ajouter un émoji" className="hover:bg-blue-50 p-1.5 rounded-full transition"><Smile size={18} /></button>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`text-[13px] ${charsLeft < 0 ? "text-red-500 font-bold" : "text-breezy-gray"}`}>
              {charsLeft}
            </span>
            <button 
              type="button"
              onClick={handlePublish}
              disabled={!canPublish}
              className="px-4 py-1.5 bg-breezy-blue hover:bg-breezy-darkBlue disabled:opacity-50 disabled:hover:bg-breezy-blue text-white font-bold text-[13px] rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isPublishing ? "Publication..." : "Publier"}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}