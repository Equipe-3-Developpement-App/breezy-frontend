import React from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { ProfileContainer } from "@/components/ProfileContainer";

export default async function OtherProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  return (
    <PhoneFrame>
      <ProfileContainer targetUserId={id} />
    </PhoneFrame>
  );
}