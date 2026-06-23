"use client";

import React, { useState, useEffect, useRef } from "react";
import { NavBar } from "./layout/NavBar";
import { TweetCard } from "./tweets/TweetCard";
import { ConfirmationModal } from "./modals/ConfirmationModal";
import { ComposeModal } from "./modals/ComposeModal";
import { Tweet } from "@/types";
import { 
  deleteTweetApi, getCurrentUserProfile, getUserPosts, 
  getUserFollowStats, updateUserProfile, uploadMediaApi, UserProfile, logoutApi 
} from "@/utils/api";
import { Settings, LogOut, X, RefreshCw, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileContainer() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("messages");
  const [showSettings, setShowSettings] = useState(false);
  
  // --- NOUVEAUX ÉTATS ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ followingCount: 0, followersCount: 0 });
  const [userTweets, setUserTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mode Édition
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  // --- DÉCONNEXION ---
  const handleLogout = async () => {
    try {
      await logoutApi(); // Prévient le backend de détruire le cookie
    } catch (err) {
      console.error("Erreur lors de la déconnexion", err);
    } finally {
      router.push("/login"); // Redirige l'utilisateur
    }
  };

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      try {
        setLoading(true);
        const userProf = await getCurrentUserProfile();
        
        if (userProf && isMounted) {
          setProfile(userProf);
          setEditBio(userProf.bio || "");
          setEditAvatarUrl(userProf.avatar_url || "");

          const [tweetsData, followStats] = await Promise.all([
            // TRÈS IMPORTANT : On utilise id_auth car c'est lui qui lie le auth-service au post-service
            getUserPosts(userProf.id_auth),
            getUserFollowStats(userProf.id_auth)
          ]);

          setUserTweets(tweetsData);
          setStats(followStats);
        }
      } catch (err) {
        console.error("Failed to load profile stream data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();
    return () => { isMounted = false; };
  }, []);

  // --- SAUVEGARDE DU PROFIL ---
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updatedProfile = await updateUserProfile(editBio, editAvatarUrl);
      setProfile(updatedProfile);
      
      // Mettre à jour l'avatar sur les tweets affichés
      setUserTweets(current => current.map(t => ({
        ...t,
        user: { ...t.user, avatarUrl: updatedProfile.avatar_url || undefined }
      })));
      
      setIsEditing(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du profil:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsSaving(true);
      const uploadResult = await uploadMediaApi(file);
      setEditAvatarUrl(uploadResult.url);
    } catch (err) {
      console.error("Erreur upload avatar:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- GESTION DES POSTS ---
  const handleLikeToggle = async (tweetId: string) => {
    let updatedIsLiked = false;
    let updatedCount = 0;
    setUserTweets((current) => current.map((tweet) => {
      if (tweet.id === tweetId) {
        updatedIsLiked = !tweet.isLiked;
        updatedCount = updatedIsLiked ? tweet.likeCount + 1 : tweet.likeCount - 1;
        return { ...tweet, isLiked: updatedIsLiked, likeCount: updatedCount };
      }
      return tweet;
    }));
    try {
      const { likeTweetApi } = await import("@/utils/api");
      await likeTweetApi(tweetId, updatedIsLiked, updatedCount);
    } catch (err) { console.error(err); }
  };

  const handleRetweetToggle = async (tweetId: string) => {
    let updatedIsRetweeted = false;
    let updatedCount = 0;
    setUserTweets((current) => current.map((tweet) => {
      if (tweet.id === tweetId) {
        updatedIsRetweeted = !tweet.isRetweeted;
        updatedCount = updatedIsRetweeted ? tweet.retweetCount + 1 : Math.max(0, tweet.retweetCount - 1);
        return { ...tweet, isRetweeted: updatedIsRetweeted, retweetCount: updatedCount };
      }
      return tweet;
    }));
    try {
      const { retweetTweetApi } = await import("@/utils/api");
      await retweetTweetApi(tweetId, updatedIsRetweeted, updatedCount);
    } catch (err) { console.error(err); }
  };

  const handleFollowToggle = () => { /* Non applicable sur son propre profil */ };

  const handleConfirmDelete = async () => {
    if (!tweetToDelete) return;
    try {
      setUserTweets((current) => current.filter((t) => t.id !== tweetToDelete));
      await deleteTweetApi(tweetToDelete);
    } catch (err) { console.error(err); } finally { setTweetToDelete(null); }
  };

  // --- RENDU ---
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
        
        {/* HEADER PROFIL */}
        <div className="flex justify-between items-end px-5 pt-[35px] pb-4 w-full bg-transparent">
          
          {/* AVATAR */}
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleAvatarUpload}
              aria-label="Modifier la photo de profil"
              title="Modifier la photo de profil"
            />
            {editAvatarUrl || profile.avatar_url ? (
               <div 
                 className={`w-[84px] h-[84px] shrink-0 rounded-full bg-white shadow-[0_0_0_4px_#FFFFFF] overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
                 onClick={() => isEditing && fileInputRef.current?.click()}
                 title={isEditing ? "Cliquez pour modifier l'avatar" : undefined}
               >
                 <img src={editAvatarUrl || profile.avatar_url} alt={`Avatar de ${profile.username}`} className="w-full h-full object-cover" />
                 {isEditing && (
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                     <Camera size={24} className="text-white" />
                   </div>
                 )}
               </div>
            ) : (
              <div 
                className={`w-[84px] h-[84px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[33.6px] shadow-[0_0_0_4px_#FFFFFF] ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && fileInputRef.current?.click()}
                title={isEditing ? "Cliquez pour modifier l'avatar" : undefined}
              >
                {profile.username.substring(0, 2).toUpperCase()}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                    <Camera size={24} className="text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-[30px] w-full max-w-[375px]">
            <button 
              type="button" 
              onClick={() => setShowSettings(true)}
              aria-label="Ouvrir les paramètres"
              title="Ouvrir les paramètres"
              className="w-[34px] h-[34px] flex items-center justify-center text-breezy-dark hover:text-breezy-blue hover:bg-white/50 rounded-full transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <Settings size={24} />
            </button>

            {!isEditing && (
              <button 
                type="button"
                onClick={() => setIsEditing(true)}
                aria-label="Modifier le profil"
                title="Modifier le profil"
                className="px-4 h-[36px] border border-[#CDD9E6] bg-white hover:bg-gray-50 text-breezy-dark font-bold text-[14px] rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 select-none"
              >
                Modifier le profil
              </button>
            )}
          </div>
        </div>

        {/* INFOS UTILISATEUR */}
        <div className="flex flex-col gap-3.5 w-full pb-[15px]">
          <div className="flex flex-col text-left px-5">
            <h2 className="text-[21px] font-extrabold text-breezy-dark tracking-tight leading-[25px]">
              @{profile.username}
            </h2>
          </div>

          {/* MODE ÉDITION VS MODE LECTURE */}
          {isEditing ? (
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
                aria-label="Modifier votre biographie"
                title="Modifier votre biographie"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)} 
                  aria-label="Annuler les modifications"
                  title="Annuler les modifications"
                  className="px-4 h-[32px] rounded-full border border-[#CDD9E6] text-[13px] font-bold text-breezy-gray hover:bg-gray-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="button"
                  onClick={handleSaveProfile} 
                  disabled={isSaving} 
                  aria-label="Enregistrer le profil"
                  title="Enregistrer le profil"
                  className="px-4 h-[32px] rounded-full bg-breezy-blue hover:bg-breezy-darkBlue text-white text-[13px] font-bold disabled:opacity-50 cursor-pointer border-none"
                >
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

        {/* ONGLETS */}
        <div className="flex justify-between items-center px-5 h-[44px] w-full bg-transparent border-b border-breezy-border-light">
          {["messages", "responses", "medias"].map(tab => (
            <button 
              key={tab} 
              type="button" 
              onClick={() => setActiveTab(tab)}
              aria-label={`Voir l'onglet ${tab}`}
              title={`Voir l'onglet ${tab}`}
              className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative border-none bg-transparent ${activeTab === tab ? "text-breezy-dark font-extrabold" : "text-breezy-gray font-semibold hover:text-breezy-dark"}`}
            >
              <span className="capitalize">{tab === "messages" ? "Messages" : tab === "responses" ? "Réponses" : "Médias"}</span>
              {activeTab === tab && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-breezy-blue" />}
            </button>
          ))}
        </div>

        {/* CONTENU ONGLETS */}
        <div className="w-full text-left">
          {activeTab === "messages" && (
            userTweets.length > 0 ? (
              userTweets.map((tweet) => (
                <TweetCard
                  key={tweet.id}
                  tweet={tweet}
                  onLike={handleLikeToggle}
                  onRetweet={handleRetweetToggle}
                  onFollow={handleFollowToggle}
                  onDelete={() => setTweetToDelete(tweet.id)}
                  isOwnTweet={true}
                />
              ))
            ) : (
              <div className="text-center p-8 text-breezy-gray text-[14.5px]">Aucun message à afficher.</div>
            )
          )}
          {activeTab === "responses" && <div className="text-center p-8 text-breezy-gray text-[14.5px]">Aucune réponse à afficher.</div>}
          {activeTab === "medias" && <div className="text-center p-8 text-breezy-gray text-[14.5px]">Aucun média disponible.</div>}
        </div>
      </div>

      {/* BOUTON FLOTTANT & NAVIGATION */}
      <button 
        type="button" 
        onClick={() => setShowCompose(true)} 
        aria-label="Créer un nouveau post"
        title="Créer un nouveau post"
        className="absolute bottom-24 right-6 w-[56px] h-[56px] bg-breezy-blue hover:bg-breezy-darkBlue text-white rounded-full flex items-center justify-center shadow-xl z-30 font-bold text-2xl cursor-pointer transition-all active:scale-95 border-none"
      >
        +
      </button>

      <NavBar activePage="profile" />

      {/* MODALES */}
      <ConfirmationModal
        isOpen={tweetToDelete !== null}
        title="Supprimer le message ?"
        message="Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setTweetToDelete(null)}
      />

      {showCompose && <ComposeModal onClose={() => { setShowCompose(false); window.location.reload(); }} />}

      {showSettings && (
        <>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity" onClick={() => setShowSettings(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-8 z-[60] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex flex-col gap-4 animate-in slide-in-from-bottom">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-[19px] font-extrabold text-breezy-dark">Options</h3>
              <button 
                type="button" 
                onClick={() => setShowSettings(false)} 
                aria-label="Fermer les options"
                title="Fermer les options"
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-breezy-gray cursor-pointer border-none"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex flex-col w-full pt-1">
              <button 
                type="button"
                onClick={handleLogout}
                aria-label="Se déconnecter de l'application"
                title="Se déconnecter"
                className="flex items-center gap-4 w-full p-4 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-xl transition-all cursor-pointer select-none group border-none bg-transparent text-left"
              >
                <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-bold text-[16px]">Se déconnecter</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}