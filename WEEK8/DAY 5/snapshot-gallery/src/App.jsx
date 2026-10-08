import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import Gallery from './components/Gallery.jsx'
import Navigation from './components/Navigation.jsx'
import SearchForm from './components/SearchForm.jsx'
import PhotoContextProvider from './context/PhotoContext.jsx'
import './App.css'

function SearchRoute() {
  const { searchInput = '' } = useParams()
  return <Gallery searchTerm={searchInput} />
}

function GalleryShell() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/mountain" aria-label="Snapshot home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>SNAPSHOT<span className="brand-period">.</span></span>
        </Link>
        <div className="header-note">
          <span className="status-dot" />
          <span>THE OPEN IMAGE INDEX</span>
        </div>
      </header>

      <main>
        <section className="intro" aria-labelledby="page-title">
          <div className="intro-copy">
            <p className="eyebrow">A little room for visual discovery</p>
            <h1 id="page-title">Find a frame<br />for the feeling<span className="accent-mark">.</span></h1>
          </div>
          <p className="intro-note">A living collection of places, details, and everyday scenes.</p>
        </section>

        <SearchForm />
        <Navigation />

        <Routes>
          <Route path="/" element={<Navigate to="/mountain" replace />} />
          <Route path="/mountain" element={<Gallery searchTerm="mountain" />} />
          <Route path="/beaches" element={<Gallery searchTerm="beaches" />} />
          <Route path="/birds" element={<Gallery searchTerm="birds" />} />
          <Route path="/food" element={<Gallery searchTerm="food" />} />
          <Route path="/search/:searchInput" element={<SearchRoute />} />
          <Route path="*" element={<Navigate to="/mountain" replace />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <span>SNAPSHOT INDEX</span>
        <span>Images by Pexels and the preview collection</span>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <PhotoContextProvider>
        <GalleryShell />
      </PhotoContextProvider>
    </BrowserRouter>
  )
}

export default App
