import Home, { type HomeInitialData } from "./page-client";

const initialData: HomeInitialData = {
  user: null,
  workspaces: [],
  pendingMemberships: [],
  activeWorkspace: "personal",
  workspace: null,
  goals: [],
  personalWorkspace: { goals: [], activities: [] },
  reminders: [],
  notifications: [],
  analyticsData: null,
  analyticsUpdatedAt: null,
  saccoWorkspace: { entries: [], totals: [], isManager: false },
  saccoLoanProducts: [],
};

export default function Page() {
  return (
    <Home
      initialAuthMode="login"
      initialData={initialData}
      initialLoadError={null}
      initialOAuthError={false}
      initialShowLanding
    />
  );
}
