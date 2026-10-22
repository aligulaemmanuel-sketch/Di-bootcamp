import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login } from "../store/authSlice";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error, token } = useAppSelector((s) => s.auth);
  const notice = (location.state as { message?: string } | null)?.message;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => { if (token) navigate("/"); }, [token, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) navigate("/");
  }

  return (
    <AuthLayout
      eyebrow="Your story is waiting"
      title="Welcome back."
      description="Pick up right where the good part left off."
      footer={<>New around here? <Link to="/register" className="auth-inline-link">Make yourself at home</Link></>}
    >
      <form onSubmit={submit} className="auth-form">
        {notice && <p className="auth-notice" role="status">{notice}</p>}
        <label className="form-control">
          <span className="label-text">Email address</span>
          <input className="input input-bordered" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="form-control">
          <span className="label-text">Password</span>
          <PasswordInput autoComplete="current-password" required value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
        </label>
        <div className="auth-forgot-row">
          <Link to="/forgot-password" className="auth-inline-link">Forgot your password?</Link>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary auth-submit" disabled={status === "loading"}>
          {status === "loading" ? <><span className="loading loading-spinner loading-sm" /> Signing you in…</> : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
