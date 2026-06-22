import { User } from "@/types";

interface UserCardProps {
  user: User;
  isFollowing: boolean;
  onFollow: (userId: string) => void;
}

export function UserCard({ user, isFollowing, onFollow }: UserCardProps) {
  return (
    <div className="flex p-4 bg-breezy-bgLight border-b border-breezy-border-light w-full text-left hover:bg-gray-50/50 transition-colors cursor-pointer">
      
      <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[16.8px]">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
        ) : (
          user.displayName.substring(0, 2).toUpperCase()
        )}
      </div>

      <div className="flex flex-col justify-center ml-3 w-full">
        <div className="flex justify-between items-center w-full">
          
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[14.5px] text-breezy-dark">{user.displayName}</span>
            <span className="text-[13px] text-breezy-gray">@{user.username}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFollow(user.id);
            }}
            className={`px-3 py-1 text-[13px] font-bold rounded-full transition-all duration-200 ease-in-out shrink-0 cursor-pointer active:scale-95 border select-none
              ${isFollowing
                ? "bg-breezy-blue border-breezy-blue text-white hover:bg-breezy-darkBlue hover:border-breezy-darkBlue"
                : "bg-transparent border-breezy-blue text-breezy-blue hover:bg-breezy-blue/10"}`}
          >
            {isFollowing ? "Suivi" : "Suivre"}
          </button>
        </div>
      </div>

    </div>
  );
}