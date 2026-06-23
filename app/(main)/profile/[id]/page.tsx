"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { ProfileContainer } from "@/components/ProfileContainer";

export default function OtherProfilePage() {
  const params = useParams();
  const targetId = params.id as string;

  return (
    <PhoneFrame>
      <ProfileContainer targetUserId={targetId} />
    </PhoneFrame>
  );
}