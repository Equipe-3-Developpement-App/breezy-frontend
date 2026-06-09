import React, { useState } from "react";
import { MessageCircle, Repeat2, Heart, Share } from "lucide-react";

interface TweetProps {
    name: string;
    handle: string;
    time: string;
    avatar: string;
    text: string;
    commentCount: number;
    retweetCount: number;
    likeCount: number;
    isLiked?: boolean;
    isRetweeted?: boolean;
}

export function TweetCard({ name, handle, time, text, avatar, commentCount, retweetCount, likeCount, isLiked, isRetweeted }: TweetProps) {
    // 1. Local state for Follow, Like, and Retweet buttons
    const [following, setFollowing] = useState(false);
    const [liked, setLiked] = useState<boolean>(!!isLiked);
    const [retweeted, setRetweeted] = useState<boolean>(!!isRetweeted);

    const toggleLike = () => {
        setLiked((current) => !current);
    };

    const toggleRetweet = () => {
        setRetweeted((current) => !current);
    };

    return (
        // TweetCard -> padding: 16px, background: #EEF4FA, border-bottom: 1px solid #E2EAF2
        <div className="flex p-4 bg-[#EEF4FA] border-b border-[#E2EAF2] w-full text-left">

            {/* Avatar -> width/height: 42px, gradient, rounded-full */}
            <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[16.8px]">
                {avatar}
            </div>

            {/* TweetContent -> flex-direction: column */}
            <div className="flex flex-col gap-2.5 ml-3 w-full">

                {/* TweetHeader -> auto spacing pushes the Follow button to the right */}
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[14.5px] text-[#16212E]">{name}</span>
                        <span className="text-[13px] text-[#5C708A]">{handle}</span>
                        <span className="text-[14px] text-[#5C708A]">·</span>
                        <span className="text-[13px] text-[#5C708A]">{time}</span>
                    </div>

                    {/* 2. Follow button with interactive state */}
                    <button
                        onClick={() => setFollowing(!following)}
                        className={`px-3 py-1 text-[13px] font-bold rounded-full transition-all duration-200 ease-in-out shrink-0 cursor-pointer active:scale-95 border select-none
                                ${following
                                ? "bg-[#2A6FDB] border-[#2A6FDB] text-white hover:bg-[#1e52a4] hover:border-[#1e52a4]"
                                : "bg-transparent border-[#2A6FDB] text-[#2A6FDB] hover:bg-[#2A6FDB]/10"}`}>
                        {following ? "Suivi" : "Suivre"}
                    </button>
                </div>

                {/* tweet-text */}
                <p className="text-[14.5px] text-[#16212E] leading-[22px] whitespace-pre-line">
                    {text}
                </p>

                {/* TweetActions */}
                <div className="flex justify-between items-center text-[#5C708A] text-[13px] font-medium max-w-[280px] mt-1 w-full">
                    {/* Comments */}
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-blue-500 group transition">
                        <MessageCircle size={17} strokeWidth={2} className="group-hover:scale-110 transition" />
                        <span>{commentCount}</span>
                    </div>

                    {/* Retweets */}
                    <button
                        type="button"
                        onClick={toggleRetweet}
                        className={`flex items-center gap-1.5 cursor-pointer hover:text-green-500 group transition ${retweeted ? "text-green-500" : ""}`}
                    >
                        <Repeat2 size={17} strokeWidth={retweeted ? 2.5 : 2} className={`group-hover:scale-110 transition ${retweeted ? "text-green-500" : ""}`} />
                        <span className={retweeted ? "font-bold" : ""}>{retweetCount + (retweeted ? 1 : 0) - (isRetweeted ? 1 : 0)}</span>
                    </button>

                    {/* Likes */}
                    <button
                        type="button"
                        onClick={toggleLike}
                        className={`flex items-center gap-1.5 cursor-pointer hover:text-red-500 group transition ${liked ? "text-red-500" : ""}`}
                    >
                        <Heart
                            size={17}
                            strokeWidth={2}
                            className={`group-hover:scale-110 transition ${liked ? "fill-red-500 text-red-500" : ""}`}
                        />
                        <span className={liked ? "font-bold" : ""}>{likeCount + (liked ? 1 : 0) - (isLiked ? 1 : 0)}</span>
                    </button>

                    {/* Share */}
                    <div className="cursor-pointer hover:text-blue-500 transition hover:scale-110">
                        <Share size={17} strokeWidth={2} />
                    </div>
                </div>

            </div>
        </div>
    );
}