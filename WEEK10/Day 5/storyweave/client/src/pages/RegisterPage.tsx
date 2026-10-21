import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { register } from "../store/authSlice";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, token } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  useEffect(() => { if (token) navigate("/"); }, [token, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) navigate("/");
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-3xl font-bold text-center">Join Story<span className="text-primary">Weave</span></h1>
      <form onSubmit={submit} className="card bg-base-100 shadow p-6 space-y-4 mt-6">
        <label className="form-control">
          <span className="label-text mb-1">Username</span>
          <input className="input input-bordered" required minLength={3} maxLength={30}
            value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="writer_42" />
        </label>
        <label className="form-control">
          <span className="label-text mb-1">Email</span>
          <input className="input input-bordered" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </label>
        <label className="form-control">
          <span className="label-text mb-1">Password</span>
          <input className="input input-bordered" type="password" required minLength={8}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="8+ chars, letters & numbers" />
        </label>
        {error && <p className="text-error text-sm">{error}</p>}
        <button className="btn btn-primary w-full" disabled={status === "loading"}>
          {status === "loading" ? "Creating account…" : "Create account"}
        </button>
        <p className="text-sm text-center">
          Have an account? <Link to="/login" className="link link-primary">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
