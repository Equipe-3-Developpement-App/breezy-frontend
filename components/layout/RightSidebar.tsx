"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hash, Search } from "lucide-react";
import { getAllUsers, getFollowingIds, fetchCurrentUser, UserProfile } from "@/utils/api";

export function RightSidebar() {
  const router = useRouter();
  const trendingTags = ["design", "nextjs", "breezy", "frontend", "dev", "mobile"];
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadSuggestions = async () => {
      try {
        const [users, currentUser] = await Promise.all([
          getAllUsers(),
          fetchCurrentUser()
        ]);

        if (currentUser && isMounted) {
          const myFollowingIds = await getFollowingIds(currentUser.id);
          const stringFollowingIds = myFollowingIds.map(String);

          const filteredUsers = users.filter(user => {
            const userIdStr = user.id_auth.toString();
            return userIdStr !== currentUser.id.toString() && !stringFollowingIds.includes(userIdStr);
          });

          const shuffled = [...filteredUsers].sort(() => 0.5 - Math.random());
          setSuggestedUsers(shuffled.slice(0, 3));
        }
      } catch (err) {
        console.error("Erreur lors du chargement des suggestions", err);
      }
    };

    loadSuggestions();

    return () => { isMounted = false; };
  }, []);

  return (
    <aside className="hidden xl:flex fixed top-0 bottom-0 right-0 w-[290px] h-screen bg-transparent border-l border-breezy-border-light z-40 flex-col px-6 pt-6 gap-6 overflow-y-auto no-scrollbar">
      
      <div 
        onClick={() => router.push("/search")}
        className="flex items-center gap-3 w-full h-[42px] bg-gray-100 border border-transparent hover:border-breezy-blue text-breezy-gray rounded-full px-4 cursor-pointer transition-all"
      >
        <Search size={18} />
        <span className="text-[14.5px] text-breezy-gray/70">Recherche...</span>
      </div>

      <div className="w-full bg-gray-50/70 border border-breezy-border-light rounded-[20px] p-4 flex flex-col gap-3.5">
        <h3 className="font-extrabold text-[17px] text-breezy-dark tracking-tight m-0">
          Tendances pour vous
        </h3>
        <div className="flex flex-col gap-3">
          {trendingTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => router.push(`/search?tag=${encodeURIComponent(tag)}`)}
              className="flex items-center justify-between w-full text-left bg-transparent border-none p-0 cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-breezy-dark group-hover:text-breezy-blue transition-colors">
                <Hash size={16} className="text-breezy-gray shrink-0" />
                <span className="text-[14.5px] font-bold">#{tag}</span>
              </div>
              <span className="text-[12px] text-breezy-gray">Populaire</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full bg-gray-50/70 border border-breezy-border-light rounded-[20px] p-4 flex flex-col gap-3.5">
        <h3 className="font-extrabold text-[17px] text-breezy-dark tracking-tight m-0">
          Suggestions d'abonnements
        </h3>
        <div className="flex flex-col gap-3">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <button
                key={user.id_user}
                type="button"
                onClick={() => router.push(`/profile/${user.id_auth}`)}
                className="flex items-center gap-3 w-full text-left bg-transparent border-none p-0 cursor-pointer group"
              >
                {user.avatar_url ? (
                  <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-white shrink-0">
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[13px] shrink-0">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col truncate">
                  <span className="text-[14px] font-bold text-breezy-dark group-hover:text-breezy-blue transition-colors truncate">
                    @{user.username}
                  </span>
                  <span className="text-[11px] text-breezy-gray truncate"> Voir le profil</span>
                </div>
              </button>
            ))
          ) : (
            <span className="text-[13px] text-breezy-gray">Aucune suggestion disponible</span>
          )}
        </div>
      </div>

    </aside>
  );
}