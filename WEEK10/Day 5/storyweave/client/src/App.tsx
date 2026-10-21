import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchMe, logout } from "./store/authSlice";
import { disconnectSocket } from "./socket";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FeedPage from "./pages/FeedPage";
import NewStoryPage from "./pages/NewStoryPage";
import StoryPage from "./pages/StoryPage";
import EditorPage from "./pages/EditorPage";
import ProfilePage from "./pages/ProfilePage";
import SharePage from "./pages/SharePage";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token } = useAppSelector((s) => s.auth);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user) dispatch(fetchMe());
  }, [token, user, dispatch]);

  function handleLogout() {
    disconnectSocket();
    dispatch(logout());
  }

  return (
    <div className="min-h-screen">
      {token && <Navbar user={user} onLogout={handleLogout} />}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/share/:token" element={<SharePage />} />
          <Route path="/" element={<RequireAuth><FeedPage /></RequireAuth>} />
          <Route path="/new" element={<RequireAuth><NewStoryPage /></RequireAuth>} />
          <Route path="/story/:id" element={<RequireAuth><StoryPage /></RequireAuth>} />
          <Route path="/story/:id/edit" element={<RequireAuth><EditorPage /></RequireAuth>} />
          <Route path="/profile/:username" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
