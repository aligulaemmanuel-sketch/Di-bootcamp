import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { User } from "../types";

export default function Navbar({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    closeMenu();
    onLogout();
  }

  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <Link to="/" className="app-brand" aria-label="StoryWeave home" onClick={closeMenu}>
          <span className="wordmark-icon" aria-hidden="true">s</span>
          storyweave<span className="wordmark-period">.</span>
        </Link>
        <button
          type="button"
          className={`app-menu-toggle ${menuOpen ? "app-menu-toggle-open" : ""}`}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="app-primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav id="app-primary-navigation" className={`app-nav-links ${menuOpen ? "app-nav-links-open" : ""}`} aria-label="Main navigation">
          <Link to="/" className={`app-nav-link ${location.pathname === "/" ? "app-nav-link-active" : ""}`} onClick={closeMenu}>My stories</Link>
          <Link to="/new" className="btn btn-primary app-new-story" onClick={closeMenu}><span aria-hidden="true">＋</span> <span>New story</span></Link>
          {user && (
            <>
              <Link to={`/profile/${user.username}`} className={`profile-nav-link ${location.pathname === `/profile/${user.username}` ? "profile-nav-link-active" : ""}`} aria-label={`Profile: ${user.username}`} onClick={closeMenu}>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt="" className="profile-nav-avatar" />
                  : <span className="profile-nav-avatar profile-nav-initial">{user.username[0]?.toUpperCase()}</span>}
                <span className="profile-nav-name">{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="app-logout">Log out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
