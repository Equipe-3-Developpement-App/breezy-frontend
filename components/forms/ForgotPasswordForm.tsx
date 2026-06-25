"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "./FormField";
import { forgotPasswordApi, getErrorMessage } from "@/utils/api";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Le courriel est obligatoire" })
    .email({ message: "Le format du courriel n'est pas valide" })
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({ onClose }: { onClose: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    try {
      await forgotPasswordApi(data.email);
      setSent(true);
    } catch (error) {
      setServerError(getErrorMessage(error, "Une erreur est survenue"));
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <Mail size={40} className="text-breezy-blue" strokeWidth={2} />
        <p className="text-[15px] font-bold text-[#16212E]">Vérifie ta boîte mail</p>
        <p className="text-[13px] text-breezy-gray leading-[19px]">
          Si un compte existe avec cette adresse, un email contenant un lien de réinitialisation vient d'être envoyé.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full h-[44px] bg-breezy-blue hover:bg-breezy-darkBlue text-white font-bold text-[15px] rounded-full flex items-center justify-center cursor-pointer active:scale-98 transition-all select-none border-none"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-[13px] text-breezy-gray leading-[19px]">
        Indique ton adresse email, on t'enverra un lien pour réinitialiser ton mot de passe.
      </p>

      <FormField
        id="forgot-email"
        label="Courriel"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      {serverError && (
        <p className="text-[13px] text-red-500 text-center w-full font-semibold" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full h-[44px] bg-breezy-blue hover:bg-breezy-darkBlue text-white font-bold text-[15px] rounded-full flex items-center justify-center cursor-pointer active:scale-98 transition-all select-none border-none disabled:opacity-50"
      >
        {isSubmitting ? "Envoi..." : "Envoyer le lien"}
      </button>
    </form>
  );
}
