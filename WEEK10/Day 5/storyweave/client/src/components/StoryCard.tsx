import { Link } from "react-router-dom";
import type { Story } from "../types";

export default function StoryCard({ story }: { story: Story }) {
  return (
    <Link to={`/story/${story.id}`} className="card bg-base-100 shadow-sm hover:shadow-md transition">
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-base leading-snug">{story.title}</h3>
          <span className="badge badge-outline shrink-0">{story.genre}</span>
        </div>
        <p className="text-sm text-base-content/70 line-clamp-2 whitespace-pre-line">{story.content || "No content yet."}</p>
        <p className="text-xs text-base-content/50">
          by {story.author.username} · {story._count?.comments ?? 0} comments · {new Date(story.updatedAt).toLocaleDateString()}
          {!story.commentsEnabled && <span className="badge badge-ghost badge-xs ml-2">comments off</span>}
        </p>
      </div>
    </Link>
  );
}
