import { useState } from "react";
import { api } from "../api";

export default function AvatarUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const sig = (await api.post("/upload/avatar")).data;
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
      onUploaded(data.secure_url);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" className="file-input file-input-bordered file-input-sm w-full max-w-xs" onChange={onFile} disabled={uploading} />
      {uploading && <p className="text-xs mt-1">Uploading…</p>}
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}
