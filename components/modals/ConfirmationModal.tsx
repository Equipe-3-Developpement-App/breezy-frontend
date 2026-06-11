"use client";

import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* 1. Background Overlay (Scrim) limited inside the mobile layout container */}
      <div 
        className="absolute inset-0 bg-[#080E1C]/30 backdrop-blur-[4px] z-[100] animate-in fade-in duration-200"
        onClick={onCancel}
      />
      
      {/* 2. Alert Box Container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] max-w-[300px] bg-white rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-[110] p-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200 border border-breezy-border-light">
        
        <h3 className="font-extrabold text-[17px] text-breezy-dark mb-2 tracking-[-0.3px]">
          {title}
        </h3>
        
        <p className="text-[13.5px] text-breezy-gray leading-[18px] mb-6 px-1">
          {message}
        </p>

        {/* Action Button layout row matching premium mobile OS flat guidelines */}
        <div className="flex flex-col w-full gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full h-[44px] bg-transparent hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-500 font-bold text-[14px] rounded-full cursor-pointer transition-all active:scale-[0.98] tracking-[-0.1px]"
          >
            {confirmLabel}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="w-full h-[44px] bg-transparent text-breezy-gray hover:text-breezy-dark font-bold text-[14px] rounded-full border-none cursor-pointer transition-colors tracking-[-0.1px]"
          >
            {cancelLabel}
          </button>
        </div>

      </div>
    </>
  );
}