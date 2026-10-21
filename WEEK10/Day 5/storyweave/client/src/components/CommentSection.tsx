import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { getSocket, connectSocket } from "../socket";
import { useAppSelector } from "../store/hooks";
import type { CommentItem } from "../types";

const EMOJIS = ["👍", "❤️", "😂", "🎉"];

export default function CommentSection({
  storyId,
  commentsEnabled,
  canModerate,
}: {
  storyId: string;
  commentsEnabled: boolean;
  canModerate: boolean;
}) {
  const me = useAppSelector((s) => s.auth.user);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const load = useCallback(async () => {
    const { data } = await api.get(`/stories/${storyId}/comments`);
    setComments(data.comments);
  }, [storyId]);

  useEffect(() => {
    load();
    const socket = connectSocket();
    const onRefresh = () => load();
    socket.on("comment:refresh", onRefresh);
    return () => { socket.off("comment:refresh", onRefresh); };
  }, [load]);

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    await api.post(`/stories/${storyId}/comments`, { content: draft.trim() });
    setDraft("");
    load(); // socket broadcasts to others; local refresh keeps it snappy
  }

  async function saveEdit(id: string) {
    await api.patch(`/comments/${id}`, { content: editDraft });
    setEditingId(null);
    load();
  }

  async function removeComment(id: string) {
    if (!confirm("Delete this comment?")) return;
    await api.delete(`/comments/${id}`);
    load();
  }

  async function toggleReaction(id: string, emoji: string) {
    await api.post(`/comments/${id}/reactions`, { emoji });
    load();
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">Comments</h2>

      {!commentsEnabled && <p className="text-sm text-base-content/60 mb-4">Comments are disabled for this story.</p>}

      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="bg-base-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{c.author.username}</span>
              <span className="text-xs text-base-content/50">{new Date(c.createdAt).toLocaleString()}</span>
            </div>

            {editingId === c.id ? (
              <div className="mt-2 flex gap-2">
                <input className="input input-bordered input-sm flex-1" value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)} />
                <button className="btn btn-sm btn-primary" onClick={() => saveEdit(c.id)}>Save</button>
              </div>
            ) : (
              <p className="mt-1 text-sm whitespace-pre-line">{c.content}</p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {EMOJIS.map((emoji) => {
                const reactors = c.reactions.filter((r) => r.emoji === emoji);
                const mine = reactors.some((r) => r.userId === me?.id);
                return (
                  <button key={emoji} onClick={() => toggleReaction(c.id, emoji)}
                    className={`btn btn-xs ${mine ? "btn-primary" : "btn-ghost"}`}
                    title={reactors.map((r) => r.user.username).join(", ")}>
                    {emoji} {reactors.length > 0 && reactors.length}
                  </button>
                );
              })}
              <span className="flex-1" />
              {me?.id === c.author.id && (
                <button className="btn btn-xs btn-ghost" onClick={() => { setEditingId(c.id); setEditDraft(c.content); }}>Edit</button>
              )}
              {(me?.id === c.author.id || canModerate) && (
                <button className="btn btn-xs btn-ghost text-error" onClick={() => removeComment(c.id)}>Delete</button>
              )}
            </div>
          </li>
        ))}
        {comments.length === 0 && commentsEnabled && <p className="text-sm text-base-content/50">No comments yet — start the conversation.</p>}
      </ul>

      {commentsEnabled && (
        <form onSubmit={addComment} className="mt-4 flex gap-2">
          <input className="input input-bordered flex-1" placeholder="Add a comment…"
            value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1000} />
          <button className="btn btn-primary">Post</button>
        </form>
      )}
    </section>
  );
}
