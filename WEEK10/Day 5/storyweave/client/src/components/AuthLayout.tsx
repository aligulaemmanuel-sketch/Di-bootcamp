import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="auth-shell">
      <Link to="/" className="auth-brand" aria-label="StoryWeave home">
        <span className="wordmark-icon" aria-hidden="true">s</span>
        storyweave<span className="wordmark-period">.</span>
      </Link>
      <section className="auth-card">
        <div className="auth-intro">
          <span className="eyebrow"><span className="eyebrow-dot" /> {eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {children}
        <div className="auth-footer">{footer}</div>
      </section>
      <p className="auth-footnote">A good story is always better shared.</p>
    </main>
  );
}
