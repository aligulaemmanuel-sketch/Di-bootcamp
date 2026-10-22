import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createStory } from "../store/storiesSlice";
import { STORY_GENRES } from "../data/storyGenres";

export default function NewStoryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((s) => s.stories.status);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("General");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(createStory({ title, genre }));
    if (createStory.fulfilled.match(result)) navigate(`/story/${result.payload.id}/edit`);
    else setError(result.payload as string);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Start a new story</h1>
      <form onSubmit={submit} className="card bg-base-100 shadow p-6 space-y-4">
        <label className="form-control">
          <span className="label-text mb-1">Title</span>
          <input className="input input-bordered" required maxLength={120}
            value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Lighthouse at the Edge of Time" />
        </label>
        <label className="form-control">
          <span className="label-text mb-1">Genre</span>
          <select className="select select-bordered" value={genre} onChange={(e) => setGenre(e.target.value)}>
            {STORY_GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        {error && <p className="text-error text-sm">{error}</p>}
        <button className="btn btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Creating…" : "Create & start writing"}
        </button>
      </form>
    </div>
  );
}
