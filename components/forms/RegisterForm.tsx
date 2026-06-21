"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "./FormField";
import { useRouter } from "next/navigation";
import { registerApi, getErrorMessage } from "@/utils/api";

const registerSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Le nom d'utilisateur est obligatoire" })
    .min(3, { message: "Le nom d'utilisateur doit contenir au moins 3 caractères" }),
  email: z
    .string()
    .min(1, { message: "Le courriel est obligatoire" })
    .email({ message: "Le format du courriel n'est pas valide" }),
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
});

type RegisterInput = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    try {
      await registerApi(data.username, data.email, data.password);
      router.push("/feed");
    } catch (error) {
      setServerError(getErrorMessage(error, "La création du compte a échoué"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full h-full justify-between flex-1">
      <div className="flex flex-col gap-[30px] w-full">
        <FormField
          id="username"
          label="Nom d'utilisateur"
          type="text"
          placeholder="Username"
          error={errors.username?.message}
          {...register("username")}
        />

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

      <div className="flex flex-col gap-3 w-full items-center mt-6">
        {serverError && (
          <p className="text-[14px] text-red-500 text-center w-full" role="alert">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-[47.19px] bg-[#2A6FDB] hover:bg-[#1e52a4] text-white font-bold text-[16px] rounded-full flex items-center justify-center cursor-pointer active:scale-98 transition-all select-none border-none disabled:opacity-50"
        >
          {isSubmitting ? "Création..." : "Créer un compte"}
        </button>

        <div className="pt-[22px] flex justify-center items-center w-full">
          <p className="text-[14px] text-[#5C708A] tracking-normal leading-[17px]">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-[#2A6FDB] font-bold hover:underline cursor-pointer select-none">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}