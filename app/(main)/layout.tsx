"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCurrentUser } from "@/utils/api";
import { RefreshCw } from "lucide-react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // On demande à l'API si le cookie/token actuel est valide
      const user = await fetchCurrentUser();
      
      if (!user) {
        // Si null, l'utilisateur n'est pas connecté ou son token a expiré : on l'éjecte !
        router.replace("/login");
      } else {
        // Sinon, on lui ouvre les portes
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [router]);

  // Tant qu'on n'est pas sûr de son identité, on affiche un écran de chargement global
  if (!isAuthorized) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex flex-col items-center justify-center w-full h-full bg-breezy-bgLight gap-3">
          <RefreshCw className="animate-spin text-breezy-blue" size={28} />
          <span className="text-breezy-gray text-[14.5px] font-medium">Vérification de l'accès...</span>
        </div>
      </PhoneFrame>
    );
  }

  // S'il est autorisé, on affiche la page qu'il a demandée (Feed, Search ou Profile)
  return <>{children}</>;
}