"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Smile } from "lucide-react";
import { getTweetById, createCommentApi, likeTweetApi, toggleFollowApi, deleteTweetApi, getCurrentUserProfile, UserProfile } from "@/utils/api";
import { NavBar } from "@/components/layout/NavBar";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { TweetCard } from "@/components/tweets/TweetCard";
import { ComposeModal } from "@/components/modals/ComposeModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Tweet } from "@/types";

export default function CommentPage() {
  const params = useParams();
  const router = useRouter();
  const tweetId = params.id as string;

  const [parentTweet, setParentTweet] = useState<Tweet | null>(null);
  const [comments, setComments] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [commentText, setCommentText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [tweetToEdit, setTweetToEdit] = useState<Tweet | null>(null);
  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUserProfile().then(setCurrentUser);
    if (tweetId) {
      setLoading(true);
      getTweetById(tweetId)
        .then((data) => {
          setParentTweet(data as unknown as Tweet);
          setComments((data as any).comments || []);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [tweetId]);

  const handleLikeToggle = async (id: string) => {
    let updatedIsLiked = false;
    let updatedCount = 0;

    if (parentTweet?.id === id) {
      updatedIsLiked = !parentTweet.isLiked;
      updatedCount = updatedIsLiked ? parentTweet.likeCount + 1 : Math.max(0, parentTweet.likeCount - 1);
      setParentTweet({ ...parentTweet, isLiked: updatedIsLiked, likeCount: updatedCount });
    } else {
      setComments(curr => curr.map(c => {
        if (c.id === id) {
          updatedIsLiked = !c.isLiked;
          updatedCount = updatedIsLiked ? c.likeCount + 1 : Math.max(0, c.likeCount - 1);
          return { ...c, isLiked: updatedIsLiked, likeCount: updatedCount };
        }
        return c;
      }));
    }
    try { await likeTweetApi(id, updatedIsLiked, updatedCount); } catch (err) {}
  };

  const handleFollowToggle = async (userId: string) => {
    const target = parentTweet?.user.id === userId ? parentTweet : comments.find(c => c.user.id === userId);
    if (!target) return;
    const isCurrentlyFollowing = target.isFollowing;
    
    if (parentTweet?.user.id === userId) setParentTweet(prev => ({...prev!, isFollowing: !isCurrentlyFollowing}));
    setComments(curr => curr.map(c => c.user.id === userId ? { ...c, isFollowing: !isCurrentlyFollowing } : c));
    
    try { await toggleFollowApi(userId, isCurrentlyFollowing || false); } catch(err) {}
  };

  const handleConfirmDelete = async () => {
    if(!tweetToDelete) return;
    try {
        if (parentTweet?.id === tweetToDelete) {
            await deleteTweetApi(tweetToDelete);
            router.push('/feed');
        } else {
            setComments(curr => curr.filter(c => c.id !== tweetToDelete));
            setParentTweet(prev => ({...prev!, commentCount: Math.max(0, prev!.commentCount - 1)}));
            await deleteTweetApi(tweetToDelete);
        }
    } catch(err) {} finally { setTweetToDelete(null); }
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd } = textareaRef.current;
    const emoji = emojiData.emoji;
    setCommentText(curr => curr.substring(0, selectionStart) + emoji + curr.substring(selectionEnd));
    setTimeout(() => { textareaRef.current!.focus(); textareaRef.current!.setSelectionRange(selectionStart + emoji.length, selectionStart + emoji.length); }, 10);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const newComment = await createCommentApi(tweetId, commentText.trim());
      setComments(prev => [...prev, newComment]);
      setParentTweet(prev => ({ ...prev!, commentCount: prev!.commentCount + 1 }));
      setCommentText("");
      setShowPicker(false);
    } catch (err) {}
  };

  if (loading) return <PhoneFrame><div className="flex-1 flex items-center justify-center bg-breezy-bgLight"><RefreshCw className="animate-spin text-breezy-blue" size={24} /></div></PhoneFrame>;
  if (!parentTweet) return <PhoneFrame><div className="flex-1 flex flex-col items-center justify-center bg-breezy-bgLight p-6 text-breezy-gray"><p className="font-bold">Message introuvable.</p><button type="button" onClick={() => router.back()} className="mt-4 px-4 py-2 bg-breezy-blue text-white rounded-full font-bold text-sm">Retour</button></div></PhoneFrame>;

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden select-none bg-breezy-bgLight rounded-[inherit]">
        
        <header className="w-full h-[78px] px-[18px] flex items-center bg-white border-b border-breezy-border-light shrink-0 z-20">
          <div className="flex items-center gap-[9px] w-full">
            <button 
              type="button" 
              onClick={() => router.back()} 
              aria-label="Retour"
              title="Retour"
              className="p-1 hover:bg-gray-200/50 rounded-full text-breezy-dark cursor-pointer transition border-none bg-transparent flex"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-inter font-extrabold text-[19px] text-breezy-dark m-0">Message</h1>
          </div>
        </header>

        <div className="flex-1 w-full overflow-y-auto pb-[180px] flex flex-col no-scrollbar">
          
          <TweetCard 
            tweet={parentTweet} onLike={handleLikeToggle} onFollow={handleFollowToggle} 
            onEdit={setTweetToEdit} onDelete={setTweetToDelete} 
            isOwnTweet={currentUser?.id_auth.toString() === parentTweet.user.id} 
          />

          <div className="flex flex-col w-full bg-breezy-bgLight">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <TweetCard 
                  key={comment.id} tweet={comment} onLike={handleLikeToggle} onFollow={handleFollowToggle} 
                  onEdit={setTweetToEdit} onDelete={setTweetToDelete} 
                  isOwnTweet={currentUser?.id_auth.toString() === comment.user.id} 
                />
              ))
            ) : (
              <div className="text-center p-8 text-breezy-gray text-[14px]">Aucun commentaire pour le moment.</div>
            )}
          </div>
        </div>

        <div className="absolute bottom-[63px] left-0 right-0 bg-white border-t border-breezy-border-light p-3 z-30 flex flex-col gap-2">
          <form onSubmit={handleSubmitComment} className="flex gap-3 items-end">
            {currentUser?.avatar_url ? (
              <div className="w-[36px] h-[36px] shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden"><img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" /></div>
            ) : (
              <div className="w-[36px] h-[36px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[13px] overflow-hidden">{currentUser?.username?.substring(0, 2).toUpperCase()}</div>
            )}
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-[20px] px-3 py-1.5 flex items-end gap-2">
              <label htmlFor="comment-input" className="sr-only">Postez votre réponse</label>
              <textarea 
                id="comment-input"
                ref={textareaRef} 
                rows={1} 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)} 
                placeholder="Postez votre réponse..." 
                aria-label="Postez votre réponse..."
                title="Postez votre réponse..."
                className="flex-1 bg-transparent resize-none outline-none text-[14.5px] text-breezy-dark max-h-[80px] pt-1" 
              />
              <button 
                type="button" 
                onClick={() => setShowPicker(!showPicker)} 
                aria-label="Ajouter un emoji"
                title="Ajouter un emoji"
                className="text-breezy-gray hover:text-breezy-blue p-1 cursor-pointer border-none bg-transparent flex"
              >
                <Smile size={20} />
              </button>
            </div>
            <button 
              type="submit" 
              disabled={!commentText.trim()} 
              aria-label="Publier la réponse"
              title="Publier la réponse"
              className="px-4 h-[36px] bg-breezy-blue disabled:opacity-40 text-white font-bold text-[13.5px] rounded-full border-none cursor-pointer"
            >
              Répondre
            </button>
          </form>

          {showPicker && (
            <div className="w-full border-t border-gray-100 mt-2 bg-gray-50 rounded-xl overflow-hidden">
              <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} width="100%" height={200} previewConfig={{ showPreview: false }} skinTonesDisabled />
            </div>
          )}
        </div>

        <NavBar activePage="home" />
      </div>

      <ConfirmationModal isOpen={tweetToDelete !== null} title="Supprimer le message ?" message="Cette action est irréversible." onConfirm={handleConfirmDelete} onCancel={() => setTweetToDelete(null)} />
      {tweetToEdit && <ComposeModal onClose={() => { setTweetToEdit(null); window.location.reload(); }} tweetToEdit={tweetToEdit} />}
    </PhoneFrame>
  );
}