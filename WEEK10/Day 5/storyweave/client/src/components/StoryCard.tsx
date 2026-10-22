import { Link } from "react-router-dom";
import type { Story } from "../types";
import { GENRE_ART } from "../data/storyGenres";

export default function StoryCard({ story }: { story: Story }) {
  return (
    <Link to={`/story/${story.id}`} className="card story-card">
      <div className="story-card-cover" style={{ backgroundImage: `linear-gradient(180deg, rgb(24 37 28 / 5%), rgb(24 37 28 / 50%)), url("${GENRE_ART[story.genre] || GENRE_ART.General}")` }}>
        <span className="badge story-genre">{story.genre}</span>
      </div>
      <div className="card-body story-card-body">
        <div className="story-card-topline">
          <span className="story-card-kicker">A STORY BY {story.author.username.toUpperCase()}</span>
        </div>
        <h3 className="story-card-title">{story.title}</h3>
        <p className="story-card-excerpt whitespace-pre-line">{story.content || "A blank page, ready for its first sentence."}</p>
        <div className="story-card-footer">
          <span className="story-author">
            <span className="story-author-avatar">{story.author.username[0]?.toUpperCase()}</span>
            {story.author.username}
          </span>
          <span className="story-card-meta">
            <span>{story._count?.comments ?? 0} comments</span>
            <span aria-hidden="true">·</span>
            <span>{new Date(story.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
