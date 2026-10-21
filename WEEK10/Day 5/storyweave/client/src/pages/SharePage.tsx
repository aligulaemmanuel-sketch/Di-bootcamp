import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

/** Public read-only view for shareable links (works without login). */
export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [story, setStory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get(`/api/share/${token}`)
      .then(({ data }) => setStory(data.story))
      .catch(() => setError("This shared story could not be found."));
  }, [token]);

  if (error) return <p className="text-center py-16 text-error">{error}</p>;
  if (!story) return <p className="text-center py-16 text-base-content/50">Loading…</p>;

  return (
    <article className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-sm text-base-content/60 mb-4">
          <Link to="/" className="link link-primary">Sign in to StoryWeave</Link> to comment and collaborate
        </p>
        <span className="badge badge-outline">{story.genre}</span>
        <h1 className="text-3xl font-bold mt-2">{story.title}</h1>
        <p className="text-sm text-base-content/60 mt-1">by {story.author.username}</p>
      </div>
      <div className="bg-base-100 rounded-xl shadow-sm p-6 whitespace-pre-line leading-relaxed">
        {story.content || <span className="italic text-base-content/40">This story is still a blank page.</span>}
      </div>
      {story.comments?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">Comments</h2>
          <ul className="space-y-3">
            {story.comments.map((c: any) => (
              <li key={c.id} className="bg-base-100 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.author.username}</span>
                  <span className="text-xs text-base-content/50">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm whitespace-pre-line">{c.content}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
