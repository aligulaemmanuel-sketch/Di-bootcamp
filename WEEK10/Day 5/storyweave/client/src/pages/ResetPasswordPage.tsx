import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Those passwords don't match yet.");
      return;
    }
    if (!token) {
      setError("This password reset link is invalid.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/login", { replace: true, state: { message: "Your password has been reset. Sign in with your new password." } });
    } catch (requestError: any) {
      setError(requestError.response?.data?.error ?? "We couldn't reset your password. Request a new link and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="A fresh page"
      title="Choose a new password."
      description="Make it at least 8 characters, with a letter and a number."
      footer={<>Need a fresh link? <Link to="/forgot-password" className="auth-inline-link">Request another</Link></>}
    >
      <form onSubmit={submit} className="auth-form">
        <label className="form-control">
          <span className="label-text">New password</span>
          <PasswordInput autoComplete="new-password" required minLength={8}
            pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}" title="Use at least 8 characters, including a letter and a number."
            value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
        </label>
        <label className="form-control">
          <span className="label-text">Confirm new password</span>
          <PasswordInput autoComplete="new-password" required minLength={8}
            value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Type it again" />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? <><span className="loading loading-spinner loading-sm" /> Saving password…</> : "Save new password"}
        </button>
      </form>
    </AuthLayout>
  );
}
