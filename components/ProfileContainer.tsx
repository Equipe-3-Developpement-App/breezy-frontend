"use client";

import React, { useState, useEffect, useRef } from "react";
import { NavBar } from "./layout/NavBar";
import { TweetCard } from "./tweets/TweetCard";
import { ConfirmationModal } from "./modals/ConfirmationModal";
import { ComposeModal } from "./modals/ComposeModal";
import { Tweet } from "@/types";
import { 
  deleteTweetApi, getUserPosts, getUserFollowStats, updateUserProfile, uploadMediaApi, UserProfile, logoutApi,
  fetchCurrentUser, getUserProfileByAuthId, getFollowingIds, toggleFollowApi
} from "@/utils/api";
import { Settings, LogOut, X, RefreshCw, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileContainerProps {
  targetUserId?: string;
}

export function ProfileContainer({ targetUserId }: ProfileContainerProps = {}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("messages");
  const [showSettings, setShowSettings] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ followingCount: 0, followersCount: 0 });
  const [userTweets, setUserTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [tweetToEdit, setTweetToEdit] = useState<Tweet | null>(null);

  const handleLogout = async () => {
    try { await logoutApi(); } catch (err) {} finally { router.push("/login"); }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      try {
        setLoading(true);
        const authUser = await fetchCurrentUser();
        if (!authUser) return;

        const actualTargetId = targetUserId || authUser.id.toString();
        const own = actualTargetId === authUser.id.toString();
        if (isMounted) setIsOwnProfile(own);

        const [userProf, tweetsData, followStats, myFollows] = await Promise.all([
          getUserProfileByAuthId(actualTargetId),
          getUserPosts(actualTargetId),
          getUserFollowStats(actualTargetId),
          own ? Promise.resolve([]) : getFollowingIds(authUser.id)
        ]);

        if (userProf && isMounted) {
          setProfile(userProf);
          setEditBio(userProf.bio || "");
          setEditAvatarUrl(userProf.avatar_url || "");
          setUserTweets(tweetsData);
          setStats(followStats);
          
          if (!own) {
            setIsFollowing(myFollows.includes(actualTargetId));
          }
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();
    return () => { isMounted = false; };
  }, [targetUserId]);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updatedProfile = await updateUserProfile(editBio, editAvatarUrl);
      setProfile(updatedProfile);
      setUserTweets(current => current.map(t => ({ ...t, user: { ...t.user, avatarUrl: updatedProfile.avatar_url || undefined } })));
      setIsEditing(false);
    } catch (err) {} finally { setIsSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsSaving(true);
      const uploadResult = await uploadMediaApi(file);
      setEditAvatarUrl(uploadResult.url);
    } catch (err) {} finally { setIsSaving(false); }
  };

  const handleFollowToggleProfile = async () => {
    if (!profile) return;
    const targetId = profile.id_auth.toString();
    const currentlyFollowing = isFollowing;

    setIsFollowing(!currentlyFollowing);
    setStats(s => ({ ...s, followersCount: s.followersCount + (currentlyFollowing ? -1 : 1) }));
    setUserTweets(current => current.map(tweet => ({ ...tweet, isFollowing: !currentlyFollowing })));

    try {
      await toggleFollowApi(targetId, currentlyFollowing);
    } catch (err) {
      setIsFollowing(currentlyFollowing);
      setStats(s => ({ ...s, followersCount: s.followersCount + (currentlyFollowing ? 1 : -1) }));
      setUserTweets(current => current.map(tweet => ({ ...tweet, isFollowing: currentlyFollowing })));
    }
  };

  const handleLikeToggle = async (tweetId: string) => {
    let updatedIsLiked = false;
    let updatedCount = 0;
    setUserTweets((current) => current.map((tweet) => {
      if (tweet.id === tweetId) {
        updatedIsLiked = !tweet.isLiked;
        updatedCount = updatedIsLiked ? tweet.likeCount + 1 : Math.max(0, tweet.likeCount - 1);
        return { ...tweet, isLiked: updatedIsLiked, likeCount: updatedCount };
      }
      return tweet;
    }));
    try {
      const { likeTweetApi } = await import("@/utils/api");
      await likeTweetApi(tweetId, updatedIsLiked, updatedCount);
    } catch (err) {}
  };

  const handleFollowToggleFromTweet = async () => {
    await handleFollowToggleProfile();
  };

  const handleConfirmDelete = async () => {
    if (!tweetToDelete) return;
    try {
      setUserTweets((current) => current.filter((t) => t.id !== tweetToDelete));
      await deleteTweetApi(tweetToDelete);
    } catch (err) {} finally { setTweetToDelete(null); }
  };

  if (loading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-breezy-bgLight">
        <RefreshCw className="animate-spin text-breezy-blue" size={24} />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-[68px] no-scrollbar">
        <div className="flex justify-between items-end px-5 pt-[35px] pb-4 w-full bg-transparent">
          
          <div className="relative group">
            {isOwnProfile && (
              <input 
                type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} 
                aria-label="Modifier la photo de profil" title="Modifier la photo de profil" 
              />
            )}
            <div 
              className={`w-[84px] h-[84px] shrink-0 rounded-full shadow-[0_0_0_4px_#FFFFFF] overflow-hidden ${isOwnProfile && isEditing ? 'cursor-pointer' : ''} ${editAvatarUrl || profile.avatar_url ? 'bg-white' : 'bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[33.6px]'}`}
              onClick={() => isOwnProfile && isEditing && fileInputRef.current?.click()}
              title={isOwnProfile && isEditing ? "Cliquez pour modifier l'avatar" : undefined}
            >
              {editAvatarUrl || profile.avatar_url ? (
                <img src={editAvatarUrl || profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.username.substring(0, 2).toUpperCase()
              )}
              {isOwnProfile && isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                  <Camera size={24} className="text-white" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-[30px] w-full max-w-[375px]">
            {isOwnProfile ? (
              <button 
                type="button" onClick={() => setShowSettings(true)}
                aria-label="Ouvrir les paramètres" title="Ouvrir les paramètres"
                className="w-[34px] h-[34px] flex items-center justify-center text-breezy-dark hover:text-breezy-blue hover:bg-white/50 rounded-full transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                <Settings size={24} />
              </button>
            ) : (
              <div className="h-[34px]" /> 
            )}

            {isOwnProfile ? (
              !isEditing && (
                <button 
                  type="button" onClick={() => setIsEditing(true)}
                  aria-label="Modifier le profil" title="Modifier le profil"
                  className="px-4 h-[36px] border border-[#CDD9E6] bg-white hover:bg-gray-50 text-breezy-dark font-bold text-[14px] rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 select-none border-solid"
                >
                  Modifier le profil
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={handleFollowToggleProfile}
                aria-label={isFollowing ? "Se désabonner" : "Suivre"}
                title={isFollowing ? "Se désabonner" : "Suivre"}
                className={`px-6 h-[36px] font-bold text-[14px] rounded-full transition-all duration-200 cursor-pointer active:scale-95 border select-none
                  ${isFollowing
                    ? "bg-breezy-blue border-breezy-blue text-white hover:bg-breezy-darkBlue"
                    : "bg-transparent border-breezy-blue text-breezy-blue hover:bg-blue-50"}`}
              >
                {isFollowing ? "Suivi" : "Suivre"}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3.5 w-full pb-[15px]">
          <div className="flex flex-col text-left px-5">
            <h2 className="text-[21px] font-extrabold text-breezy-dark tracking-tight leading-[25px]">
              @{profile.username}
            </h2>
          </div>

          {isOwnProfile && isEditing ? (
            <div className="flex flex-col gap-3 px-5 w-full">
              <label htmlFor="bio-input" className="sr-only">Biographie</label>
              <textarea
                id="bio-input"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-white border border-breezy-border-light rounded-xl p-3 text-[14.5px] font-inter text-breezy-dark focus:border-breezy-blue outline-none resize-none"
                rows={3}
                maxLength={280}
                placeholder="Écrivez quelque chose sur vous..."
                aria-label="Modifier votre biographie" title="Modifier votre biographie"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button type="button" onClick={() => setIsEditing(false)} aria-label="Annuler" title="Annuler" className="px-4 h-[32px] rounded-full border border-[#CDD9E6] text-[13px] font-bold text-breezy-gray hover:bg-gray-50 cursor-pointer border-solid">Annuler</button>
                <button type="button" onClick={handleSaveProfile} disabled={isSaving} aria-label="Enregistrer" title="Enregistrer" className="px-4 h-[32px] rounded-full bg-breezy-blue hover:bg-breezy-darkBlue text-white text-[13px] font-bold disabled:opacity-50 cursor-pointer border-none">
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 text-left px-5">
              <p className="text-[14.5px] text-breezy-dark leading-[22px] whitespace-pre-wrap break-words">
                {profile.bio || "Aucune bio pour le moment."}
              </p>
              
              <div className="flex items-center gap-[22px] text-[13.5px]">
                <span className="text-breezy-gray">
                  <strong className="font-extrabold text-breezy-dark">{stats.followingCount}</strong> abonnements
                </span>
                <span className="text-breezy-gray">
                  <strong className="font-extrabold text-breezy-dark">{stats.followersCount}</strong> abonnés
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-5 h-[44px] w-full bg-transparent border-b border-breezy-border-light">
          {["messages", "responses", "medias"].map(tab => (
            <button 
              key={tab} type="button" onClick={() => setActiveTab(tab)}
              aria-label={`Voir l'onglet ${tab}`} title={`Voir l'onglet ${tab}`}
              className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative border-none bg-transparent ${activeTab === tab ? "text-breezy-dark font-extrabold" : "text-breezy-gray font-semibold hover:text-breezy-dark"}`}
            >
              <span className="capitalize">{tab === "messages" ? "Messages" : tab === "responses" ? "Réponses" : "Médias"}</span>
              {activeTab === tab && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-breezy-blue" />}
            </button>
          ))}
        </div>

        <div className="w-full text-left">
          {activeTab === "messages" && (
            userTweets.length > 0 ? (
              userTweets.map((tweet) => (
                <TweetCard
                  key={tweet.id} tweet={tweet} onLike={handleLikeToggle} onFollow={handleFollowToggleFromTweet}
                  onDelete={() => setTweetToDelete(tweet.id)}
                  onEdit={setTweetToEdit}
                  isOwnTweet={isOwnProfile}
                />
              ))
            ) : (
              <div className="text-center p-8 text-breezy-gray text-[14.5px]">Aucun message à afficher.</div>
            )
          )}
        </div>
      </div>

      {isOwnProfile && (
        <button 
          type="button" onClick={() => setShowCompose(true)} aria-label="Créer un tweet" title="Créer un tweet"
          className="absolute bottom-24 right-6 w-[56px] h-[56px] bg-breezy-blue hover:bg-breezy-darkBlue text-white rounded-full flex items-center justify-center shadow-xl z-30 font-bold text-2xl cursor-pointer transition-all active:scale-95 border-none"
        >
          +
        </button>
      )}

      <NavBar activePage="profile" />

      <ConfirmationModal isOpen={tweetToDelete !== null} title="Supprimer ?" message="Irréversible." onConfirm={handleConfirmDelete} onCancel={() => setTweetToDelete(null)} />
      
      {(showCompose || tweetToEdit !== null) && (
        <ComposeModal 
          onClose={() => { setShowCompose(false); setTweetToEdit(null); window.location.reload(); }} 
          tweetToEdit={tweetToEdit} 
        />
      )}

      {showSettings && (
        <>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity" onClick={() => setShowSettings(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-8 z-[60] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex flex-col gap-4 animate-in slide-in-from-bottom">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-[19px] font-extrabold text-breezy-dark">Options</h3>
              <button type="button" onClick={() => setShowSettings(false)} aria-label="Fermer" title="Fermer" className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-breezy-gray cursor-pointer border-none"><X size={18} /></button>
            </div>
            <button type="button" onClick={handleLogout} aria-label="Se déconnecter" title="Se déconnecter" className="flex items-center gap-4 w-full p-4 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-xl transition-all cursor-pointer border-none bg-transparent text-left">
              <LogOut size={20} /> <span className="font-bold text-[16px]">Se déconnecter</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}