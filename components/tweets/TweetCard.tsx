import React from "react";
import { MessageCircle, Repeat2, Heart, Share, Trash2 } from "lucide-react";
import { Tweet } from "@/types";

interface TweetCardProps {
  tweet: Tweet;
  onLike: (tweetId: string) => void;
  onRetweet: (tweetId: string) => void;
  onFollow: (userId: string) => void;
  onDelete?: (tweetId: string) => void;
}

export function TweetCard({ tweet, onLike, onRetweet, onFollow, onDelete }: TweetCardProps) {
  const displayLikeCount = tweet.likeCount;
  const displayRetweetCount = tweet.retweetCount;
  
  // Guard check to isolate the current session identity
  const isOwnTweet = tweet.user.displayName === "Camille Roy";

  return (
    <div className="flex p-4 bg-breezy-bgLight border-b border-breezy-border-light w-full text-left">

      <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[16.8px]">
        {tweet.user.avatarUrl || tweet.user.displayName.substring(0, 2).toUpperCase()}
      </div>

      <div className="flex flex-col gap-2.5 ml-3 w-full">

        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[14.5px] text-breezy-dark">{tweet.user.displayName}</span>
            <span className="text-[13px] text-breezy-gray">@{tweet.user.username}</span>
            <span className="text-[14px] text-breezy-gray">·</span>
            <span className="text-[13px] text-breezy-gray">{tweet.createdAt}</span>
          </div>

          {/* Conditional follow button mapping switch: hidden if it's our own profile */}
          {!isOwnTweet && (
            <button
              type="button"
              onClick={() => onFollow(tweet.user.id)}
              className={`px-3 py-1 text-[13px] font-bold rounded-full transition-all duration-200 ease-in-out shrink-0 cursor-pointer active:scale-95 border select-none
                ${tweet.isFollowing
                  ? "bg-breezy-blue border-breezy-blue text-white hover:bg-breezy-darkBlue hover:border-breezy-darkBlue"
                  : "bg-transparent border-breezy-blue text-breezy-blue hover:bg-breezy-blue/10"}`}
            >
              {tweet.isFollowing ? "Suivi" : "Suivre"}
            </button>
          )}
        </div>

        <p className="text-[14.5px] text-breezy-dark leading-[22px] whitespace-pre-line">
          {tweet.content}
        </p>

        <div className="flex justify-between items-center text-breezy-gray text-[13px] font-medium max-w-[280px] mt-1 w-full">
          
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-blue-500 group transition">
            <MessageCircle size={17} strokeWidth={2} className="group-hover:scale-110 transition" />
            <span>0</span>
          </div>

          <button
            type="button"
            onClick={() => onRetweet(tweet.id)}
            className={`flex items-center gap-1.5 cursor-pointer hover:text-green-500 group transition bg-transparent border-none p-0 ${tweet.isRetweeted ? "text-green-500" : ""}`}
          >
            <Repeat2 size={17} strokeWidth={tweet.isRetweeted ? 2.5 : 2} className="group-hover:scale-110 transition" />
            <span className={tweet.isRetweeted ? "font-bold" : ""}>{displayRetweetCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onLike(tweet.id)}
            className={`flex items-center gap-1.5 cursor-pointer hover:text-red-500 group transition bg-transparent border-none p-0 ${tweet.isLiked ? "text-red-500" : ""}`}
          >
            <Heart
              size={17}
              strokeWidth={2}
              className={`group-hover:scale-110 transition ${tweet.isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
            <span className={tweet.isLiked ? "font-bold" : ""}>{displayLikeCount}</span>
          </button>

          <div className="cursor-pointer hover:text-blue-500 transition hover:scale-110">
            <Share size={17} strokeWidth={2} />
          </div>

          {isOwnTweet && (
            <button
              type="button"
              onClick={() => onDelete && onDelete(tweet.id)}
              aria-label="Supprimer le message"
              className="cursor-pointer text-breezy-gray hover:text-red-500 transition bg-transparent border-none p-0 flex items-center justify-center"
            >
              <Trash2 size={17} strokeWidth={2} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}