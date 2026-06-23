"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { getTweetById, likeTweetApi, toggleFollowApi, deleteTweetApi, getCurrentUserProfile, UserProfile } from "@/utils/api";
import { NavBar } from "@/components/layout/NavBar";
import { PhoneFrame } from "@/components/layout/PhoneFrame";
import { TweetCard } from "@/components/tweets/TweetCard";
import { ComposeModal } from "@/components/modals/ComposeModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { Tweet } from "@/types";

export default function CommentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tweetId = params.id as string;
  const shouldAutoReply = searchParams.get("reply") === "true";

  const [threadParent, setThreadParent] = useState<Tweet | null>(null);
  const [parentTweet, setParentTweet] = useState<Tweet | null>(null);
  const [comments, setComments] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [tweetToEdit, setTweetToEdit] = useState<Tweet | null>(null);
  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);
  const [tweetToReplyTo, setTweetToReplyTo] = useState<Tweet | null>(null);

  useEffect(() => {
    getCurrentUserProfile().then(setCurrentUser);
    if (tweetId) {
      setLoading(true);
      getTweetById(tweetId)
        .then((data) => {
          setThreadParent((data as any).parentPost || null);
          const currentMainPost = data as unknown as Tweet;
          setParentTweet(currentMainPost);
          setComments((data as any).comments || []);
          
          if (shouldAutoReply) {
            setTweetToReplyTo(currentMainPost);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [tweetId, shouldAutoReply]);

  const handleLikeToggle = async (id: string) => {
    let updatedIsLiked = false;
    let updatedCount = 0;

    if (threadParent?.id === id) {
      updatedIsLiked = !threadParent.isLiked;
      updatedCount = updatedIsLiked ? threadParent.likeCount + 1 : Math.max(0, threadParent.likeCount - 1);
      setThreadParent({ ...threadParent, isLiked: updatedIsLiked, likeCount: updatedCount });
    } else if (parentTweet?.id === id) {
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
    const target = threadParent?.user.id === userId ? threadParent : parentTweet?.user.id === userId ? parentTweet : comments.find(c => c.user.id === userId);
    if (!target) return;
    const isCurrentlyFollowing = target.isFollowing;
    
    if (threadParent?.user.id === userId) setThreadParent(prev => ({...prev!, isFollowing: !isCurrentlyFollowing}));
    if (parentTweet?.user.id === userId) setParentTweet(prev => ({...prev!, isFollowing: !isCurrentlyFollowing}));
    setComments(curr => curr.map(c => c.user.id === userId ? { ...c, isFollowing: !isCurrentlyFollowing } : c));
    
    try { await toggleFollowApi(userId, isCurrentlyFollowing || false); } catch(err) {}
  };

  const handleConfirmDelete = async () => {
    if(!tweetToDelete) return;
    try {
        if (threadParent?.id === tweetToDelete || parentTweet?.id === tweetToDelete) {
            await deleteTweetApi(tweetToDelete);
            router.push('/feed');
        } else {
            setComments(curr => curr.filter(c => c.id !== tweetToDelete));
            setParentTweet(prev => ({...prev!, commentCount: Math.max(0, prev!.commentCount - 1)}));
            await deleteTweetApi(tweetToDelete);
        }
    } catch(err) {} finally { setTweetToDelete(null); }
  };

  if (loading) return <PhoneFrame><div className="flex-1 flex items-center justify-center bg-breezy-bgLight"><RefreshCw className="animate-spin text-breezy-blue" size={24} /></div></PhoneFrame>;
  
  if (!parentTweet) return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col items-center justify-center bg-breezy-bgLight p-6 text-breezy-gray">
        <p className="font-bold">Message introuvable.</p>
        <button 
          type="button" 
          onClick={() => router.push("/feed")}
          aria-label="Retourner au flux principal"
          title="Retourner au flux principal"
          className="mt-4 px-4 py-2 bg-breezy-blue text-white rounded-full font-bold text-sm border-none cursor-pointer"
        >
          Retour
        </button>
      </div>
    </PhoneFrame>
  );

  return (
    <PhoneFrame>
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden select-none bg-breezy-bgLight rounded-[inherit]">
        
        <header className="w-full h-[78px] px-[18px] flex items-center bg-white border-b border-breezy-border-light shrink-0 z-20">
          <div className="flex items-center gap-[9px] w-full">
            <button 
              type="button" 
              onClick={() => router.push("/feed")}
              aria-label="Retourner au flux principal"
              title="Retourner au flux principal"
              className="p-1 hover:bg-gray-200/50 rounded-full text-breezy-dark cursor-pointer transition border-none bg-transparent flex"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-inter font-extrabold text-[19px] text-breezy-dark m-0">Message</h1>
          </div>
        </header>

        <div className="flex-1 w-full overflow-y-auto pb-24 flex flex-col no-scrollbar">
          
          {threadParent && (
            <div className="relative">
              <TweetCard 
                tweet={threadParent} onLike={handleLikeToggle} onFollow={handleFollowToggle} 
                onEdit={setTweetToEdit} onDelete={setTweetToDelete} onCommentClick={setTweetToReplyTo}
                isOwnTweet={currentUser?.id_auth.toString() === threadParent.user.id} 
              />
              <div className="absolute left-[36px] top-[60px] bottom-0 w-[2px] bg-breezy-border-light z-10" />
            </div>
          )}

          <div className={`${threadParent ? "bg-white relative z-20 shadow-sm" : ""}`}>
            <TweetCard 
              tweet={parentTweet} onLike={handleLikeToggle} onFollow={handleFollowToggle} 
              onEdit={setTweetToEdit} onDelete={setTweetToDelete} onCommentClick={setTweetToReplyTo}
              isOwnTweet={currentUser?.id_auth.toString() === parentTweet.user.id} 
            />
          </div>

          <div className="flex flex-col w-full bg-breezy-bgLight">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <TweetCard 
                  key={comment.id} tweet={comment} onLike={handleLikeToggle} onFollow={handleFollowToggle} 
                  onEdit={setTweetToEdit} onDelete={setTweetToDelete} onCommentClick={setTweetToReplyTo}
                  isOwnTweet={currentUser?.id_auth.toString() === comment.user.id} 
                />
              ))
            ) : (
              <div className="text-center p-8 text-breezy-gray text-[14px]">Aucun commentaire pour le moment.</div>
            )}
          </div>
        </div>

        <NavBar activePage="home" />
      </div>

      <ConfirmationModal isOpen={tweetToDelete !== null} title="Supprimer le message ?" message="Cette action est irréversible." onConfirm={handleConfirmDelete} onCancel={() => setTweetToDelete(null)} />
      
      {tweetToEdit && <ComposeModal onClose={() => { setTweetToEdit(null); window.location.reload(); }} tweetToEdit={tweetToEdit} />}
      
      {tweetToReplyTo && (
        <ComposeModal 
          onClose={() => { 
            setTweetToReplyTo(null); 
            router.replace(`/feed/${tweetId}`); 
          }} 
          tweetToReplyTo={tweetToReplyTo} 
        />
      )}
    </PhoneFrame>
  );
}