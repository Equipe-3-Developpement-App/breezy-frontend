import React, { Suspense } from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { SearchContainer } from "@/components/SearchContainer";

export default function SearchPage() {
  return (
    <PhoneFrame>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-breezy-gray">Chargement...</div>}>
        <SearchContainer />
      </Suspense>
    </PhoneFrame>
  );
}