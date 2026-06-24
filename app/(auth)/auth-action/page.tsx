import React from "react";
import Link from "next/link";
import { Wind } from "lucide-react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { VerifyEmailStatus } from "@/components/forms/VerifyEmailStatus";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

// Page unique pour les liens reçus par email (vérification + réinitialisation),
// qui doivent rester accessibles directement par URL et ne peuvent donc pas être des popups.
export default async function AuthActionPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string; token?: string }>;
}) {
  const { type, token } = await searchParams;

  return (
    <PhoneFrame bgWhite={true}>
      <header className="flex flex-col items-start gap-6 w-full mb-[60px]">
        <div className="flex items-center gap-[15px] w-full">
          <div className="w-[34px] h-[34px] text-[#2A6FDB]">
            <Wind size={34} strokeWidth={2.5} />
          </div>
          <h1 className="text-[28px] font-extrabold text-[#16212E] tracking-[-0.9px] leading-[34px]">
            Breezy
          </h1>
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
