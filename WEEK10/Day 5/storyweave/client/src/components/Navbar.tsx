import { Link } from "react-router-dom";
import type { User } from "../types";

export default function Navbar({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-10">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          Story<span className="text-primary">Weave</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/" className="btn btn-ghost btn-sm">Feed</Link>
        <Link to="/new" className="btn btn-primary btn-sm">+ New story</Link>
        {user && (
          <>
            <Link to={`/profile/${user.username}`} className="flex items-center gap-2 btn btn-ghost btn-sm">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                : <span className="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">{user.username[0]?.toUpperCase()}</span>}
              <span className="hidden sm:inline">{user.username}</span>
            </Link>
            <button onClick={onLogout} className="btn btn-ghost btn-sm">Logout</button>
          </>
        )}
      </div>
    </div>
  );
}
