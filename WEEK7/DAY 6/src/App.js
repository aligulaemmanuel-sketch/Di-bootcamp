import { useEffect, useState } from 'react';
import './App.css';

const cloudOptions = ['AWS', 'Vercel'];
const languageOptions = ['Python', 'Flask', 'SQLite', 'Git & GitHub'];
const ideOptions = ['AI Integration', 'Photography', 'Videography', 'Editing', 'Sound Engineering'];
const projects = [
  {
    name: 'Maradona Barber Shop',
    description: 'A modern barber shop website showcasing grooming services and making it easy for clients to connect.',
    tags: ['Responsive Design', 'Client Experience'],
    url: 'https://maradona-berber-shop.vercel.app/',
  },
  {
    name: 'Raila Tribute',
    description: "A responsive tribute to Raila Odinga's public life, leadership, and contribution to Kenya's democratic journey.",
    tags: ['HTML5', 'CSS Grid'],
    url: 'https://tribute-page-livid.vercel.app',
  },
  {
    name: 'Kuhis Parlour',
    description: 'A polished salon and beauty parlour website designed to showcase services and create a smooth booking experience.',
    tags: ['Web Experience', 'Vercel'],
    url: 'https://solon-project.vercel.app',
  },
];
const socialLinks = [
  { label: 'Instagram', detail: '@_by.manu.perspective', url: 'https://instagram.com/_by.manu.perspective' },
  { label: 'LinkedIn', detail: 'aligula-emmanuel-12tm', url: 'https://www.linkedin.com/in/aligula-emmanuel-12tm/' },
  { label: 'WhatsApp', detail: '+254 790 197316', url: 'https://wa.me/254790197316' },
  { label: 'GitHub', detail: 'aligulaemmanuel-sketch', url: 'https://github.com/aligulaemmanuel-sketch' },
];
const defaultProfile = {
  name: 'Emmanuel Asuva',
  email: 'aligulaemmanuel@gmail.com',
  role: 'Full-Stack Developer · Visual Storyteller',
  location: 'Location not listed',
};

const getStoredState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const hashPassword = async (password, saltHex) => {
  const salt = saltHex
    ? Uint8Array.from(saltHex.match(/.{2}/g), (byte) => parseInt(byte, 16))
    : window.crypto.getRandomValues(new Uint8Array(16));
  const key = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  const hash = Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return { salt: Array.from(salt, (byte) => byte.toString(16).padStart(2, '0')).join(''), hash };
};

