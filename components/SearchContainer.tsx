"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { NavBar } from "./layout/NavBar";
import { TweetCard } from "./tweets/TweetCard";
import { Tweet } from "@/types";
import { searchTweetsByTag } from "@/utils/api";
import { Search, Hash, RefreshCw, X } from "lucide-react";

export function SearchContainer() {
  const searchParams = useSearchParams();
  const tagFromUrl = searchParams.get("tag") || "";

  const [query, setQuery] = useState(tagFromUrl);
  const [results, setResults] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);

  const trendingTags = ["design", "nextjs", "breezy", "frontend", "dev", "mobile"];

  // Synchronise la query si le paramètre URL change (clic sur un tag d'un post)
  useEffect(() => {
    setQuery(tagFromUrl);
  }, [tagFromUrl]);

  useEffect(() => {
    let isMounted = true;

    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchTweetsByTag(query);
        if (isMounted) setResults(data);
      } catch (err) {
        console.error("Erreur de recherche :", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [query]);

  const handleNoop = () => {};

  return (
    <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-breezy-bgLight">

      <header className="px-[18px] pt-[35px] pb-[15px] bg-white border-b border-breezy-border-light z-10 shrink-0">
        <div className="relative flex items-center w-full h-[40px] bg-gray-100 rounded-full px-4 border border-transparent focus-within:border-breezy-blue transition-colors">
          <Search size={18} className="text-breezy-gray shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un tag (ex: design)"
            className="flex-1 bg-transparent border-none outline-none ml-3 text-[15px] text-breezy-dark placeholder-breezy-gray/70"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              title="Effacer la recherche"
              aria-label="Effacer la recherche"
              className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full text-breezy-gray cursor-pointer transition-colors border-none"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-[68px] no-scrollbar">

        {/* État 1 : Aucune recherche — suggestions */}
        {!query.trim() && (
          <div className="p-5 flex flex-col gap-4">
            <h2 className="font-extrabold text-[19px] text-breezy-dark tracking-tight">Tendances</h2>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-breezy-border-light rounded-full text-[14.5px] font-bold text-breezy-blue hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Hash size={16} /> {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* État 2 : Chargement */}
        {query.trim() && loading && (
          <div className="flex justify-center p-8">
            <RefreshCw className="animate-spin text-breezy-blue" size={24} />
          </div>
        )}

        {/* État 3 : Résultats */}
        {query.trim() && !loading && results.length > 0 && (
          <div className="flex flex-col">
            <p className="px-4 py-2 text-[13px] text-breezy-gray border-b border-breezy-border-light">
              {results.length} résultat{results.length > 1 ? "s" : ""} pour{" "}
              <span className="text-breezy-blue font-bold">#{query.replace(/^#/, "")}</span>
            </p>
            {results.map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                onLike={handleNoop}
                onRetweet={handleNoop}
                onFollow={handleNoop}
              />
            ))}
          </div>
        )}

        {/* État 4 : Aucun résultat */}
        {query.trim() && !loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center text-breezy-gray gap-2">
            <Hash size={40} className="text-gray-300 opacity-50" />
            <p className="text-[15px] font-semibold text-breezy-dark">Aucun résultat pour #{query}</p>
            <p className="text-[14px]">Essayez un autre mot-clé.</p>
          </div>
        )}
      </div>

      <NavBar activePage="search" />
    </div>
  );
}