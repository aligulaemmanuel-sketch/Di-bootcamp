import { useState } from "react";
import { api } from "../api";

type UploadKind = "avatar" | "cover";

export default function AvatarUpload({
  onUploaded,
  kind = "avatar",
}: {
  onUploaded: (url: string) => void | Promise<void>;
  kind?: UploadKind;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose an image smaller than 10 MB.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const sig = (await api.post(kind === "cover" ? "/upload/profile-cover" : "/upload/avatar")).data;
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", String(sig.timestamp));
      form.append("folder", sig.folder);
      form.append("signature", sig.signature);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Upload failed");
      await onUploaded(data.secure_url);
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`profile-photo-upload ${kind === "cover" ? "profile-cover-upload" : ""}`}>
      <label className={kind === "cover" ? "profile-photo-button" : "avatar-upload-button"}>
        <input type="file" accept="image/*" className="profile-photo-input" onChange={onFile} disabled={uploading} />
        <span aria-hidden="true">{uploading ? "…" : kind === "cover" ? "↥" : "＋"}</span>
        {uploading ? "Uploading photo…" : kind === "cover" ? "Upload cover photo" : "Change profile photo"}
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
