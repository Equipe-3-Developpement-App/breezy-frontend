import React from "react";
import { MessageCircle, Repeat2, Heart, Share, Trash2 } from "lucide-react";
import { Tweet } from "@/types";
import Link from "next/link";

interface TweetCardProps {
  tweet: Tweet;
  onLike: (tweetId: string) => void;
  onRetweet: (tweetId: string) => void;
  onFollow: (userId: string) => void;
  onDelete?: (tweetId: string) => void;
  isOwnTweet?: boolean; // NOUVEAU : Permet au parent de signaler si c'est notre post
}

// On récupère la prop isOwnTweet (par défaut à false)
export function TweetCard({ tweet, onLike, onRetweet, onFollow, onDelete, isOwnTweet = false }: TweetCardProps) {
  const displayLikeCount = tweet.likeCount;
  const displayRetweetCount = tweet.retweetCount;

  const renderContentWithHashtags = (text: string) => {
    return text.split(/(#[a-zA-Z0-9_À-ÿ]+)/g).map((part, index) => {
      if (part.startsWith("#")) {
        return <span key={index} className="text-breezy-blue">{part}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex p-4 bg-breezy-bgLight border-b border-breezy-border-light w-full text-left">

      {/* CORRECTION DE L'AVATAR : Ajout de overflow-hidden et de la balise <img> */}
      {tweet.user.avatarUrl ? (
        <div className="w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center overflow-hidden bg-white">
          <img src={tweet.user.avatarUrl} alt={`Avatar de ${tweet.user.username}`} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[16.8px] overflow-hidden">
          {tweet.user.username.substring(0, 2).toUpperCase()}
        </div>
      )}

      <div className="flex flex-col gap-2.5 ml-3 w-full">

        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[14.5px] text-breezy-dark">@{tweet.user.username}</span>
            <span className="text-[14px] text-breezy-gray">·</span>
            <span className="text-[13px] text-breezy-gray">{tweet.createdAt}</span>
          </div>

          {!isOwnTweet && (
            <button
              type="button"
              onClick={() => onFollow(tweet.user.id)}
              aria-label={tweet.isFollowing ? "Se désabonner" : "Suivre"}
              title={tweet.isFollowing ? "Se désabonner" : "Suivre"}
              className={`px-3 py-1 text-[13px] font-bold rounded-full transition-all duration-200 ease-in-out shrink-0 cursor-pointer active:scale-95 border select-none
                ${tweet.isFollowing
                  ? "bg-breezy-blue border-breezy-blue text-white hover:bg-breezy-darkBlue hover:border-breezy-darkBlue"
                  : "bg-transparent border-breezy-blue text-breezy-blue hover:bg-breezy-blue/10"}`}
            >
              {tweet.isFollowing ? "Suivi" : "Suivre"}
            </button>
          )}
        </div>

        <p className="text-[14.5px] text-breezy-dark leading-[22px] whitespace-pre-wrap break-words">
          {renderContentWithHashtags(tweet.content)}
        </p>

        {/* Tags Fx12 — badges cliquables issus du backend */}
        {tweet.tags && tweet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tweet.tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?tag=${encodeURIComponent(tag)}`}
                className="text-breezy-blue text-[12.5px] font-semibold hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {tweet.media && (
          <div className="mt-2.5 rounded-2xl overflow-hidden border border-breezy-border-light max-h-[350px] bg-black">
            <img src={tweet.media} alt="Média joint" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex justify-between items-center text-breezy-gray text-[13px] font-medium max-w-[280px] mt-1 w-full">

          <Link
            href={`/feed/${tweet.id}`}
            className="flex items-center gap-1.5 cursor-pointer hover:text-blue-500 group transition text-inherit no-underline"
            aria-label="Voir la conversation"
            title="Voir la conversation"
          >
            <MessageCircle size={17} strokeWidth={2} className="group-hover:scale-110 transition" />
            <span>{(tweet as any).commentCount || 0}</span>
          </Link>

          <button
            type="button"
            onClick={() => onRetweet(tweet.id)}
            aria-label="Retweeter"
            title="Retweeter"
            className={`flex items-center gap-1.5 cursor-pointer hover:text-green-500 group transition bg-transparent border-none p-0 ${tweet.isRetweeted ? "text-green-500" : ""}`}
          >
            <Repeat2 size={17} strokeWidth={tweet.isRetweeted ? 2.5 : 2} className="group-hover:scale-110 transition" />
            <span className={tweet.isRetweeted ? "font-bold" : ""}>{displayRetweetCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onLike(tweet.id)}
            aria-label="Aimer"
            title="Aimer"
            className={`flex items-center gap-1.5 cursor-pointer hover:text-red-500 group transition bg-transparent border-none p-0 ${tweet.isLiked ? "text-red-500" : ""}`}
          >
            <Heart
              size={17}
              strokeWidth={2}
              className={`group-hover:scale-110 transition ${tweet.isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
            <span className={tweet.isLiked ? "font-bold" : ""}>{displayLikeCount}</span>
          </button>

          <div className="cursor-pointer hover:text-blue-500 transition hover:scale-110" aria-label="Partager" title="Partager">
            <Share size={17} strokeWidth={2} />
          </div>

          {/* Apparition dynamique de la corbeille si c'est notre post */}
          {isOwnTweet && (
            <button
              type="button"
              onClick={() => onDelete && onDelete(tweet.id)}
              aria-label="Supprimer le message"
              title="Supprimer le message"
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