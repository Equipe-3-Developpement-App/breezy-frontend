"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCurrentUser } from "@/utils/api";
import { RefreshCw } from "lucide-react";
import { PhoneFrame } from "./PhoneFrame";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await fetchCurrentUser();
      if (!user) {
        router.replace("/login");
      } else {
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, [router]);

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

  return <>{children}</>;
}