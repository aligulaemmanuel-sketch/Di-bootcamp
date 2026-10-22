import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email });
      setStatus("sent");
    } catch (requestError: any) {
      setStatus("failed");
      setError(requestError.response?.data?.error ?? "We couldn't send the reset email. Please try again.");
    }
  }

  return (
    <AuthLayout
      eyebrow="A small reset, a fresh start"
      title="Forgot your password?"
      description="Share the email on your account and we’ll send you a private reset link."
      footer={<>Remembered it? <Link to="/login" className="auth-inline-link">Back to sign in</Link></>}
    >
      {status === "sent" ? (
        <div className="auth-success" role="status">
          <h2>Check your inbox.</h2>
          <p>If an account exists for that email, we’ve sent reset instructions. The link expires in one hour.</p>
          <Link to="/login" className="btn btn-primary auth-submit">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="auth-form">
          <label className="form-control">
            <span className="label-text">Email address</span>
            <input className="input input-bordered" type="email" autoComplete="email" required value={email}
              onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary auth-submit" disabled={status === "sending"}>
            {status === "sending" ? <><span className="loading loading-spinner loading-sm" /> Sending link…</> : "Send reset link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
