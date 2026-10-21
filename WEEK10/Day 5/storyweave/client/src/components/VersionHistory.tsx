import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchVersions, restoreVersion } from "../store/storiesSlice";
import type { CollaboratorRole } from "../types";

export default function VersionHistory({
  storyId,
  myRole,
  onRestored,
}: {
  storyId: string;
  myRole: CollaboratorRole | null;
  onRestored?: () => void;
}) {
  const dispatch = useAppDispatch();
  const versions = useAppSelector((s) => s.stories.versions);
  const canEdit = myRole === "OWNER" || myRole === "EDITOR";

  useEffect(() => { dispatch(fetchVersions(storyId)); }, [storyId, dispatch]);

  async function restore(id: string) {
    if (!confirm("Restore this version? The current state will be overwritten (a new snapshot is saved).")) return;
    await dispatch(restoreVersion(id));
    onRestored?.();
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">Version history</h2>
      {versions.length === 0 ? (
        <p className="text-sm text-base-content/50">No saved versions yet.</p>
      ) : (
        <ul className="space-y-2">
          {versions.map((v) => (
            <li key={v.id} className="bg-base-100 rounded-xl p-3 shadow-sm flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">
                  v{v.versionNumber} {v.label && <span className="badge badge-outline badge-xs ml-1">{v.label}</span>}
                </p>
                <p className="text-xs text-base-content/50">
                  by {v.savedBy.username} · {new Date(v.createdAt).toLocaleString()}
                </p>
              </div>
              {canEdit && (
                <button className="btn btn-xs btn-outline" onClick={() => restore(v.id)}>Restore</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
