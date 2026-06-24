"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { verifyEmailApi, getErrorMessage } from "@/utils/api";

export function VerifyEmailStatus({ token }: { token?: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState<string>("Lien de vérification invalide.");

  useEffect(() => {
    if (!token) return;
    verifyEmailApi(token)
      .then((msg) => {
        setMessage(msg);
        setStatus("success");
      })
      .catch((error) => {
        setMessage(getErrorMessage(error, "Lien de vérification invalide ou expiré."));
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="flex flex-col items-center text-center gap-4 w-full flex-1 justify-center">
      {status === "loading" && <Loader2 size={48} className="text-breezy-blue animate-spin" />}
      {status === "success" && <CheckCircle size={48} className="text-green-600" strokeWidth={2} />}
      {status === "error" && <XCircle size={48} className="text-red-500" strokeWidth={2} />}

      <h2 className="text-[20px] font-extrabold text-[#16212E]">
        {status === "loading" && "Vérification en cours..."}
        {status === "success" && "Email vérifié !"}
        {status === "error" && "Vérification impossible"}
      </h2>

      <p className="text-[14px] text-[#5C708A] leading-[20px]">{message}</p>

      {status !== "loading" && (
        <Link
          href="/login"
          className="mt-2 w-full h-[47.19px] bg-breezy-blue hover:bg-breezy-darkBlue text-white font-bold text-[16px] rounded-full flex items-center justify-center cursor-pointer active:scale-98 transition-all select-none"
        >
          Aller à la connexion
        </Link>
      )}
    </div>
  );
}
