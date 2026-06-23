import React from "react";
import { MessageCircle, Heart, Trash2, Pencil } from "lucide-react";
import { Tweet } from "@/types";
import Link from "next/link";

interface TweetCardProps {
  tweet: Tweet;
  onLike: (tweetId: string) => void;
  onFollow: (userId: string) => void;
  onDelete?: (tweetId: string) => void;
  onEdit?: (tweet: Tweet) => void;
  isOwnTweet?: boolean;
}

export function TweetCard({ tweet, onLike, onFollow, onDelete, onEdit, isOwnTweet = false }: TweetCardProps) {
  const displayLikeCount = tweet.likeCount;

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

      <Link 
        href={`/profile/${tweet.user.id}`} 
        onClick={(e) => e.stopPropagation()} 
        className="shrink-0 hover:opacity-80 transition-opacity no-underline outline-none focus-visible:ring-2 focus-visible:ring-breezy-blue rounded-full h-max"
        aria-label={`Aller sur le profil de ${tweet.user.username}`}
        title={`Aller sur le profil de ${tweet.user.username}`}
      >
        {tweet.user.avatarUrl ? (
          <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center overflow-hidden bg-white">
            <img src={tweet.user.avatarUrl} alt={`Avatar`} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[16.8px] overflow-hidden">
            {tweet.user.username.substring(0, 2).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-2.5 ml-3 w-full">

        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link 
              href={`/profile/${tweet.user.id}`} 
              onClick={(e) => e.stopPropagation()} 
              className="font-bold text-[14.5px] text-breezy-dark no-underline hover:underline outline-none focus-visible:ring-2 focus-visible:ring-breezy-blue rounded-sm"
              aria-label={`Aller sur le profil de ${tweet.user.username}`}
              title={`Aller sur le profil de ${tweet.user.username}`}
            >
              @{tweet.user.username}
            </Link>
            <span className="text-[14px] text-breezy-gray">·</span>
            <span className="text-[13px] text-breezy-gray">{tweet.createdAt}</span>
            {tweet.isEdited && (
              <span className="text-[12px] text-breezy-gray font-medium italic">(modifié)</span>
            )}
          </div>

          {!isOwnTweet && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFollow(tweet.user.id); }}
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

        {tweet.tags && tweet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tweet.tags.map((tag) => (
              <Link 
                key={tag} 
                href={`/search?tag=${encodeURIComponent(tag)}`} 
                className="text-breezy-blue text-[12.5px] font-semibold hover:underline bg-blue-50 px-2 py-0.5 rounded-full" 
                onClick={(e) => e.stopPropagation()}
                aria-label={`Rechercher le tag ${tag}`}
                title={`Rechercher le tag ${tag}`}
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

        <div className="flex items-center gap-8 text-breezy-gray text-[13px] font-medium mt-1 w-full">

          <Link 
            href={`/feed/${tweet.id}`} 
            className="flex items-center gap-1.5 cursor-pointer hover:text-blue-500 group transition text-inherit no-underline"
            aria-label="Voir la conversation"
            title="Voir la conversation"
          >
            <MessageCircle size={17} strokeWidth={2} className="group-hover:scale-110 transition" />
            <span>{tweet.commentCount}</span>
          </Link>

          <button 
            type="button" 
            onClick={() => onLike(tweet.id)} 
            aria-label={tweet.isLiked ? "Ne plus aimer" : "Aimer"}
            title={tweet.isLiked ? "Ne plus aimer" : "Aimer"}
            className={`flex items-center gap-1.5 cursor-pointer hover:text-red-500 group transition bg-transparent border-none p-0 ${tweet.isLiked ? "text-red-500" : ""}`}
          >
            <Heart size={17} strokeWidth={2} className={`group-hover:scale-110 transition ${tweet.isLiked ? "fill-red-500 text-red-500" : ""}`} />
            <span className={tweet.isLiked ? "font-bold" : ""}>{displayLikeCount}</span>
          </button>

          {isOwnTweet && (
            <div className="flex items-center gap-4 ml-auto">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(tweet)}
                  aria-label="Modifier le message" 
                  title="Modifier le message"
                  className="cursor-pointer text-breezy-gray hover:text-breezy-blue transition bg-transparent border-none p-0 flex items-center justify-center"
                >
                  <Pencil size={17} strokeWidth={2} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete && onDelete(tweet.id)}
                aria-label="Supprimer le message" 
                title="Supprimer le message"
                className="cursor-pointer text-breezy-gray hover:text-red-500 transition bg-transparent border-none p-0 flex items-center justify-center"
              >
                <Trash2 size={17} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}