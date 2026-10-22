import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchStories, setFilter } from "../store/storiesSlice";
import StoryCard from "../components/StoryCard";
import { STORY_GENRES } from "../data/storyGenres";

const FILTERS = [
  { key: "feed", label: "All stories" },
  { key: "mine", label: "My stories" },
  { key: "shared", label: "Shared with me" },
] as const;

export default function FeedPage() {
  const dispatch = useAppDispatch();
  const { list, filter, status, error } = useAppSelector((s) => s.stories);
  const user = useAppSelector((s) => s.auth.user);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All genres");

  useEffect(() => { dispatch(fetchStories(filter)); }, [filter, dispatch]);

  const visibleStories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return list.filter((story) => {
      const matchesGenre = genre === "All genres" || story.genre.toLocaleLowerCase() === genre.toLocaleLowerCase();
      const matchesSearch = !query || `${story.title} ${story.content} ${story.genre} ${story.author.username}`.toLocaleLowerCase().includes(query);
      return matchesGenre && matchesSearch;
    });
  }, [list, search, genre]);

  return (
    <div className="feed-page">
      <section className="feed-welcome">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR LITTLE CORNER OF THE INTERNET</span>
          <h1>Good to have you, <em>{user?.username || "writer"}.</em></h1>
          <p>Every great story starts with a first line. What will yours be today?</p>
        </div>
        <Link to="/new" className="btn btn-primary feed-create-button">Start a new story</Link>
      </section>

      <section className="feed-library">
        <div className="feed-section-heading">
          <div>
            <span className="eyebrow">THE STORY SHELF</span>
            <h2>Your stories <span>{list.length}</span></h2>
          </div>
          <label className="feed-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a story…" aria-label="Search stories" />
            <kbd>/</kbd>
          </label>
        </div>
        <div className="feed-toolbar">
          <div className="feed-filters" role="group" aria-label="Filter stories">
          {FILTERS.map((f) => (
            <button key={f.key} className={`feed-filter ${filter === f.key ? "feed-filter-active" : ""}`}
              onClick={() => dispatch(setFilter(f.key))}>
              {f.label}
            </button>
          ))}
          </div>
          <span className="feed-result-count">{visibleStories.length} {visibleStories.length === 1 ? "story" : "stories"}</span>
        </div>
        <div className="feed-genre-shelf" role="group" aria-label="Filter by story genre">
          {["All genres", ...STORY_GENRES.filter((category) => category !== "General")].map((category) => (
            <button key={category} className={`feed-genre-chip ${genre === category ? "feed-genre-chip-active" : ""}`}
              aria-pressed={genre === category} onClick={() => setGenre(category)}>
              {category}
              {category !== "All genres" && <span>{list.filter((story) => story.genre.toLowerCase() === category.toLowerCase()).length}</span>}
            </button>
          ))}
        </div>
        {status === "loading" && list.length === 0 ? (
          <div className="feed-empty"><span className="loading loading-spinner loading-md" /><p>Gathering your stories…</p></div>
        ) : error && list.length === 0 ? (
          <div className="feed-empty"><p className="form-error" role="alert">{error}</p><button className="btn btn-outline" onClick={() => dispatch(fetchStories(filter))}>Try again</button></div>
        ) : visibleStories.length === 0 ? (
          <div className="feed-empty">
            <h3>{search || genre !== "All genres" ? "No story found just yet." : filter === "shared" ? "No shared stories yet." : filter === "mine" ? "Your first story is still unwritten." : "It's quiet on the story shelf."}</h3>
            <p>{search || genre !== "All genres" ? "Try another genre or search, or start a new story of your own." : "That just means there's room for a new beginning."}</p>
            {filter !== "shared" && <Link to="/new" className="btn btn-primary">Write the first line</Link>}
          </div>
      ) : (
        <div className="story-grid">
          {visibleStories.map((s) => <StoryCard key={s.id} story={s} />)}
        </div>
      )}
      </section>
    </div>
  );
}
