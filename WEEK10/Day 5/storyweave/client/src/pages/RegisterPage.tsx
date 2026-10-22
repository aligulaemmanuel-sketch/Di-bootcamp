import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { register } from "../store/authSlice";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";

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
    <AuthLayout
      eyebrow="A blank page is a beginning"
      title="Your story starts here."
      description="Make a little space for the ideas you can’t wait to share."
      footer={<>Already have a space? <Link to="/login" className="auth-inline-link">Sign in</Link></>}
    >
      <form onSubmit={submit} className="auth-form">
        <label className="form-control">
          <span className="label-text">Your pen name</span>
          <input className="input input-bordered" autoComplete="username" required minLength={3} maxLength={30}
            value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="writer_42" pattern="[a-zA-Z0-9_]+" title="Use letters, numbers, and underscores only." />
        </label>
        <label className="form-control">
          <span className="label-text">Email address</span>
          <input className="input input-bordered" type="email" autoComplete="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </label>
        <label className="form-control">
          <span className="label-text">Create a password</span>
          <PasswordInput autoComplete="new-password" required minLength={8}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="At least 8 characters" pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
            title="Use at least 8 characters, including a letter and a number." />
          <span className="auth-hint">At least 8 characters, with a letter and a number.</span>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary auth-submit" disabled={status === "loading"}>
          {status === "loading" ? <><span className="loading loading-spinner loading-sm" /> Making your space…</> : "Create my space"}
        </button>
      </form>
    </AuthLayout>
  );
}
