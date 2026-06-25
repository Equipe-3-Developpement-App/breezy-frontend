import React from "react";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { FeedContainer } from "@/components/FeedContainer";

export default function Home() {
  return (
    <PhoneFrame>
      <FeedContainer />
    </PhoneFrame>
  );
}