"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "./FormField";
import { useRouter } from "next/navigation";
import { loginApi, getErrorMessage } from "@/utils/api";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Le courriel est obligatoire" })
    .email({ message: "Le format du courriel n'est pas valide" }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      await loginApi(data.email, data.password);
      router.push("/feed");
    } catch (error: any) {
      const rawMessage = getErrorMessage(error, "Identifiants invalides");
      
      // PARSING DU TIMER ILLISIBLE : Si le message contient une date ISO de suspension
      if (rawMessage.includes("Ce compte est suspendu jusqu'au")) {
        try {
          const isoDateMatch = rawMessage.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z/);
          if (isoDateMatch) {
            const dateObj = new Date(isoDateMatch[0]);
            const formattedDate = dateObj.toLocaleString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
            setServerError(`Ce compte est suspendu jusqu'au ${formattedDate}`);
            return;
          }
        } catch (e) {
          console.error("Format date parsing error", e);
        }
      }
      
      setServerError(rawMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full h-full justify-between flex-1">
      <div className="flex flex-col items-start gap-[30px] w-full flex-1">
        <FormField
          id="email"
          label="Courriel"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <FormField
          id="password"
          label="Mot de passe"
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
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </button>

        <div className="pt-[22px] flex flex-col items-center">
          <p className="text-[14px] text-breezy-gray leading-[17px]">
            Pas de compte ?{" "}
            <Link href="/register" className="text-breezy-blue font-bold hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </footer>
    </form>
  );
}