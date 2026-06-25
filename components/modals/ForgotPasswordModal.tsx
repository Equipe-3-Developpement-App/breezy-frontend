"use client";

import React from "react";
import { X, KeyRound } from "lucide-react";
import { ForgotPasswordForm } from "../forms/ForgotPasswordForm";

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
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
        aria-labelledby="forgot-password-modal-title"
      >
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

          <span
            id="forgot-password-modal-title"
            className="absolute left-1/2 -translate-x-1/2 font-extrabold text-[16px] text-breezy-dark flex items-center gap-2"
          >
            <KeyRound size={18} className="text-breezy-blue" />
            Mot de passe oublié
          </span>
          <div className="w-8" />
        </div>

        <div className="p-6 flex flex-col bg-white rounded-b-[24px]">
          <ForgotPasswordForm onClose={onClose} />
        </div>
      </div>
    </>
  );
}
