import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchStories, setFilter } from "../store/storiesSlice";
import StoryCard from "../components/StoryCard";

const FILTERS = [
  { key: "feed", label: "All stories" },
  { key: "mine", label: "My stories" },
  { key: "shared", label: "Shared with me" },
] as const;

export default function FeedPage() {
  const dispatch = useAppDispatch();
  const { list, filter } = useAppSelector((s) => s.stories);

  useEffect(() => { dispatch(fetchStories(filter)); }, [filter, dispatch]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Stories</h1>
        <div className="join">
          {FILTERS.map((f) => (
            <button key={f.key} className={`btn btn-sm join-item ${filter === f.key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => dispatch(setFilter(f.key))}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <p className="text-base-content/50 text-center py-16">
          Nothing here yet — <a href="/new" className="link link-primary">start a story</a>.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => <StoryCard key={s.id} story={s} />)}
        </div>
      )}
    </div>
  );
}
