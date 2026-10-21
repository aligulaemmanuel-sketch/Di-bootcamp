import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login } from "../store/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, token } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => { if (token) navigate("/"); }, [token, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) navigate("/");
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-3xl font-bold text-center">Story<span className="text-primary">Weave</span></h1>
      <p className="text-center text-base-content/60 mt-1 mb-8">Write together, in real time.</p>
      <form onSubmit={submit} className="card bg-base-100 shadow p-6 space-y-4">
        <label className="form-control">
          <span className="label-text mb-1">Email</span>
          <input className="input input-bordered" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="form-control">
          <span className="label-text mb-1">Password</span>
          <input className="input input-bordered" type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        {error && <p className="text-error text-sm">{error}</p>}
        <button className="btn btn-primary w-full" disabled={status === "loading"}>
          {status === "loading" ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-sm text-center">
          No account? <Link to="/register" className="link link-primary">Register</Link>
        </p>
      </form>
    </div>
  );
}
