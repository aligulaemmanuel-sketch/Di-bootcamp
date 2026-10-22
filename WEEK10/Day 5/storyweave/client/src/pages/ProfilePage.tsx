import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateProfile } from "../store/authSlice";
import AvatarUpload from "../components/AvatarUpload";
import StoryCard from "../components/StoryCard";
import type { Story, User } from "../types";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.auth.user);
  const [profile, setProfile] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [bio, setBio] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [profileError, setProfileError] = useState<string | null>(null);

  const isMe = me?.username === username;

  useEffect(() => {
    if (!username) return;
    api.get(`/users/${username}`).then(({ data }) => {
      setProfile(data.user);
      setStories(data.stories);
      setBio(data.user.bio ?? "");
    });
  }, [username]);

  async function saveBio() {
    setProfileError(null);
    setSaveState("saving");
    const result = await dispatch(updateProfile({ bio }));
    if (updateProfile.fulfilled.match(result)) {
      setProfile((p) => (p ? { ...p, bio: result.payload.user.bio } : p));
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2200);
    } else {
      setSaveState("failed");
      setProfileError(result.payload as string);
    }
  }

  if (!profile) return <p className="text-center py-16 text-base-content/50">Loading profile…</p>;

  return (
    <div className="profile-page">
      <section
        className="profile-cover"
        aria-label={`Profile cover for ${profile.username}`}
        style={profile.coverImageUrl ? {
          backgroundImage: `linear-gradient(180deg, rgb(16 27 21 / 4%) 0%, rgb(17 31 24 / 14%) 36%, rgb(19 34 26 / 70%) 100%), url("${profile.coverImageUrl}")`,
        } : undefined}
      >
        <div className="profile-cover-glass">
          <div className="profile-identity">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt={`${profile.username}'s avatar`} className="profile-avatar-large" />
              : <span className="profile-avatar-large profile-avatar-initial">{profile.username[0]?.toUpperCase()}</span>}
            <div className="profile-title">
              <span className="profile-kicker"><span className="eyebrow-dot" /> STORYWEAVE WRITER</span>
              <h1>{profile.username}</h1>
              <p>Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "A new chapter"}</p>
            </div>
            {isMe && <span className="profile-edit-badge">Your profile</span>}
          </div>
          <p className="profile-bio">{profile.bio || (isMe ? "Every writer has a story. Tell the community a little about yours." : "This writer is letting their stories speak for themselves.")}</p>
          <div className="profile-stats">
            <div><strong>{stories.length}</strong><span>{stories.length === 1 ? "Story" : "Stories"}</span></div>
            <div><strong>{new Set(stories.map((story) => story.genre)).size}</strong><span>Genres explored</span></div>
            <div><strong>{stories.reduce((total, story) => total + (story._count?.comments ?? 0), 0)}</strong><span>Reader notes</span></div>
          </div>
        </div>
      </section>

      <div className="profile-content">
        {isMe && (
          <section className="profile-edit-card">
            <div className="profile-section-heading">
              <div><span className="eyebrow">YOUR LITTLE CORNER</span><h2>Make it yours</h2></div>
            </div>
            <div className="profile-cover-editor">
              <div className="profile-cover-preview" style={profile.coverImageUrl ? {
                backgroundImage: `linear-gradient(180deg, rgb(16 27 21 / 4%) 0%, rgb(19 34 26 / 54%) 100%), url("${profile.coverImageUrl}")`,
              } : undefined}>
                <span>PROFILE COVER</span>
                <strong>{profile.coverImageUrl ? "Your photo is ready" : "A little scenery for your stories"}</strong>
              </div>
              <div className="profile-cover-controls">
                <p>Choose a wide photo to make the top of your profile feel like your own story.</p>
                <div className="profile-cover-actions">
                  <AvatarUpload kind="cover" onUploaded={async (url) => {
                    setProfileError(null);
                    const result = await dispatch(updateProfile({ coverImageUrl: url }));
                    if (updateProfile.fulfilled.match(result)) {
                      setProfile((current) => current ? { ...current, coverImageUrl: result.payload.user.coverImageUrl } : current);
                    } else {
                      setProfileError(result.payload as string);
                    }
                  }} />
                  {profile.coverImageUrl && (
                    <button className="profile-remove-cover" onClick={async () => {
                      setProfileError(null);
                      const result = await dispatch(updateProfile({ coverImageUrl: null }));
                      if (updateProfile.fulfilled.match(result)) {
                        setProfile((current) => current ? { ...current, coverImageUrl: null } : current);
                      } else {
                        setProfileError(result.payload as string);
                      }
                    }}>Use default cover</button>
                  )}
                </div>
                <span className="profile-cover-hint">JPG, PNG, or WebP · up to 10 MB</span>
              </div>
            </div>
            <label className="profile-bio-label">
              <span>A few words about you</span>
              <textarea className="textarea textarea-bordered profile-bio-input" rows={3} maxLength={300}
                placeholder="What do you love to write? What inspires you?" value={bio} onChange={(e) => setBio(e.target.value)} />
              <span className="profile-char-count">{bio.length}/300</span>
            </label>
            <div className="profile-edit-actions">
              <AvatarUpload onUploaded={async (url) => {
                setProfileError(null);
                const result = await dispatch(updateProfile({ avatarUrl: url }));
                if (updateProfile.fulfilled.match(result)) {
                  setProfile((current) => (current ? { ...current, avatarUrl: result.payload.user.avatarUrl } : current));
                } else {
                  setProfileError(result.payload as string);
                }
              }} />
              <button className="btn btn-primary profile-save-button" onClick={saveBio} disabled={saveState === "saving"}>
                {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Save profile"}
              </button>
              {profileError && <span className="form-error" role="alert">{profileError}</span>}
            </div>
          </section>
        )}

        <section className="profile-stories">
          <div className="profile-section-heading">
            <div><span className="eyebrow">FROM THE NOTEBOOK</span><h2>Stories by {profile.username}</h2></div>
            {isMe && <Link to="/new" className="profile-write-link">New story</Link>}
          </div>
          {stories.length === 0 ? (
            <div className="profile-empty">
              <h3>The first page is still blank.</h3>
              <p>Every favorite story starts with one brave little sentence.</p>
              {isMe && <Link to="/new" className="btn btn-primary">Write your first story</Link>}
            </div>
          ) : (
            <div className="story-grid profile-story-grid">
              {stories.map((s) => <StoryCard key={s.id} story={s} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
