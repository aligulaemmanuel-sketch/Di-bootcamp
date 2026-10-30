import { cookies } from "next/headers";
import Home, { type HomeInitialData } from "./page-client";

export const dynamic = "force-dynamic";

type AccountResponse = {
  user: HomeInitialData["user"];
  workspaces: HomeInitialData["workspaces"];
};

const emptyInitialData = (): HomeInitialData => ({
  user: null,
  workspaces: [],
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
});

async function getInitialData(resetRequested: boolean): Promise<HomeInitialData> {
  if (resetRequested) return emptyInitialData();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("maliwise_session")?.value;
  if (!sessionToken) return emptyInitialData();

  const apiUrl = process.env.API_URL ?? "http://localhost:4000";
  const sessionCookie = `maliwise_session=${encodeURIComponent(sessionToken)}`;
  const fetchApi = async <T,>(path: string, activeWorkspace?: string): Promise<T | null> => {
    const response = await fetch(new URL(`/api/${path}`, apiUrl), {
      cache: "no-store",
      headers: {
        Cookie: sessionCookie,
        ...(activeWorkspace ? { "X-Maliwise-Workspace": activeWorkspace } : {}),
      },
    });
    if (response.status === 401) return null;
    if (!response.ok) {
      throw new Error(`Wealth Sketch could not load your workspace (API returned ${response.status}).`);
    }
    return response.json() as Promise<T>;
  };

  const account = await fetchApi<AccountResponse>("auth/me");
  if (!account?.user) return emptyInitialData();

  const workspaces = account.workspaces ?? [];
  const requestedWorkspace = cookieStore.get("maliwise-active-workspace")?.value;
  const activeWorkspace = requestedWorkspace === "personal"
    ? "personal"
    : workspaces.some(({ id }) => id === requestedWorkspace)
      ? requestedWorkspace!
      : "personal";
  const data: HomeInitialData = {
    ...emptyInitialData(),
    user: account.user,
    workspaces,
    activeWorkspace,
  };

  if (activeWorkspace === "personal") {
    const [personalWorkspace, reminders, notifications] = await Promise.all([
      fetchApi<HomeInitialData["personalWorkspace"]>("personal", activeWorkspace),
      fetchApi<HomeInitialData["reminders"]>("reminders", activeWorkspace),
      fetchApi<HomeInitialData["notifications"]>("notifications", activeWorkspace),
    ]);
    if (!personalWorkspace || !reminders || !notifications) return emptyInitialData();
    return { ...data, personalWorkspace, reminders, notifications };
  }

  const [workspace, goals, reminders, notifications] = await Promise.all([
    fetchApi<NonNullable<HomeInitialData["workspace"]>>("workspace", activeWorkspace),
    fetchApi<HomeInitialData["goals"]>("goals", activeWorkspace),
    fetchApi<HomeInitialData["reminders"]>("reminders", activeWorkspace),
    fetchApi<HomeInitialData["notifications"]>("notifications", activeWorkspace),
  ]);
  if (!workspace || !goals || !reminders || !notifications) return emptyInitialData();
  if (workspace.group.type === "SACCO") {
    const [saccoWorkspace, saccoLoanProducts] = await Promise.all([
      fetchApi<HomeInitialData["saccoWorkspace"]>("sacco/entries", activeWorkspace),
      fetchApi<HomeInitialData["saccoLoanProducts"]>("sacco/loan-products", activeWorkspace),
    ]);
    if (!saccoWorkspace || !saccoLoanProducts) return emptyInitialData();
    return { ...data, workspace, goals, reminders, notifications, saccoWorkspace, saccoLoanProducts };
  }
  const analyticsData = await fetchApi<NonNullable<HomeInitialData["analyticsData"]>>("analytics?range=30d", activeWorkspace);
  if (!analyticsData) return emptyInitialData();
  return {
    ...data,
    workspace,
    goals,
    analyticsData,
    analyticsUpdatedAt: new Date().toISOString(),
    reminders,
    notifications,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string | string[]; invite?: string | string[]; reset?: string | string[] }>;
}) {
  const params = await searchParams;
  let initialData: HomeInitialData;
  let initialLoadError: string | null = null;
  try {
    initialData = await getInitialData(Boolean(params.reset));
  } catch (reason) {
    initialData = emptyInitialData();
    initialLoadError = reason instanceof Error
      ? reason.message
      : "We couldn't load your account right now. Please try again.";
  }
  const requestedAuth = Array.isArray(params.auth) ? params.auth[0] : params.auth;
  const initialAuthMode = requestedAuth === "register" || requestedAuth === "signup" ? "register" : "login";
  const hasAuthIntent = Boolean(params.reset || params.invite || requestedAuth);
  return (
    <Home
      initialAuthMode={initialAuthMode}
      initialData={initialData}
      initialLoadError={initialLoadError}
      initialShowLanding={!initialData.user && !hasAuthIntent}
    />
  );
}
