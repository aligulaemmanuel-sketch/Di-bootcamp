import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchStory, saveVersion, applyRemoteUpdate, clearCurrent } from "../store/storiesSlice";
import { connectSocket } from "../socket";
import VersionHistory from "../components/VersionHistory";
import type { PresenceUser } from "../types";

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const story = useAppSelector((s) => s.stories.current);
  const myRole = useAppSelector((s) => s.stories.myRole);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [cursors, setCursors] = useState<Record<string, PresenceUser & { position: number }>>({});
  const [versionLabel, setVersionLabel] = useState("");
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const isTypingRef = useRef(false);

  // Load story, then join the realtime room
  useEffect(() => {
    if (!id) return;
    dispatch(fetchStory(id)).then((result: any) => {
      if (fetchStory.fulfilled.match(result)) {
        setTitle(result.payload.story.title);
        setContent(result.payload.story.content);
      }
    });
    const socket = connectSocket();
    socket.emit("story:join", id, (res: any) => {
      if (res?.error) alert(res.error);
    });
    socket.on("presence", (users: PresenceUser[]) => setPresence(users));
    socket.on("story:updated", ({ title: t, content: c }: { title: string; content: string }) => {
      if (isTypingRef.current) return; // don't clobber local typing (last-write-wins demo)
      dispatch(applyRemoteUpdate({ title: t, content: c }));
      setTitle(t);
      setContent(c);
    });
    socket.on("cursor", (c: PresenceUser & { position: number }) => {
      setCursors((prev) => ({ ...prev, [c.userId]: c }));
    });
    return () => {
      socket.off("presence");
      socket.off("story:updated");
      socket.off("cursor");
      dispatch(clearCurrent());
    };
  }, [id, dispatch]);

  // Push edits to the server (debounced) and broadcast to collaborators
  function emitUpdate(nextTitle: string, nextContent: string) {
    const socket = connectSocket();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      socket.emit("story:update", { storyId: id, title: nextTitle, content: nextContent });
    }, 400);
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    emitUpdate(e.target.value, content);
  }

  function onContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    isTypingRef.current = true;
    setContent(e.target.value);
    emitUpdate(title, e.target.value);
    connectSocket().emit("cursor", { storyId: id, position: e.target.selectionStart });
    setTimeout(() => { isTypingRef.current = false; }, 800);
  }

  async function saveSnapshot() {
    if (!id) return;
    // flush any pending debounced edit first
    connectSocket().emit("story:update", { storyId: id, title, content });
    await dispatch(saveVersion({ id, label: versionLabel || undefined }));
    setVersionLabel("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!story) return <p className="text-center py-16 text-base-content/50">Loading editor…</p>;

  const others = presence.filter((p) => p.username);
  const readOnly = myRole === "VIEWER";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
        <Link to={`/story/${id}`} className="btn btn-ghost btn-sm">Back to story</Link>
        <div className="flex items-center gap-3">
          {saved && <span className="text-success text-sm">✓ Version saved</span>}
          <div className="flex -space-x-2">
            {others.map((p) => (
              <span key={p.userId + p.username} className="w-7 h-7 rounded-full text-white text-xs flex items-center justify-center border-2 border-base-100"
                style={{ background: p.color }} title={p.username}>
                {p.username[0]?.toUpperCase()}
              </span>
            ))}
          </div>
          <span className="text-xs text-base-content/60">{others.length} online</span>
        </div>
      </div>

      <input className="input input-ghost text-2xl font-bold w-full mb-2" value={title}
        onChange={onTitleChange} readOnly={readOnly} placeholder="Untitled story" maxLength={120} />

      <textarea ref={textareaRef} className="textarea textarea-bordered w-full h-[55vh] leading-relaxed font-mono"
        value={content} onChange={onContentChange} readOnly={readOnly}
        placeholder="Once upon a time…" />

      <p className="text-xs text-base-content/50 mt-2">
        {readOnly
          ? "You have view-only access to this story."
          : "Edits sync automatically to collaborators. Presence and cursors are shared live."}
        {Object.values(cursors).length > 0 && (
          <span className="ml-2">
            {Object.values(cursors).map((c) => (
              <span key={c.userId} style={{ color: c.color }} className="mr-2">
                {c.username} ⌁
              </span>
            ))}
          </span>
        )}
      </p>

      {!readOnly && (
        <div className="card bg-base-100 shadow-sm p-4 mt-4">
          <div className="flex gap-2 flex-wrap items-center">
            <input className="input input-bordered input-sm flex-1 min-w-[200px]" placeholder="Version label (optional), e.g. 'Chapter 2 draft'"
              value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)} maxLength={80} />
            <button className="btn btn-primary btn-sm" onClick={saveSnapshot}>Save version</button>
          </div>
        </div>
      )}

      <VersionHistory storyId={story.id} myRole={myRole} onRestored={() => { setTitle(story.title); setContent(story.content); }} />
    </div>
  );
}
