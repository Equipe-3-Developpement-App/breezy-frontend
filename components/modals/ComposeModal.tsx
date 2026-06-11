"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Image, Tag, Smile } from "lucide-react";
import { createTweetApi } from "@/utils/api";
import EmojiPicker, { Theme } from "emoji-picker-react";

interface ComposeModalProps {
  onClose: () => void;
}

export function ComposeModal({ onClose }: ComposeModalProps) {
  const [text, setText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const maxLength = 280;
  const charsLeft = maxLength - text.length;
  const canPublish = text.trim().length > 0 && charsLeft >= 0 && !isPublishing;

  // Closes the emoji tray if clicking on the overlay or outside the modal layout
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        // Optionnel : décommenter si tu veux fermer en cliquant à l'extérieur
        // setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const emoji = emojiData.emoji;

    setText((currentText) => {
      const updatedText = 
        currentText.substring(0, startPos) + 
        emoji + 
        currentText.substring(endPos, currentText.length);
        
      return updatedText;
    });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + emoji.length, startPos + emoji.length);
    }, 10);
  };

  const handlePublish = async () => {
    if (!canPublish) return;

    try {
      setIsPublishing(true);
      await createTweetApi(text);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Failed to publish new breezy post:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      {/* Background Overlay Scrim */}
      <div 
        className="absolute inset-0 bg-[#080E1C]/50 backdrop-blur-[6px] z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Main Container - Adjusted layout for unified bottom panel expansion */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[420px] bg-white rounded-[24px] shadow-2xl z-[60] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-breezy-border-light">
        
        {/* Modal Header */}
        <div className="relative flex justify-between items-center px-4 py-3 border-b border-breezy-border-light h-14 bg-white shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            aria-label="Fermer"
            title="Fermer"
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-breezy-dark cursor-pointer"
          >
            <X size={20} />
          </button>
          
          <span className="absolute left-1/2 -translate-x-1/2 font-extrabold text-[16px] text-breezy-dark">
            Nouveau post
          </span>
          <div className="w-8" /> {/* Balance spacer */}
        </div>

        {/* Input Text Area Container */}
        <div className="p-4 flex gap-3 bg-white min-h-[140px]">
          <div className="w-[40px] h-[40px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[15px]">
            CR
          </div>
          <textarea 
            ref={textareaRef}
            placeholder="Quoi de neuf dans la brise ?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isPublishing}
            className="flex-1 resize-none outline-none text-[15.5px] text-breezy-dark placeholder-breezy-dark/40 pt-1.5 min-h-[100px]"
          />
        </div>

        {/* Action Toolbar Grid Line */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-breezy-border-light bg-white shrink-0">
          <div className="flex items-center gap-2 text-breezy-blue">
            <button type="button" aria-label="Ajouter une image" title="Ajouter une image" className="hover:bg-blue-50 p-2 rounded-full transition"><Image size={18} /></button>
            <button type="button" aria-label="Ajouter un tag" title="Ajouter un tag" className="hover:bg-blue-50 p-2 rounded-full transition"><Tag size={18} /></button>
            
            <button 
              type="button" 
              onClick={() => setShowPicker(!showPicker)}
              aria-label="Ajouter un emoji"
              title="Ajouter un emoji"
              className={`p-2 rounded-full transition cursor-pointer ${showPicker ? "bg-blue-50 text-breezy-darkBlue" : "hover:bg-blue-50"}`}
            >
              <Smile size={18} />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`text-[12.5px] font-medium ${charsLeft < 0 ? "text-red-500 font-bold" : "text-breezy-gray"}`}>
              {charsLeft}
            </span>
            <button 
              type="button"
              onClick={handlePublish}
              disabled={!canPublish}
              className="px-4 py-1.5 bg-breezy-blue hover:bg-breezy-darkBlue disabled:opacity-40 disabled:hover:bg-breezy-blue text-white font-bold text-[13px] rounded-full transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
            >
              {isPublishing ? "Publication..." : "Publier"}
            </button>
          </div>
        </div>

        {/* Unified Bottom Dock Emoji Drawer Section */}
        {showPicker && (
          <div 
            ref={pickerRef} 
            className="w-full border-t border-breezy-border-light bg-gray-50 animate-in slide-in-from-bottom duration-200"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              autoFocusSearch={false}
              theme={Theme.LIGHT}
              width="100%"
              height={260}
              previewConfig={{ showPreview: false }}
              searchDisabled={false}
              skinTonesDisabled
            />
          </div>
        )}

      </div>
    </>
  );
}