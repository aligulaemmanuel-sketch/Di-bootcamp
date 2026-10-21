import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchStory } from "../store/storiesSlice";
import { api } from "../api";
import CommentSection from "../components/CommentSection";
import VersionHistory from "../components/VersionHistory";
import ShareButtons from "../components/ShareButtons";
import type { CollaboratorRole } from "../types";

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { current: story, myRole } = useAppSelector((s) => s.stories);
  const me = useAppSelector((s) => s.auth.user);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (id) dispatch(fetchStory(id)); }, [id, dispatch]);

  if (!story) return <p className="text-center py-16 text-base-content/50">Loading…</p>;

  const isOwner = myRole === "OWNER";
  const isEditor = myRole === "OWNER" || myRole === "EDITOR";

  async function toggleComments() {
    try {
      await api.patch(`/stories/${story!.id}`, { commentsEnabled: !story!.commentsEnabled });
      dispatch(fetchStory(story!.id));
    } catch (e: any) {
      setError(e.response?.data?.error ?? "Update failed");
    }
  }

  async function addCollaborator(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") || "");
    const role = String(form.get("role") || "EDITOR") as CollaboratorRole;
    if (!username.trim()) return;
    const { addCollaborator: add } = await import("../store/storiesSlice");
    const result = await dispatch(add({ id: story!.id, username: username.trim(), role }));
    if (!add.fulfilled.match(result)) setError(result.payload as string);
    else (e.target as HTMLFormElement).reset();
  }

  return (
    <article className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-outline">{story.genre}</span>
            {myRole && <span className="badge badge-primary badge-outline">{myRole}</span>}
          </div>
          <h1 className="text-3xl font-bold mt-2">{story.title}</h1>
          <p className="text-sm text-base-content/60 mt-1">
            by <Link to={`/profile/${story.author.username}`} className="link">{story.author.username}</Link>
            {" · "}updated {new Date(story.updatedAt).toLocaleDateString()}
          </p>
        </div>
        {isEditor && (
          <Link to={`/story/${story.id}/edit`} className="btn btn-primary btn-sm shrink-0">Open editor</Link>
        )}
      </div>

      {error && <p className="text-error text-sm mt-2">{error}</p>}

      <div className="bg-base-100 rounded-xl shadow-sm p-6 mt-6 whitespace-pre-line leading-relaxed min-h-[200px]">
        {story.content || <span className="text-base-content/40 italic">This story is still a blank page.</span>}
      </div>

      <div className="mt-6 space-y-4">
        <ShareButtons shareToken={(story as any).shareToken} title={story.title} />

        {isOwner && (
          <div className="card bg-base-100 shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Comments</span>
              <button className={`btn btn-xs ${story.commentsEnabled ? "btn-primary" : "btn-ghost"}`} onClick={toggleComments}>
                {story.commentsEnabled ? "Enabled — click to disable" : "Disabled — click to enable"}
              </button>
            </div>
            <form onSubmit={addCollaborator} className="flex gap-2 items-end flex-wrap">
              <span className="text-sm font-medium w-full">Add collaborator</span>
              <input name="username" className="input input-bordered input-sm flex-1" placeholder="username" required />
              <select name="role" className="select select-bordered select-sm">
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button className="btn btn-sm btn-outline">Add</button>
            </form>
            <p className="text-xs text-base-content/50">
              Collaborators: {story.collaborators.map((c) => `${c.user.username} (${c.role})`).join(", ")}
            </p>
          </div>
        )}
      </div>

      <CommentSection storyId={story.id} commentsEnabled={story.commentsEnabled} canModerate={isOwner} />
      {isEditor && <VersionHistory storyId={story.id} myRole={myRole} />}
    </article>
  );
}
