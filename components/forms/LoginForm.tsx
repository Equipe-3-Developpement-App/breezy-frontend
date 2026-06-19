"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "./FormField";
import { useRouter } from "next/navigation"; // Hook imported for programmatic routing
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
  const router = useRouter(); // Initializing the router instance
  const [serverError, setServerError] = React.useState<string | null>(null);

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
      // Authentifie l'utilisateur et stocke les tokens (cf. utils/auth.ts).
      await loginApi(data.email, data.password);
      router.push("/feed");
    } catch (error) {
      setServerError(getErrorMessage(error, "Identifiants invalides"));
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
          <p className="text-[14px] text-red-500 text-center w-full" role="alert">
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