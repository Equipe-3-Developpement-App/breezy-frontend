"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Image, Tag, Smile } from "lucide-react";
import { createTweetApi, updateTweetApi, uploadMediaApi, getCurrentUserProfile, UserProfile } from "@/utils/api";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Tweet } from "@/types";

interface ComposeModalProps {
  onClose: () => void;
  tweetToEdit?: Tweet | null;
}

export function ComposeModal({ onClose, tweetToEdit }: ComposeModalProps) {
  const [text, setText] = useState(tweetToEdit ? tweetToEdit.content : "");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(tweetToEdit?.media || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showTagMenu, setShowTagMenu] = useState(false);
  const trendingTags = ["design", "nextjs", "breezy", "frontend", "ui"];
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const maxLength = 280;
  const charsLeft = maxLength - text.length;
  const canPublish = (text.trim().length > 0 || selectedFile || previewUrl) && charsLeft >= 0 && !isPublishing;

  useEffect(() => {
    getCurrentUserProfile().then(setCurrentUser);

    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        // Optionnel : fermer le picker
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
      return currentText.substring(0, startPos) + emoji + currentText.substring(endPos, currentText.length);
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
        let finalMediaUrl = tweetToEdit ? tweetToEdit.media : null;

        if (selectedFile) {
          const uploadResult = await uploadMediaApi(selectedFile);
          finalMediaUrl = uploadResult.url; 
        } else if (!previewUrl) {
          finalMediaUrl = null;
        }

        if (tweetToEdit) {
          await updateTweetApi(tweetToEdit.id, text, finalMediaUrl);
        } else {
          await createTweetApi(text, finalMediaUrl);
        }
        
        onClose();
        window.location.reload();
      } catch (err) {
        console.error("Failed to publish or update post:", err);
      } finally {
        setIsPublishing(false);
      }
    };

  const addTagToText = (tag: string) => {
      setText((prev) => {
        const prefix = prev.length === 0 || prev.endsWith(" ") ? "" : " ";
        return prev + prefix + `#${tag} `;
      });
      setShowTagMenu(false);
      textareaRef.current?.focus();
    };

  return (
    <>
      <div 
        className="absolute inset-0 bg-[#080E1C]/50 backdrop-blur-[6px] z-50 transition-opacity duration-300" 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[420px] bg-white rounded-[24px] shadow-2xl z-[60] flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-breezy-border-light"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        
        {/* EN-TÊTE MODALE */}
        <div className="relative flex justify-between items-center px-4 py-3 border-b border-breezy-border-light h-14 bg-white shrink-0 rounded-t-[24px]">
          <button 
            type="button" 
            onClick={onClose} 
            aria-label="Fermer la fenêtre" 
            title="Fermer la fenêtre" 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-breezy-dark cursor-pointer border-none bg-transparent"
          >
            <X size={20} aria-hidden="true" />
          </button>
          
          <span id="modal-title" className="absolute left-1/2 -translate-x-1/2 font-extrabold text-[16px] text-breezy-dark">
            {tweetToEdit ? "Modifier le post" : "Nouveau post"}
          </span>
          <div className="w-8" />
        </div>

        {/* CORPS MODALE */}
        <div className="p-4 flex gap-3 bg-white min-h-[140px] flex-col">
          <div className="flex gap-3 w-full">
            
            {/* AVATAR DYNAMIQUE */}
            {currentUser?.avatar_url ? (
              <div className="w-[40px] h-[40px] shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src={currentUser.avatar_url} alt={`Avatar de ${currentUser.username}`} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-[40px] h-[40px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[15px] overflow-hidden">
                {currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : ""}
              </div>
            )}
            
            <div className="relative flex-1 min-h-[100px]">
              {/* BACKDROP POUR COULEUR DES TAGS */}
              <div className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-[15.5px] pt-1.5 font-sans leading-normal" aria-hidden="true">
                {!text && <span className="text-breezy-dark/40">Quoi de neuf ?</span>}
                {text.split(/(#[a-zA-Z0-9_À-ÿ]+)/g).map((part, i) =>
                  part.startsWith('#') ? (
                    <span key={i} className="text-breezy-blue">{part}</span>
                  ) : (
                    <span key={i} className="text-breezy-dark">{part}</span>
                  )
                )}
              </div>

              {/* VRAI TEXTAREA - Ajout des attributs d'accessibilité manquants */}
              <textarea 
                ref={textareaRef} 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                disabled={isPublishing} 
                spellCheck={false}
                aria-label="Contenu du post"
                title="Contenu du post"
                placeholder="Quoi de neuf ?"
                className="absolute inset-0 w-full h-full resize-none outline-none text-[15.5px] bg-transparent pt-1.5 font-sans leading-normal m-0 p-0 border-none z-10 text-transparent caret-[#16212E]"
              />
            </div>
          </div>

          {/* APERÇU IMAGE */}
          {previewUrl && (
            <div className="relative w-full max-w-[300px] mt-1 ml-[52px]">
              <button 
                type="button" 
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} 
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 cursor-pointer hover:bg-black transition-colors border-none" 
                title="Supprimer l'image" 
                aria-label="Supprimer l'image"
              >
                <X size={16} aria-hidden="true" />
              </button>
              <img src={previewUrl} alt="Aperçu du média à publier" className="rounded-2xl w-full h-auto object-cover border border-gray-200" />
            </div>
          )}
        </div>

        {/* PIED DE MODALE (OUTILS) */}
        <div className={`flex justify-between items-center px-4 py-3 border-t border-breezy-border-light bg-white shrink-0 ${!showPicker ? "rounded-b-[24px]" : ""}`}>
          <div className="flex items-center gap-2 text-breezy-blue relative">
            
            {/* INPUT FICHIER - Ajout des attributs d'accessibilité */}
            <input 
              type="file" 
              accept="image/*,video/*" 
              className="hidden" 
              ref={fileInputRef} 
              aria-label="Sélectionner un fichier média" 
              title="Sélectionner un fichier média" 
              onChange={(e) => { 
                const file = e.target.files?.[0]; 
                if (file) { 
                  setSelectedFile(file); 
                  setPreviewUrl(URL.createObjectURL(file)); 
                } 
                e.target.value = ''; 
              }} 
            />
            
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              aria-label="Ajouter une image" 
              title="Ajouter une image" 
              className="hover:bg-blue-50 p-2 rounded-full transition cursor-pointer border-none bg-transparent flex"
            >
              <Image size={18} aria-hidden="true" />
            </button>

            <div className="relative">
              <button 
                type="button" 
                onClick={() => setShowTagMenu(!showTagMenu)} 
                aria-label="Ajouter un tag" 
                title="Ajouter un tag" 
                className={`p-2 rounded-full transition cursor-pointer border-none flex ${showTagMenu ? "bg-blue-50 text-breezy-darkBlue" : "bg-transparent hover:bg-blue-50"}`}
              >
                <Tag size={18} aria-hidden="true" />
              </button>

              {showTagMenu && (
                <div className="absolute bottom-[calc(100%+8px)] left-0 w-[160px] bg-white border border-breezy-border-light rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-[70] animate-in fade-in zoom-in-95 duration-100 flex flex-col py-1">
                  <span className="text-[11px] font-extrabold text-breezy-gray px-3 py-1.5 uppercase tracking-wider">Tendances</span>
                  {trendingTags.map((tag) => (
                    <button 
                      key={tag} 
                      type="button" 
                      onClick={() => addTagToText(tag)} 
                      aria-label={`Ajouter le tag ${tag}`}
                      title={`Ajouter le tag ${tag}`}
                      className="text-left px-3 py-2 hover:bg-blue-50 text-[14px] font-semibold text-breezy-dark transition-colors cursor-pointer border-none bg-transparent"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              type="button" 
              onClick={() => setShowPicker(!showPicker)} 
              aria-label="Ajouter un emoji" 
              title="Ajouter un emoji" 
              className={`p-2 rounded-full transition cursor-pointer border-none flex ${showPicker ? "bg-blue-50 text-breezy-darkBlue" : "bg-transparent hover:bg-blue-50"}`}
            >
              <Smile size={18} aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <span 
              className={`text-[12.5px] font-medium ${charsLeft < 0 ? "text-red-500 font-bold" : "text-breezy-gray"}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {charsLeft}
            </span>
            <button 
              type="button" 
              onClick={handlePublish} 
              disabled={!canPublish} 
              aria-label={tweetToEdit ? "Enregistrer les modifications" : "Publier le post"}
              title={tweetToEdit ? "Enregistrer les modifications" : "Publier le post"}
              className="px-4 py-1.5 bg-breezy-blue hover:bg-breezy-darkBlue disabled:opacity-40 disabled:hover:bg-breezy-blue text-white font-bold text-[13px] rounded-full transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed border-none"
            >
              {isPublishing ? (tweetToEdit ? "Modification..." : "Publication...") : (tweetToEdit ? "Modifier" : "Publier")}
            </button>
          </div>
        </div>

        {/* EMOJI PICKER */}
        {showPicker && (
          <div 
            ref={pickerRef} 
            className="w-full border-t border-breezy-border-light bg-gray-50 animate-in slide-in-from-bottom duration-200 rounded-b-[24px] overflow-hidden"
          >
            <EmojiPicker 
              onEmojiClick={handleEmojiClick} 
              autoFocusSearch={false} 
              theme={Theme.LIGHT} 
              width="100%" 
              height={350} 
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