const resizeImage = (file) => new Promise((resolve, reject) => {
  if (!file.type.startsWith('image/')) {
    reject(new Error('Choose an image file.'));
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    reject(new Error('Choose an image smaller than 8 MB.'));
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Could not read this image.'));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error('Could not load this image.'));
    image.onload = () => {
      const scale = Math.min(1, 512 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

function App() {
  const [users, setUsers] = useState(() => getStoredState('sketch-community-users', []));
  const [currentUser, setCurrentUser] = useState(() => getStoredState('sketch-community-session', null));
  const [posts, setPosts] = useState(() => getStoredState('sketch-community-posts', []));
  const [authMode, setAuthMode] = useState(null);
  const [authValues, setAuthValues] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authPhoto, setAuthPhoto] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [draftPost, setDraftPost] = useState('');
  const [postCategory, setPostCategory] = useState('Idea');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [theme, setTheme] = useState(() => getStoredState('dev-theme', 'dark'));
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(() => getStoredState('portfolio-profile', defaultProfile));
  const [selectedClouds, setSelectedClouds] = useState(() =>
    getStoredState('portfolio-clouds', ['AWS', 'Vercel'])
  );
  const [selectedLanguages, setSelectedLanguages] = useState(() =>
    getStoredState('portfolio-languages', ['Python', 'Flask'])
  );
  const [selectedIde, setSelectedIde] = useState(() =>
    getStoredState('portfolio-creative-tools', ['AI Integration', 'Photography', 'Videography'])
  );

  useEffect(() => {
    localStorage.setItem('sketch-community-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sketch-community-session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sketch-community-session');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sketch-community-posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('portfolio-profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('portfolio-clouds', JSON.stringify(selectedClouds));
  }, [selectedClouds]);

  useEffect(() => {
    localStorage.setItem('portfolio-languages', JSON.stringify(selectedLanguages));
  }, [selectedLanguages]);

  useEffect(() => {
    localStorage.setItem('portfolio-creative-tools', JSON.stringify(selectedIde));
  }, [selectedIde]);

  useEffect(() => {
    localStorage.setItem('dev-theme', JSON.stringify(theme));
  }, [theme]);

  const toggleSelection = (value, currentList, setList) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleProfileChange = (field) => (event) => {
    setProfile((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const photo = await resizeImage(file);
      setProfile((current) => ({ ...current, photo }));
      setPhotoError('');
    } catch (error) {
      setPhotoError(error.message);
    }
  };

  const handleAuthPhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      setAuthPhoto(await resizeImage(file));
      setAuthError('');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const openAuth = (mode) => {
    setAuthValues({ name: '', email: '', password: '' });
    setAuthError('');
    setAuthMode(mode);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    const email = authValues.email.trim().toLowerCase();

    try {
      if (authMode === 'signup') {
        if (users.some((user) => user.email === email)) {
          setAuthError('An account with this email already exists.');
          return;
        }
        const credentials = await hashPassword(authValues.password);
        const user = { id: createId(), name: authValues.name.trim(), email, photo: authPhoto, ...credentials };
        setUsers((existing) => [...existing, user]);
        setCurrentUser({ id: user.id, name: user.name, email: user.email, photo: user.photo });
      } else {
        const user = users.find((account) => account.email === email);
        if (!user) {
          setAuthError('No account found for that email. Create an account to join.');
          return;
        }
        const credentials = await hashPassword(authValues.password, user.salt);
        if (credentials.hash !== user.hash) {
          setAuthError('That password does not match this account.');
          return;
        }
        setCurrentUser({ id: user.id, name: user.name, email: user.email, photo: user.photo });
      }
      setAuthMode(null);
    } catch {
      setAuthError('Account sign-in is unavailable in this browser.');
    }
  };

  const handleLogout = () => setCurrentUser(null);

  const handlePostSubmit = (event) => {
    event.preventDefault();
    const body = draftPost.trim();
    if (!currentUser || !body) return;
    setPosts((existing) => [{
      id: createId(),
      author: currentUser.name,
      authorId: currentUser.id,
      authorPhoto: currentUser.photo,
      category: postCategory,
      body,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
    }, ...existing]);
    setDraftPost('');
  };

  const handleLike = (postId) => {
    if (!currentUser) {
      openAuth('login');
      return;
    }
    setPosts((existing) => existing.map((post) => {
      if (post.id !== postId) return post;
      const liked = post.likes.includes(currentUser.id);
      return { ...post, likes: liked ? post.likes.filter((id) => id !== currentUser.id) : [...post.likes, currentUser.id] };
    }));
  };

  const handleCommentSubmit = (postId, event) => {
    event.preventDefault();
    const body = (commentDrafts[postId] || '').trim();
    if (!currentUser || !body) return;
    setPosts((existing) => existing.map((post) => post.id === postId
      ? { ...post, comments: [...post.comments, { id: createId(), author: currentUser.name, authorPhoto: currentUser.photo, body }] }
      : post
    ));
    setCommentDrafts((existing) => ({ ...existing, [postId]: '' }));
  };

  const handleThemeToggle = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  const stats = [
    { label: 'Featured projects', value: '03' },
    { label: 'Focus', value: 'AI' },
    { label: 'Certs', value: 'AWS CCP' },
    { label: 'Stack', value: 'Flask' },
  ];

  const taskList = [
    'Cloud-ready web solutions',
    'AI and automated workflows',
    'Photo and video production',
    'Sound engineering and editing',
  ];
  const activityFeed = [
    'AWS Certified Cloud Practitioner',
    'Full-stack development with Python / Flask',
    'Trained photographer and videographer',
    'Exploring AI-assisted production',
  ];

  return (
    <div className={`app-shell theme-${theme}`}>
      <div className="app-container">
        <nav className="nav-bar">
          <div className="brand-wrap">
            <div className="brand-mark">S</div>
            <div>
              <p className="brand-label">Sketch Code</p>
              <span>Developer hub</span>
            </div>
          </div>

          <div className="nav-links">
            <a className="nav-button" href="#overview">Overview</a>
            <a className="nav-button" href="#projects">Projects</a>
            <a className="nav-button" href="#skills">Skills</a>
            <a className="nav-button" href="#community">Community</a>
            <a className="nav-button" href="#connect">Connect</a>
          </div>

          <div className="auth-actions">
            <button className="ghost-btn" onClick={handleThemeToggle}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            {!currentUser ? (
              <>
                <button className="secondary-btn" onClick={() => openAuth('login')}>Log in</button>
                <button className="primary-btn" onClick={() => openAuth('signup')}>Sign up</button>
              </>
            ) : (
              <button className="secondary-btn" onClick={handleLogout}>Log out</button>
            )}
          </div>
        </nav>

        <main id="overview" className="dashboard-layout">
          <aside className="profile-panel card">
            <div className="avatar large-avatar">
              {profile.photo ? <img src={profile.photo} alt={`${profile.name} profile`} /> : profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-text">
              <p className="label">Profile</p>
              <h2>{profile.name}</h2>
              <p className="role-tag">{profile.role}</p>
              <p>{profile.email}</p>
              <p>{profile.location}</p>
            </div>

            <div className="profile-actions">
              <button className="primary-btn" onClick={() => setIsEditing((value) => !value)}>
                {isEditing ? 'Close' : 'Edit Profile'}
              </button>
              <a className="secondary-btn" href={`mailto:${profile.email}`}>Email</a>
            </div>
          </aside>

          <section id="skills" className="main-panel">
            <div className="stats-grid">
              {stats.map((stat) => (
                <div className="card stat-card" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>

            {isEditing && (
              <section className="card form-card">
                <p className="label">Update profile</p>
                <div className="form-grid">
                  <label>
                    Name
                    <input value={profile.name} onChange={handleProfileChange('name')} />
                  </label>
                  <label>
                    Email
                    <input value={profile.email} onChange={handleProfileChange('email')} />
                  </label>
                  <label>
                    Role
                    <input value={profile.role} onChange={handleProfileChange('role')} />
                  </label>
                  <label>
                    Location
                    <input value={profile.location} onChange={handleProfileChange('location')} />
                  </label>
                  <label className="photo-field">
                    Profile photo
                    <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
                    {photoError && <small className="field-error">{photoError}</small>}
                  </label>
                </div>
              </section>
            )}

            <div className="widget-grid">
              <section className="card">
                <p className="label">Cloud & hosting</p>
                <div className="chip-list">
                  {cloudOptions.map((cloud) => (
                    <button
                      key={cloud}
                      className={`chip ${selectedClouds.includes(cloud) ? 'active' : ''}`}
                      onClick={() => toggleSelection(cloud, selectedClouds, setSelectedClouds)}
                    >
                      {cloud}
                    </button>
                  ))}
                </div>
              </section>

              <section className="card">
                <p className="label">Languages</p>
                <div className="chip-list">
                  {languageOptions.map((language) => (
                    <button
                      key={language}
                      className={`chip ${selectedLanguages.includes(language) ? 'active' : ''}`}
                      onClick={() => toggleSelection(language, selectedLanguages, setSelectedLanguages)}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </section>

              <section className="card">
                <p className="label">Creative & AI</p>
                <div className="chip-list">
                  {ideOptions.map((ide) => (
                    <button
                      key={ide}
                      className={`chip ${selectedIde.includes(ide) ? 'active' : ''}`}
                      onClick={() => toggleSelection(ide, selectedIde, setSelectedIde)}
                    >
                      {ide}
                    </button>
                  ))}
                </div>
              </section>

              <aside className="card summary-card">
                <p className="label">Summary</p>
                <h3>{currentUser ? `Hi, ${currentUser.name}` : 'Guest mode'}</h3>
                <ul>
                  <li>
                    <span>Cloud:</span>
                    <strong>{selectedClouds.join(', ') || 'None selected'}</strong>
                  </li>
                  <li>
                    <span>Languages:</span>
                    <strong>{selectedLanguages.join(', ') || 'None selected'}</strong>
                  </li>
                  <li>
                    <span>Creative / AI:</span>
                    <strong>{selectedIde.join(', ') || 'None selected'}</strong>
                  </li>
                </ul>
              </aside>
            </div>
          </section>

          <aside className="side-panel">
            <div className="card task-card">
              <p className="label">Specialties</p>
              <h3>Areas of focus</h3>
              <ul className="task-list">
                {taskList.map((task, index) => (
                  <li key={task}>
                    <span className="dot" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card feed-card">
              <p className="label">Background</p>
              <h3>Highlights</h3>
              <ul className="feed-list">
                {activityFeed.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </main>

        <section id="community" className="portfolio-section community-section">
          <div className="section-heading">
            <div>
              <p className="label">Sketch Code community</p>
              <h2>Build together</h2>
            </div>
            {!currentUser && <button className="primary-btn" onClick={() => openAuth('signup')}>Join the community</button>}
          </div>

          {currentUser ? (
            <form className="card composer-card" onSubmit={handlePostSubmit}>
              <div className="composer-avatar">{currentUser.photo ? <img src={currentUser.photo} alt="" /> : currentUser.name.charAt(0).toUpperCase()}</div>
              <div className="composer-fields">
                <textarea
                  aria-label="Share a thought or project idea"
                  placeholder="Share a thought, question, or project idea..."
                  value={draftPost}
                  onChange={(event) => setDraftPost(event.target.value)}
                  maxLength={1200}
                  required
                />
                <div className="composer-actions">
                  <select aria-label="Post type" value={postCategory} onChange={(event) => setPostCategory(event.target.value)}>
                    <option>Idea</option>
                    <option>Question</option>
                    <option>Showcase</option>
                  </select>
                  <span>{draftPost.length}/1200</span>
                  <button className="primary-btn" type="submit" disabled={!draftPost.trim()}>Share post</button>
                </div>
              </div>
            </form>
          ) : (
            <div className="card community-invite">
              <p>Sign in to share an idea, ask a question, and help other builders.</p>
              <button className="secondary-btn" onClick={() => openAuth('login')}>Log in</button>
            </div>
          )}

          <div className="community-feed">
            {posts.length ? posts.map((post) => (
              <article className="card community-post" key={post.id}>
                <div className="post-header">
                  <div className="post-avatar">
                    {post.authorPhoto ? <img src={post.authorPhoto} alt="" /> : post.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="post-author">
                    <strong>{post.author}</strong>
                    <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>
                  </div>
                  <span className={`post-category category-${post.category.toLowerCase()}`}>{post.category}</span>
                </div>
                <p className="post-body">{post.body}</p>
                <div className="post-actions">
                  <button className="post-action" onClick={() => handleLike(post.id)}>
                    {currentUser && post.likes.includes(currentUser.id) ? 'Liked' : 'Like'} · {post.likes.length}
                  </button>
                  <span>{post.comments.length} {post.comments.length === 1 ? 'reply' : 'replies'}</span>
                </div>
                {post.comments.map((comment) => (
                  <div className="post-comment" key={comment.id}>
                    <div className="comment-avatar">
                      {comment.authorPhoto ? <img src={comment.authorPhoto} alt="" /> : comment.author.charAt(0).toUpperCase()}
                    </div>
                    <strong>{comment.author}</strong>
                    <span>{comment.body}</span>
                  </div>
                ))}
                {currentUser ? (
                  <form className="comment-form" onSubmit={(event) => handleCommentSubmit(post.id, event)}>
                    <input
                      aria-label={`Reply to ${post.author}`}
                      placeholder="Write a helpful reply..."
                      value={commentDrafts[post.id] || ''}
                      onChange={(event) => setCommentDrafts((existing) => ({ ...existing, [post.id]: event.target.value }))}
                      maxLength={500}
                    />
                    <button className="secondary-btn" type="submit" disabled={!(commentDrafts[post.id] || '').trim()}>Reply</button>
                  </form>
                ) : (
                  <button className="post-action" onClick={() => openAuth('login')}>Log in to reply</button>
                )}
              </article>
            )) : (
              <div className="community-empty">
                <span aria-hidden="true">✳</span>
                <h3>Start the first conversation</h3>
                <p>Share a project idea or a question with the community.</p>
              </div>
            )}
          </div>
        </section>

        <section id="projects" className="portfolio-section">
          <div className="section-heading">
            <div>
              <p className="label">Selected work</p>
              <h2>Featured Projects</h2>
            </div>
            <a className="text-link" href="https://github.com/aligulaemmanuel-sketch/Di-bootcamp" target="_blank" rel="noreferrer">
              View GitHub portfolio <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="project-grid">
            {projects.map((project) => (
              <article className="card project-card" key={project.name}>
                <div className="project-topline">
                  <span className="project-mark" aria-hidden="true">{project.name.charAt(0)}</span>
                  <a className="project-link" href={project.url} target="_blank" rel="noreferrer" aria-label={`Visit ${project.name}`}>
                    ↗
                  </a>
                </div>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="connect" className="portfolio-section connect-section">
          <div className="section-heading">
            <div>
              <p className="label">Around the web</p>
              <h2>Connect with Emmanuel</h2>
            </div>
            <a className="text-link" href={`mailto:${profile.email}`}>Email Emmanuel <span aria-hidden="true">↗</span></a>
          </div>
          <div className="social-grid">
            {socialLinks.map((link) => (
              <a className="card social-card" href={link.url} key={link.label} target="_blank" rel="noreferrer">
                <span>{link.label}</span>
                <strong>{link.detail}</strong>
                <span className="social-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        {authMode && (
          <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setAuthMode(null)}>
            <section className="card auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
              <button className="dialog-close" type="button" aria-label="Close" onClick={() => setAuthMode(null)}>×</button>
              <p className="label">Sketch Code community</p>
              <h2 id="auth-title">{authMode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {authMode === 'signup' && (
                  <>
                    <label>
                      Name
                      <input required value={authValues.name} onChange={(event) => setAuthValues((value) => ({ ...value, name: event.target.value }))} autoComplete="name" />
                    </label>
                    <label className="photo-field">
                      Profile photo
                      <input type="file" accept="image/*" onChange={handleAuthPhotoChange} />
                      {authPhoto && <span className="photo-ready">Photo selected</span>}
                    </label>
                  </>
                )}
                <label>
                  Email
                  <input type="email" required value={authValues.email} onChange={(event) => setAuthValues((value) => ({ ...value, email: event.target.value }))} autoComplete="email" />
                </label>
                <label>
                  Password
                  <input type="password" required minLength={8} value={authValues.password} onChange={(event) => setAuthValues((value) => ({ ...value, password: event.target.value }))} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} />
                </label>
                {authError && <p className="field-error" role="alert">{authError}</p>}
                <button className="primary-btn" type="submit">{authMode === 'signup' ? 'Create account' : 'Log in'}</button>
              </form>
              <button className="auth-switch" type="button" onClick={() => openAuth(authMode === 'signup' ? 'login' : 'signup')}>
                {authMode === 'signup' ? 'Already a member? Log in' : 'New here? Create an account'}
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
