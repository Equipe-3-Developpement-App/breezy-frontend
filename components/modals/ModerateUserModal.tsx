"use client";

import React, { useState } from "react";
import { X, ShieldAlert, CheckCircle, ShieldCheck } from "lucide-react";
import { moderateAccountApi, getErrorMessage } from "@/utils/api";
import { FormField } from "../forms/FormField";

interface ModerateUserModalProps {
  idAuth: string | number;
  username: string;
  onClose: () => void;
}

export function ModerateUserModal({ idAuth, username, onClose }: ModerateUserModalProps) {
  const [action, setAction] = useState<"suspend" | "ban" | "unban">("suspend");
  const [durationDays, setDurationDays] = useState("3");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const days = action === "suspend" ? parseInt(durationDays, 10) : undefined;
      await moderateAccountApi(idAuth, action, days);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err, "Échec de l'application de la sanction"));
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
        aria-labelledby="mod-title"
      >
        <div className="relative flex justify-between items-center px-4 py-3 border-b border-breezy-border-light h-14 bg-white shrink-0 rounded-t-[24px]">
          <button 
            type="button" onClick={onClose} aria-label="Fermer la fenêtre" title="Fermer la fenêtre" 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-breezy-dark cursor-pointer border-none bg-transparent flex"
          >
            <X size={20} aria-hidden="true" />
          </button>
          
          <span id="mod-title" className="absolute left-1/2 -translate-x-1/2 font-extrabold text-[16px] text-breezy-dark flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-500" />
            Modération : @{username}
          </span>
          <div className="w-8" />
        </div>

        <div className="p-6 flex flex-col bg-white rounded-b-[24px]">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-green-600 gap-3">
              <CheckCircle size={48} strokeWidth={2} />
              <p className="font-bold text-[16px]">Opération effectuée !</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-bold text-breezy-dark">Sélectionner l'action</span>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <label className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border text-[13.5px] font-bold cursor-pointer transition-all select-none
                      ${action === "suspend" ? "border-breezy-blue bg-blue-50/50 text-breezy-blue" : "border-breezy-light-gray text-breezy-gray bg-white hover:bg-gray-50"}`}>
                      <input 
                        type="radio" name="mod-action" value="suspend" checked={action === "suspend"} 
                        onChange={() => setAction("suspend")} className="sr-only" 
                      />
                      Suspension Temp.
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border text-[13.5px] font-bold cursor-pointer transition-all select-none
                      ${action === "ban" ? "border-red-500 bg-red-50/50 text-red-500" : "border-breezy-light-gray text-breezy-gray bg-white hover:bg-gray-50"}`}>
                      <input 
                        type="radio" name="mod-action" value="ban" checked={action === "ban"} 
                        onChange={() => setAction("ban")} className="sr-only" 
                      />
                      Bannissement Déf.
                    </label>
                  </div>

                  {/* NOUVELLE OPTION UNBAN REJOIGNANT LA DA */}
                  <label className={`w-full flex items-center justify-center gap-2 h-11 rounded-xl border text-[13.5px] font-bold cursor-pointer transition-all select-none
                    ${action === "unban" ? "border-green-500 bg-green-50/50 text-green-600" : "border-breezy-light-gray text-breezy-gray bg-white hover:bg-gray-50"}`}>
                    <input 
                      type="radio" name="mod-action" value="unban" checked={action === "unban"} 
                      onChange={() => setAction("unban")} className="sr-only" 
                    />
                    <ShieldCheck size={16} />
                    Lever toutes les sanctions (Unban)
                  </label>
                </div>
              </div>

              {action === "suspend" && (
                <FormField
                  id="mod-duration"
                  label="Durée de la suspension (jours)"
                  type="number"
                  min="1"
                  max="365"
                  placeholder="Ex: 3"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  disabled={loading}
                  required
                />
              )}

              {error && (
                <p className="text-[13px] text-red-500 text-center w-full font-semibold" role="alert">
                  {error}
                </p>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                aria-label="Valider la modération"
                title="Valider la modération"
                className={`w-full h-[46px] text-white font-bold text-[15px] rounded-full transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed border-none mt-2
                  ${action === "ban" ? "bg-red-500 hover:bg-red-600" : action === "unban" ? "bg-green-600 hover:bg-green-700" : "bg-breezy-blue hover:bg-breezy-darkBlue"} disabled:opacity-50`}
              >
                {loading ? "Application..." : action === "ban" ? "Bannir définitivement" : action === "unban" ? "Réactiver le compte" : "Suspendre le compte"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}