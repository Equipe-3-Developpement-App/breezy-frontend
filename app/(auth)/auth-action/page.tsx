import React from "react";
import Link from "next/link";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { VerifyEmailStatus } from "@/components/forms/VerifyEmailStatus";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

// Page unique pour les liens reçus par email (vérification + réinitialisation)
export default async function AuthActionPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string; token?: string }>;
}) {
  const { type, token } = await searchParams;

  return (
    <PhoneFrame bgWhite={true}>
      <header className="flex flex-col items-start gap-6 w-full mb-[60px]">
        <div className="flex items-baseline text-[#16212E]">
          <span className="font-extrabold text-[28px] tracking-tight leading-none">Breez</span>
          <img 
            src="/breezy-icon.png" 
            alt="y" 
            className="w-auto h-[30px] object-contain -ml-[1px] translate-y-[3px]" 
          />
        </div>
      </header>

      {type === "reset" && token && <ResetPasswordForm token={token} />}

      {type === "verify" && <VerifyEmailStatus token={token} />}

      {type !== "reset" && type !== "verify" && (
        <div className="flex flex-col items-center text-center gap-4 w-full flex-1 justify-center">
          <p className="text-[14px] text-red-500 font-semibold">Lien invalide.</p>
          <Link href="/login" className="text-breezy-blue font-bold hover:underline">
            Retour à la connexion
          </Link>
        </div>
      )}
    </PhoneFrame>
  );
}