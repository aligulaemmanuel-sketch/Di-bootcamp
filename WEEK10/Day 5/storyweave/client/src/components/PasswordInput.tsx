import { useState, type InputHTMLAttributes } from "react";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="password-input-wrap">
      <input {...props} type={visible ? "text" : "password"} className={`input input-bordered password-input ${props.className ?? ""}`} />
      <button
        className="password-visibility-toggle"
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.2 9.5 7-.4 1.1-1.2 2.3-2.3 3.4M6.2 6.2C4.3 7.5 3 9.4 2.5 12c1 2.8 4.5 7 9.5 7 1.2 0 2.3-.2 3.3-.7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        )}
      </button>
    </span>
  );
}
