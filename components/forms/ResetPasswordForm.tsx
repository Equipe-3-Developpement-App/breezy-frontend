"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import { resetPasswordApi, getErrorMessage } from "@/utils/api";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    try {
      await resetPasswordApi(token, data.password);
      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (error) {
      setServerError(getErrorMessage(error, "Le lien est invalide ou a expiré"));
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center text-center gap-4 w-full flex-1 justify-center">
        <CheckCircle size={48} className="text-green-600" strokeWidth={2} />
        <h2 className="text-[20px] font-extrabold text-[#16212E]">Mot de passe mis à jour</h2>
        <p className="text-[14px] text-[#5C708A] leading-[20px]">
          Tu vas être redirigé vers la page de connexion...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full h-full justify-between flex-1">
      <div className="flex flex-col items-start gap-[30px] w-full flex-1">
        <FormField
          id="password"
          label="Nouveau mot de passe"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>

      <footer className="flex flex-col items-center gap-3 w-full">
        {serverError && (
          <p className="text-[13.5px] text-red-500 text-center w-full font-semibold px-2 leading-tight" role="alert">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex justify-center items-center w-full h-[47.19px] bg-breezy-blue hover:bg-breezy-darkBlue text-white font-bold text-[16px] rounded-full tracking-[-0.16px] transition-all active:scale-[0.98] cursor-pointer border-none disabled:opacity-50"
        >
          {isSubmitting ? "Mise à jour..." : "Réinitialiser le mot de passe"}
        </button>

        <Link href="/login" className="text-[13px] text-breezy-gray font-semibold hover:underline">
          Retour à la connexion
        </Link>
      </footer>
    </form>
  );
}
