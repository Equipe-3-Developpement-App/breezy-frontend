import Link from "next/link";
import { TweetList } from "../components/TweetList";
import { Home as HomeIcon, Search, Bell, Mail, User, Wind } from "lucide-react";

export default function Home() {
  return (
    // Center container for the app mockup on your PC screen
    <div className="flex justify-center items-center bg-gray-900 min-h-screen w-full p-4">

      {/* Feed page container (fake phone frame) -> width: 499px, mobile-style layout */}
      <main className="relative flex flex-col w-full max-w-[499px] h-[900px] bg-[#EEF4FA] shadow-2xl rounded-3xl overflow-hidden border border-gray-800">

        {/* 1. Header -> translucent background with blur and padding */}
        {/* 1. Header -> Lucide icons integrated */}
        <header className="flex justify-between items-center px-[18px] pt-[35px] pb-[20px] bg-[#EEF4FA]/80 backdrop-blur-md z-10 border-b border-gray-200/50 w-full">
          <div className="flex items-center gap-2 font-extrabold text-[19px] text-[#16212E] tracking-tight">
            <Wind size={20} className="text-[#2A6FDB]" strokeWidth={2.5} />
            <span>Breezy</span>
          </div>
          <button type="button" aria-label="Recherche" title="Recherche" className="text-[#5C708A] hover:text-[#2A6FDB] hover:scale-110 transition cursor-pointer">
            <Search size={20} strokeWidth={2} />
          </button>
        </header>

        {/* 2. Compose bar -> white input area for new tweets */}
        <div className="flex items-start p-4 bg-white gap-3 border-b border-[#E2EAF2] z-10">
          <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-gradient-to-br from-[#D2D2D2] to-[#767676] flex items-center justify-center font-bold text-white text-[16px]">
            KL
          </div>
          <div className="flex-1 pt-2">
            <input
              type="text"
              placeholder="Comment ça va ?"
              className="w-full bg-transparent outline-none text-[15px] text-[#16212E] placeholder-[#9AABBF]"
            />
          </div>
        </div>

        <TweetList />

        {/* 4. FloatingComposeButton -> Position absolue, fixé par dessus le flux */}
        <button type="button" aria-label="Créer un tweet" className="absolute bottom-24 right-6 w-[56px] h-[56px] bg-[#2A6FDB] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-blue-700 active:scale-95 transition-all z-30 font-bold text-2xl cursor-pointer">
          +
        </button>

        {/* 5. NavBar -> Fixed en bas de l'écran */}
        <nav className="absolute bottom-0 left-0 right-0 h-[68px] flex justify-around items-center px-6 pb-4 pt-2 bg-white/95 backdrop-blur-sm border-t border-[#E2EAF2] z-20">
          <button type="button" aria-label="Accueil" className="text-[#2A6FDB] cursor-pointer hover:scale-110 transition">
            <HomeIcon size={22} strokeWidth={2.5} />
          </button>
          <button type="button" aria-label="Recherche" className="text-[#9AABBF] hover:text-[#2A6FDB] cursor-pointer hover:scale-110 transition">
            <Search size={22} strokeWidth={2} />
          </button>
          <button type="button" aria-label="Notifications" className="text-[#9AABBF] hover:text-[#2A6FDB] cursor-pointer hover:scale-110 transition">
            <Bell size={22} strokeWidth={2} />
          </button>
          <button type="button" aria-label="Messages" className="text-[#9AABBF] hover:text-[#2A6FDB] cursor-pointer hover:scale-110 transition">
            <Mail size={22} strokeWidth={2} />
          </button>
          <Link href="/profile" aria-label="Profil" className="text-[#9AABBF] hover:text-[#2A6FDB] cursor-pointer hover:scale-110 transition">
            <User size={22} strokeWidth={2} />
          </Link>
        </nav>

      </main>

    </div>
  );
}