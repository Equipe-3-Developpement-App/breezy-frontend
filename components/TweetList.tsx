"use client";

import React, { useState, useEffect } from "react";
import { TweetCard } from "./TweetCard";
import { getTweets } from "../utils/api";

export function TweetList() {
  // State for loaded tweets and loading status
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tweets from the API when the component mounts
    const fetchTweets = async () => {
      try {
        const data = await getTweets();
        setTweets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTweets();
  }, []);

  if (loading) {
    return <div className="text-center p-4 text-[#5C708A]">Chargement des tweets...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {tweets.map((tweet) => (
        <TweetCard 
          key={tweet.id}
          name={tweet.name}
          handle={tweet.handle}
          time={tweet.time}
          avatar={tweet.avatar}
          text={tweet.text}
          commentCount={tweet.commentCount}
          retweetCount={tweet.retweetCount}
          likeCount={tweet.likeCount}
          isLiked={tweet.isLiked}
          isRetweeted={tweet.isRetweeted}
        />
      ))}
    </div>
  );
}