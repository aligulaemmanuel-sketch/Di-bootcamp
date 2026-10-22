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
import LandingPage from "./pages/LandingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

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
    <div className="min-h-screen app-shell">
      {token && <Navbar user={user} onLogout={handleLogout} />}
      <main className={token ? "app-main" : ""}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/share/:token" element={<SharePage />} />
          <Route path="/" element={token ? <RequireAuth><FeedPage /></RequireAuth> : <LandingPage />} />
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
