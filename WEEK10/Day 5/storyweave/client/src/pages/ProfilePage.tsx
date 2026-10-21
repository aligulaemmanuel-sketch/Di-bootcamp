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
    const result = await dispatch(updateProfile({ bio }));
    if (updateProfile.fulfilled.match(result)) {
      setProfile((p) => (p ? { ...p, bio: result.payload.user.bio } : p));
    }
  }

  if (!profile) return <p className="text-center py-16 text-base-content/50">Loading profile…</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card bg-base-100 shadow p-6">
        <div className="flex items-center gap-4">
          {profile.avatarUrl
            ? <img src={profile.avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
            : <span className="w-20 h-20 rounded-full bg-primary text-primary-content flex items-center justify-center text-3xl">
                {profile.username[0]?.toUpperCase()}
              </span>}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-sm text-base-content/60">
              Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>

        {isMe ? (
          <div className="mt-4 space-y-3">
            <textarea className="textarea textarea-bordered w-full" rows={2} maxLength={300}
              placeholder="Tell other writers about yourself…" value={bio} onChange={(e) => setBio(e.target.value)} />
            <div className="flex items-center gap-4 flex-wrap">
              <button className="btn btn-primary btn-sm" onClick={saveBio}>Save bio</button>
              <AvatarUpload onUploaded={(url) => dispatch(updateProfile({ avatarUrl: url }))} />
            </div>
          </div>
        ) : (
          <p className="mt-4 text-base-content/80 whitespace-pre-line">{profile.bio || "This writer hasn't added a bio yet."}</p>
        )}
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Stories by {profile.username}</h2>
      {stories.length === 0 ? (
        <p className="text-base-content/50 text-center py-10">
          No stories yet. {isMe && <Link to="/new" className="link link-primary">Write your first one</Link>}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {stories.map((s) => <StoryCard key={s.id} story={s} />)}
        </div>
      )}
    </div>
  );
}
