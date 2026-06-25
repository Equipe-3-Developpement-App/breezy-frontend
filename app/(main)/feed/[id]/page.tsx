import React from "react";
import { FeedDetailContainer } from "@/components/FeedDetailContainer";

export default async function CommentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reply?: string }>;
}) {
  const { id } = await params;
  const { reply } = await searchParams;

  return (
    <FeedDetailContainer 
      tweetId={id} 
      shouldAutoReply={reply === "true"} 
    />
  );
}