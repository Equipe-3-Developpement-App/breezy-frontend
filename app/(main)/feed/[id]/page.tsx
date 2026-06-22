"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Repeat2, Heart, Share, RefreshCw, Smile } from "lucide-react";
import { getTweetById, createCommentApi, likeTweetApi, retweetTweetApi, getCurrentUserProfile, UserProfile } from "@/utils/api";
import { NavBar } from "@/components/layout/NavBar";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import EmojiPicker, { Theme } from "emoji-picker-react";

export default function CommentPage() {
  const params = useParams();
  const router = useRouter();
  const tweetId = params.id as string;

  const [parentTweet, setParentTweet] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [commentText, setCommentText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadPageData = async () => {
    try {
      const data = await getTweetById(tweetId);
      setParentTweet(data);
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to load conversation pipeline:", err);
    }
  };

  useEffect(() => {
    getCurrentUserProfile().then(setCurrentUser);
    if (tweetId) {
      setLoading(true);
      loadPageData().then(() => setLoading(false));
    }
  }, [tweetId]);

  const handleLike = async (id: string, isParent: boolean, currentLiked: boolean, currentCount: number) => {
    const nextLiked = !currentLiked;
    const nextCount = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    if (isParent) {
      setParentTweet((prev: any) => ({ ...prev, isLiked: nextLiked, likeCount: nextCount }));
    } else {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, isLiked: nextLiked, likeCount: nextCount } : c)));
    }
    await likeTweetApi(id, nextLiked, nextCount);
  };

  const handleRetweet = async (id: string, isParent: boolean, currentRetweeted: boolean, currentCount: number) => {
    const nextRetweeted = !currentRetweeted;
    const nextCount = nextRetweeted ? currentCount + 1 : Math.max(0, currentCount - 1);

    if (isParent) {
      setParentTweet((prev: any) => ({ ...prev, isRetweeted: nextRetweeted, retweetCount: nextCount }));
    } else {
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, isRetweeted: nextRetweeted, retweetCount: nextCount } : c)));
    }
    await retweetTweetApi(id, nextRetweeted, nextCount);
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const emoji = emojiData.emoji;

    setCommentText((curr) => curr.substring(0, startPos) + emoji + curr.substring(endPos));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + emoji.length, startPos + emoji.length);
    }, 10);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const newComment = await createCommentApi(tweetId, commentText.trim());
      setComments((prev) => [...prev, newComment]);
      setParentTweet((prev: any) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      setCommentText("");
      setShowPicker(false);
    } catch (err) {
      console.error("Failed to submit comment:", err);
    }
  };

  if (loading) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex items-center justify-center bg-breezy-bgLight">
          <RefreshCw className="animate-spin text-breezy-blue" size={24} />
        </div>
      </PhoneFrame>
    );
  }

  if (!parentTweet) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex flex-col items-center justify-center bg-breezy-bgLight p-6 text-breezy-gray">
          <p className="font-bold">Message introuvable.</p>
          <button type="button" onClick={() => router.back()} className="mt-4 px-4 py-2 bg-breezy-blue text-white rounded-full font-bold text-sm">Retour</button>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden select-none bg-breezy-bgLight rounded-[inherit]">
        <header className="w-full h-[78px] px-[18px] flex items-center bg-breezy-bgLight/80 backdrop-blur-[5px] border-b border-breezy-border-light shrink-0 z-20">
          <div className="flex items-center gap-[9px] w-full">
            <button type="button" onClick={() => router.back()} aria-label="Retour" className="p-1 hover:bg-gray-200/50 rounded-full text-breezy-dark cursor-pointer transition border-none bg-transparent flex">
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-inter font-extrabold text-[19px] tracking-[-0.38px] text-breezy-dark m-0">Message</h1>
          </div>
        </header>

        <div className="flex-1 w-full overflow-y-auto pb-[180px] flex flex-col no-scrollbar">
          <div className="flex p-4 bg-breezy-bgLight border-b border-breezy-border-light text-left w-full shrink-0">
            <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-white flex items-center justify-center font-bold text-white text-[16px] overflow-hidden">
              {parentTweet.user?.avatarUrl ? <img src={parentTweet.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center">{parentTweet.user?.username?.substring(0, 2).toUpperCase()}</div>}
            </div>
            <div className="flex flex-col ml-3 w-full">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-inter font-bold text-[14.5px] text-breezy-dark">@{parentTweet.user?.username}</span>
                </div>
              </div>
              <p className="font-inter text-[14.5px] text-breezy-dark mt-2 leading-[22px] whitespace-pre-line">{parentTweet.content}</p>
              <div className="border-b border-breezy-border-light py-2 text-[13px] text-breezy-gray font-medium font-inter">{parentTweet.createdAt}</div>

              <div className="flex justify-between items-center text-breezy-gray text-[13px] font-medium max-w-[280px] mt-2 w-full">
                <div className="flex items-center gap-1.5"><MessageCircle size={17} /> <span>{parentTweet.commentCount || 0}</span></div>
                <button type="button" aria-label="Retweeter" onClick={() => handleRetweet(parentTweet.id, true, parentTweet.isRetweeted, parentTweet.retweetCount)} className={`flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer ${parentTweet.isRetweeted ? "text-green-500 font-bold" : "text-breezy-gray"}`}><Repeat2 size={17} /> <span>{parentTweet.retweetCount || 0}</span></button>
                <button type="button" aria-label="Liker" onClick={() => handleLike(parentTweet.id, true, parentTweet.isLiked, parentTweet.likeCount)} className={`flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer ${parentTweet.isLiked ? "text-[#E0526B] font-bold" : "text-breezy-gray"}`}><Heart size={17} className={parentTweet.isLiked ? "fill-[#E0526B]" : ""} /> <span>{parentTweet.likeCount || 0}</span></button>
                <div><Share size={17} /></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full text-left bg-breezy-bgLight">
            {comments.length > 0 ? (
              comments.map((comment: any) => (
                <div key={comment.id} className="flex p-4 border-b border-breezy-border-light bg-breezy-bgLight w-full text-left">
                  <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-white flex items-center justify-center font-bold text-white text-[15px] overflow-hidden">
                    {comment.user?.avatarUrl ? <img src={comment.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center">{comment.user?.username?.substring(0, 2).toUpperCase()}</div>}
                  </div>
                  <div className="flex flex-col ml-3 w-full">
                    <div className="flex items-center gap-1.5">
                      <span className="font-inter font-bold text-[14.5px] text-breezy-dark">@{comment.user?.username}</span>
                      <span className="text-breezy-gray">·</span>
                      <span className="font-inter text-[13px] text-breezy-gray">{comment.createdAt}</span>
                    </div>
                    <p className="font-inter text-[14.5px] text-breezy-dark mt-1 leading-[22px] whitespace-pre-line">{comment.content}</p>
                    
                    <div className="flex justify-between items-center text-breezy-gray text-[13px] font-medium max-w-[280px] mt-2.5 w-full">
                      <div className="flex items-center gap-1.5 opacity-60"><MessageCircle size={17} /> <span>{comment.commentCount || 0}</span></div>
                      <button type="button" aria-label="Retweeter le commentaire" onClick={() => handleRetweet(comment.id, false, comment.isRetweeted, comment.retweetCount)} className={`flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer ${comment.isRetweeted ? "text-green-500 font-bold" : "text-breezy-gray"}`}><Repeat2 size={17} /> <span>{comment.retweetCount || 0}</span></button>
                      <button type="button" aria-label="Liker le commentaire" onClick={() => handleLike(comment.id, false, comment.isLiked, comment.likeCount)} className={`flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer ${comment.isLiked ? "text-[#E0526B] font-bold" : "text-breezy-gray"}`}><Heart size={17} className={comment.isLiked ? "fill-[#E0526B]" : ""} /> <span>{comment.likeCount || 0}</span></button>
                      <div><Share size={17} /></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-breezy-gray text-[14px] font-inter">Aucun commentaire pour le moment.</div>
            )}
          </div>
        </div>

        <div className="absolute bottom-[63px] left-0 right-0 bg-white border-t border-breezy-border-light p-3 z-30 flex flex-col gap-2">
          <form onSubmit={handleSubmitComment} className="flex gap-3 items-end">
            
            {/* AVATAR DYNAMIQUE DE L'INPUT */}
            {currentUser?.avatar_url ? (
              <div className="w-[36px] h-[36px] shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-[36px] h-[36px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[13px] overflow-hidden">
                {currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : ""}
              </div>
            )}
            
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-[20px] px-3 py-1.5 flex items-end gap-2">
              <textarea ref={textareaRef} rows={1} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Postez votre réponse..." className="flex-1 bg-transparent resize-none outline-none font-inter text-[14.5px] text-breezy-dark max-h-[80px] pt-1" />
              <button type="button" aria-label="Ouvrir le sélecteur d'émojis" onClick={() => setShowPicker(!showPicker)} className="text-breezy-gray hover:text-breezy-blue p-1 cursor-pointer border-none bg-transparent flex"><Smile size={20} /></button>
            </div>
            <button type="submit" disabled={!commentText.trim()} className="px-4 h-[36px] bg-breezy-blue disabled:opacity-40 text-white font-bold text-[13.5px] rounded-full border-none cursor-pointer">Répondre</button>
          </form>

          {showPicker && (
            <div className="w-full border-t border-gray-100 mt-2 bg-gray-50 rounded-xl overflow-hidden">
              <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} width="100%" height={200} previewConfig={{ showPreview: false }} skinTonesDisabled />
            </div>
          )}
        </div>

        <NavBar activePage="home" />
      </div>
    </PhoneFrame>
  );
}