"use client";

import React, { useState } from "react";
import { X, UserPlus, CheckCircle } from "lucide-react";
import { adminCreateUserApi, getErrorMessage } from "@/utils/api";
import { FormField } from "../forms/FormField";

interface AdminRegisterModalProps {
  onClose: () => void;
}

export function AdminRegisterModal({ onClose }: AdminRegisterModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Tous les champs sont requis.");
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      await adminCreateUserApi(username, email, password);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err, "Échec de la création du compte"));
    } finally {
      setLoading(false);
    }
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
        <div className="relative flex justify-between items-center px-4 py-3 border-b border-breezy-border-light h-14 bg-white shrink-0 rounded-t-[24px]">
          <button 
            type="button" onClick={onClose} aria-label="Fermer la fenêtre" title="Fermer la fenêtre" 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-breezy-dark cursor-pointer border-none bg-transparent"
          >
            <X size={20} aria-hidden="true" />
          </button>
          
          <span id="modal-title" className="absolute left-1/2 -translate-x-1/2 font-extrabold text-[16px] text-breezy-dark flex items-center gap-2">
            <UserPlus size={18} className="text-breezy-blue" />
            Créer un utilisateur
          </span>
          <div className="w-8" />
        </div>

        <div className="p-6 flex flex-col bg-white rounded-b-[24px]">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-green-600 gap-3">
              <CheckCircle size={48} strokeWidth={2} />
              <p className="font-bold text-[16px]">Compte créé avec succès !</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField
                id="admin-username"
                label="Nom d'utilisateur"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              <FormField
                id="admin-email"
                label="Courriel"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <FormField
                id="admin-password"
                label="Mot de passe"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              {error && (
                <p className="text-[14px] text-red-500 text-center w-full mt-2 font-medium" role="alert">
                  {error}
                </p>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                aria-label="Créer le compte utilisateur"
                title="Créer le compte utilisateur"
                className="mt-4 w-full h-[46px] bg-breezy-blue hover:bg-breezy-darkBlue disabled:opacity-50 text-white font-bold text-[15px] rounded-full transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed border-none"
              >
                {loading ? "Création en cours..." : "Créer le compte"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}