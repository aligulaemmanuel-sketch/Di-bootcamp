import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FEATURED_STORIES, GENRE_ART, STORY_GENRES } from "../data/storyGenres";

const features = [
  {
    number: "01",
    title: "Write in the same moment",
    description: "Invite your people in and watch ideas take shape together, one line at a time.",
  },
  {
    number: "02",
    title: "Keep every draft",
    description: "Save named versions as you go. Revisit an earlier idea without losing what came after.",
  },
  {
    number: "03",
    title: "Make room for readers",
    description: "Share a quiet, read-only link or bring collaborators into the story with you.",
  },
];

function Wordmark() {
  return (
    <span className="wordmark" aria-label="StoryWeave">
      <span className="wordmark-icon" aria-hidden="true">s</span>
      storyweave<span className="wordmark-period">.</span>
    </span>
  );
}

export default function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("storyweave-theme") === "dark"
  );

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !("IntersectionObserver" in window)) return;

    const targets = page.querySelectorAll<HTMLElement>("[data-reveal]");
    page.classList.add("reveal-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      page.classList.remove("reveal-ready");
    };
  }, []);

  function toggleTheme() {
    setDarkMode((current) => {
      const next = !current;
      localStorage.setItem("storyweave-theme", next ? "dark" : "light");
      return next;
    });
  }

  return (
    <div ref={pageRef} className={`landing-page min-h-screen ${darkMode ? "dark" : ""}`} data-theme={darkMode ? "storyweave-dark" : "storyweave"}>
      <header className="landing-nav">
        <Link to="/" className="landing-brand" aria-label="StoryWeave home"><Wordmark /></Link>
        <nav aria-label="Main navigation" className="landing-nav-links">
          <a href="#how-it-works">The good stuff</a>
          <Link to="/login">Sign in</Link>
          <button
            className="theme-toggle btn btn-ghost"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
            aria-pressed={darkMode}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {darkMode ? (
                <circle cx="12" cy="12" r="4" />
              ) : (
                <path d="M20.2 15.4A8.5 8.5 0 018.6 3.8 8.5 8.5 0 1020.2 15.4z" />
              )}
              {darkMode && <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.1-7.1-1.4 1.4M6.3 17.7l-1.4 1.4m14.2 0-1.4-1.4M6.3 6.3 4.9 4.9" />}
            </svg>
            <span>{darkMode ? "Light" : "Dark"}</span>
          </button>
          <Link to="/register" className="btn btn-primary landing-nav-cta">Start writing</Link>
        </nav>
      </header>

      <main className="mx-auto w-full">
        <section className="landing-hero">
          <div className="hero-copy" data-reveal="up">
            <span className="eyebrow"><span className="eyebrow-dot" /> A little more magic, together</span>
            <h1>Good stories<br />are <em>better shared.</em></h1>
            <p className="hero-description">
              A cozy corner for you and your favorite people to write, dream, and make something worth passing around.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Write your first story</Link>
              <Link to="/login" className="hero-secondary-link">Already have a space? <span>Sign in</span></Link>
            </div>
            <div className="hero-note">
              <div className="avatar-stack" aria-hidden="true">
                <span className="avatar avatar-peach">M</span>
                <span className="avatar avatar-green">J</span>
                <span className="avatar avatar-blue">A</span>
              </div>
              <span>Better with your people. Always.</span>
            </div>
          </div>

          <div className="hero-art" data-reveal="scale" aria-label="A preview of a story being written together">
            <div className="art-sun" />
            <div className="art-note art-note-top">a story in progress</div>
            <div className="story-preview">
              <div className="preview-topline">
                <span className="preview-dot" />
                <span>THE WILD BETWEEN</span>
                <span className="preview-live"><i /> 2 writing</span>
              </div>
              <div className="preview-rule" />
              <span className="preview-category">CHAPTER ONE&nbsp; · &nbsp;A SMALL BEGINNING</span>
              <h2>The map that<br />remembered us</h2>
              <p>The old paper smelled of rain and faraway places. Mira traced the river with one careful finger, and somewhere, a blue ink line began to glow…</p>
              <div className="preview-cursor-line">
                <span>And then the forest answered.</span>
                <span className="fake-cursor">J</span>
              </div>
              <div className="preview-footer">
                <div className="preview-avatars"><span>M</span><span>J</span><span>+</span></div>
                <span>Saved a moment ago</span>
              </div>
            </div>
            <div className="art-note art-note-bottom">made of many voices</div>
          </div>
        </section>

        <section className="landing-discover" id="discover">
          <div className="discover-heading" data-reveal="up">
            <div>
              <span className="eyebrow">A whole shelf of possibilities</span>
              <h2>What are we dreaming up <em>today?</em></h2>
              <p>Pick a feeling, follow a thread, see where your next story takes you.</p>
            </div>
            <Link to="/register" className="discover-all-link">Explore every story</Link>
          </div>
          <div className="genre-shelf" aria-label="Story genres">
            {STORY_GENRES.filter((genre) => genre !== "General").map((genre) => (
              <Link className="genre-tile" data-reveal="up" key={genre} to="/register" style={{ backgroundImage: `linear-gradient(180deg, transparent 20%, rgb(19 32 25 / 78%) 100%), url("${GENRE_ART[genre]}")` }}>
                <span>{genre}</span>
              </Link>
            ))}
          </div>
          <div className="sample-heading" data-reveal="up">
            <div>
              <span className="eyebrow">A little spark to get you started</span>
              <h3>Stories that could be yours</h3>
            </div>
            <span className="sample-disclaimer">Original story starters · made for your imagination</span>
          </div>
          <div className="sample-grid">
            {FEATURED_STORIES.map((story) => (
              <Link className="sample-story" data-reveal="up" key={story.title} to="/register">
                <div className="sample-story-image" style={{ backgroundImage: `linear-gradient(180deg, rgb(19 32 25 / 5%), rgb(19 32 25 / 42%)), url("${GENRE_ART[story.genre]}")` }}>
                  <span className="sample-genre">{story.genre}</span>
                </div>
                <div className="sample-story-glass">
                  <span>{story.byline}</span>
                  <h4>{story.title}</h4>
                  <p>{story.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-manifesto" id="how-it-works">
          <div className="manifesto-heading" data-reveal="up">
            <span className="eyebrow">A blank page, but not alone</span>
            <h2>Less “send me the doc.”<br /><em>More “what if…”</em></h2>
          </div>
          <div className="feature-list">
            {features.map((feature) => (
              <article className="feature-item" data-reveal="up" key={feature.number}>
                <span className="feature-number">{feature.number}</span>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-bottom-cta" data-reveal="up">
          <span className="eyebrow">Your next favorite story starts here</span>
          <h2>Bring a little<br /><em>“what if?”</em></h2>
          <Link to="/register" className="btn btn-primary btn-lg">Let’s make a story</Link>
        </section>
      </main>

      <footer className="landing-footer">
        <Link to="/" className="landing-brand"><Wordmark /></Link>
        <span>A small space for big stories.</span>
        <Link to="/login">Come on in</Link>
      </footer>
    </div>
  );
}
