"use client";

import React, { useState, useEffect, useRef } from "react";
import { NavBar } from "./layout/NavBar";
import { TweetCard } from "./tweets/TweetCard";
import { ConfirmationModal } from "./modals/ConfirmationModal";
import { ComposeModal } from "./modals/ComposeModal";
import { ModerateUserModal } from "./modals/ModerateUserModal";
import { SettingsModal } from "./modals/SettingsModal";
import { AdminRegisterModal } from "./modals/AdminRegisterModal";
import { Tweet } from "@/types";
import { 
  deleteTweetApi, getUserPosts, getUserReplies, getUserFollowStats, updateUserProfile, uploadMediaApi, UserProfile,
  fetchCurrentUser, getUserProfileByAuthId, getFollowingIds, toggleFollowApi 
} from "@/utils/api";
import { Camera, ShieldAlert, Settings, UserPlus } from "lucide-react";

interface ProfileContainerProps { targetUserId?: string; }

export function ProfileContainer({ targetUserId }: ProfileContainerProps = {}) {
  const [activeTab, setActiveTab] = useState<"messages" | "responses">("messages");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ followingCount: 0, followersCount: 0 });
  const [userTweets, setUserTweets] = useState<Tweet[]>([]);
  const [userReplies, setUserReplies] = useState<Tweet[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [tweetToEdit, setTweetToEdit] = useState<Tweet | null>(null);
  const [isModerateOpen, setIsModerateOpen] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [showMobileAdmin, setShowMobileAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfileData = async () => {
      try {
        const authUser = await fetchCurrentUser();
        if (!authUser) return;
        if (isMounted) setCurrentUserRole(authUser.role);
        const actualTargetId = targetUserId || authUser.id.toString();
        const own = actualTargetId === authUser.id.toString();
        if (isMounted) setIsOwnProfile(own);
        const [userProf, tweetsData, repliesData, followStats, myFollows] = await Promise.all([
          getUserProfileByAuthId(actualTargetId), getUserPosts(actualTargetId), getUserReplies(actualTargetId), getUserFollowStats(actualTargetId), own ? Promise.resolve([]) : getFollowingIds(authUser.id)
        ]);
        if (userProf && isMounted) {
          setProfile(userProf); setEditBio(userProf.bio || ""); setEditAvatarUrl(userProf.avatar_url || "");
          setUserTweets(tweetsData); setUserReplies(repliesData); setStats(followStats);
          if (!own) setIsFollowing(myFollows.includes(actualTargetId));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProfileData();
    return () => { isMounted = false; };
  }, [targetUserId]);

  const handleSaveProfile = async () => {
    try { setIsSaving(true); const updated = await updateUserProfile(editBio, editAvatarUrl); setProfile(updated); setIsEditing(false); } catch (err) {} finally { setIsSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { setIsSaving(true); const res = await uploadMediaApi(file); setEditAvatarUrl(res.url); } catch (err) {} finally { setIsSaving(false); }
  };

  const handleFollowToggleProfile = async () => {
    if (!profile) return;
    const targetId = profile.id_auth.toString(); const currentlyFollowing = isFollowing;
    setIsFollowing(!currentlyFollowing);
    setStats(s => ({ ...s, followersCount: s.followersCount + (currentlyFollowing ? -1 : 1) }));
    try { await toggleFollowApi(targetId, currentlyFollowing); } catch (err) { setIsFollowing(currentlyFollowing); }
  };

  const handleLikeToggle = async (tweetId: string) => {
    let updatedIsLiked = false; let updatedCount = 0;
    const updateFn = (current: Tweet[]) => current.map((t) => {
      if (t.id === tweetId) {
        updatedIsLiked = !t.isLiked; updatedCount = updatedIsLiked ? t.likeCount + 1 : Math.max(0, t.likeCount - 1);
        return { ...t, isLiked: updatedIsLiked, likeCount: updatedCount };
      }
      return t;
    });
    setUserTweets(updateFn); setUserReplies(updateFn);
    try { const { likeTweetApi } = await import("@/utils/api"); await likeTweetApi(tweetId, updatedIsLiked, updatedCount); } catch (err) {}
  };

  const handleConfirmDelete = async () => {
    if (!tweetToDelete) return;
    try {
      const allLists = [...userTweets, ...userReplies];
      const targetTweet = allLists.find(t => t.id === tweetToDelete);
      const hasComments = targetTweet ? targetTweet.commentCount > 0 : false;
      const updateLists = (current: Tweet[]) => {
        if (hasComments) return current.map(t => t.id === tweetToDelete ? { ...t, content: "[Ce message a été supprimé par son auteur]", media: null, tags: [] } : t);
        return current.filter((t) => t.id !== tweetToDelete);
      };
      setUserTweets(updateLists); setUserReplies(updateLists);
      await deleteTweetApi(tweetToDelete);
    } catch (err) {} finally { setTweetToDelete(null); }
  };

  return (
    <div className="w-full">
      
      <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-breezy-border-light">
        <div className="flex justify-between items-start px-5 pt-8 pb-4">
          
          <div className="relative group mt-4">
            {isOwnProfile && <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} aria-label="Choisir un avatar" />}
            <button 
              type="button"
              className={`w-[84px] h-[84px] rounded-full overflow-hidden border-none relative group ${isOwnProfile && isEditing ? 'cursor-pointer' : 'cursor-default'} ${editAvatarUrl || profile?.avatar_url ? 'bg-white' : 'bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[33.6px]'}`}
              onClick={() => isOwnProfile && isEditing && fileInputRef.current?.click()}
              aria-label="Modifier l'avatar"
            >
              {profile ? (
                editAvatarUrl || profile.avatar_url ? <img src={editAvatarUrl || profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : profile.username.substring(0, 2).toUpperCase()
              ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              )}
              {isOwnProfile && isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              )}
            </button>
          </div>

          <div className="flex flex-col items-end gap-3 mt-4">
            {isOwnProfile && (
              <div className="flex items-center gap-2 md:hidden">
                 {currentUserRole === "admin" && <button type="button" onClick={() => setShowMobileAdmin(true)} className="p-2 text-breezy-gray border-none bg-transparent" aria-label="Admin"><UserPlus size={20} /></button>}
                 <button type="button" onClick={() => setShowMobileSettings(true)} className="p-2 text-breezy-gray border-none bg-transparent" aria-label="Paramètres"><Settings size={20} /></button>
              </div>
            )}
            {profile && (
              isOwnProfile ? (!isEditing && <button type="button" onClick={() => setIsEditing(true)} className="px-4 h-[36px] border border-[#CDD9E6] bg-white text-breezy-dark font-bold text-[14px] rounded-full cursor-pointer">Modifier le profil</button>) : (
                <div className="flex items-center gap-2">
                  {(currentUserRole === "admin" || currentUserRole === "moderator") && <button type="button" onClick={() => setIsModerateOpen(true)} className="w-9 h-9 border border-red-200 text-red-500 rounded-full flex items-center justify-center bg-transparent cursor-pointer" aria-label="Modérer"><ShieldAlert size={19} /></button>}
                  <button type="button" onClick={handleFollowToggleProfile} className={`px-6 h-[36px] font-bold text-[14px] rounded-full border cursor-pointer ${isFollowing ? "bg-breezy-blue border-breezy-blue text-white" : "bg-transparent border-breezy-blue text-breezy-blue"}`}>{isFollowing ? "Suivi" : "Suivre"}</button>
                </div>
              )
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3.5 w-full pb-[15px] px-5">
          <h2 className="text-[21px] font-extrabold text-breezy-dark min-h-[25px]">
            {profile ? `@${profile.username}` : <span className="block w-32 h-6 bg-gray-200 animate-pulse rounded" />}
          </h2>
          {isOwnProfile && isEditing ? (
            <div className="flex flex-col gap-3 w-full">
              <textarea 
                value={editBio} 
                onChange={(e) => setEditBio(e.target.value)} 
                className="w-full border border-breezy-border-light rounded-xl p-3 text-[14.5px] h-24 resize-none" 
                maxLength={280} 
                aria-label="Bio" 
                placeholder="Bio..." 
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 h-[32px] rounded-full border border-[#CDD9E6] text-[13px] font-bold text-breezy-gray bg-transparent cursor-pointer">Annuler</button>
                <button type="button" onClick={handleSaveProfile} className="px-4 h-[32px] rounded-full bg-breezy-blue text-white text-[13px] font-bold border-none cursor-pointer">Enregistrer</button>
              </div>
            </div>
          ) : (
            <p className="text-[14.5px] text-breezy-dark min-h-[22px]">
              {profile ? (profile.bio || "Aucune bio.") : <span className="block w-full h-4 bg-gray-200 animate-pulse rounded" />}
            </p>
          )}
          <div className="flex items-center gap-[22px] text-[13.5px] mt-1">
            <span className="text-breezy-gray"><strong className="font-extrabold text-breezy-dark">{stats.followingCount}</strong> abonnements</span>
            <span className="text-breezy-gray"><strong className="font-extrabold text-breezy-dark">{stats.followersCount}</strong> abonnés</span>
          </div>
        </div>

        <div className="flex justify-between items-center px-5 h-[44px] w-full bg-transparent border-t border-breezy-border-light">
          {(["messages", "responses"] as const).map(tab => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] relative border-none bg-transparent cursor-pointer ${activeTab === tab ? "text-breezy-dark font-extrabold" : "text-breezy-gray"}`}>
              <span className="capitalize">{tab === "messages" ? "Messages" : "Réponses"}</span>
              {activeTab === tab && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-breezy-blue" />}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full pb-24 md:pb-6">
        {activeTab === "messages" && userTweets.map((t) => <TweetCard key={t.id} tweet={t} onLike={handleLikeToggle} onFollow={handleFollowToggleProfile} onDelete={() => setTweetToDelete(t.id)} onEdit={setTweetToEdit} isOwnTweet={isOwnProfile} />)}
        {activeTab === "responses" && userReplies.map((t) => <TweetCard key={t.id} tweet={t} onLike={handleLikeToggle} onFollow={handleFollowToggleProfile} onDelete={() => setTweetToDelete(t.id)} onEdit={setTweetToEdit} isOwnTweet={isOwnProfile} />)}
        {profile && activeTab === "messages" && userTweets.length === 0 && <div className="text-center p-8 text-breezy-gray text-[14.5px]">Aucun message à afficher.</div>}
        {profile && activeTab === "responses" && userReplies.length === 0 && <div className="text-center p-8 text-breezy-gray text-[14.5px]">Aucune réponse à afficher.</div>}
      </div>

      {isOwnProfile && (
        <button 
          type="button" 
          onClick={() => setShowCompose(true)} 
          className="md:hidden fixed bottom-24 right-6 w-[56px] h-[56px] bg-breezy-blue text-white rounded-full flex items-center justify-center shadow-xl z-30 font-bold text-2xl border-none cursor-pointer" 
          aria-label="Nouveau post"
        >
          +
        </button>
      )}

      <NavBar activePage="profile" />

      <ConfirmationModal isOpen={tweetToDelete !== null} title="Supprimer ?" message="Irréversible." onConfirm={handleConfirmDelete} onCancel={() => setTweetToDelete(null)} />
      {showCompose && <ComposeModal onClose={() => { setShowCompose(false); window.location.reload(); }} />}
      {isModerateOpen && profile && <ModerateUserModal idAuth={profile.id_auth} username={profile.username} onClose={() => setIsModerateOpen(false)} />}
      {showMobileSettings && <SettingsModal onClose={() => setShowMobileSettings(false)} />}
      {showMobileAdmin && <AdminRegisterModal onClose={() => setShowMobileAdmin(false)} />}
    </div>
  );
}