"use client";

import {
  ArrowDownLeft,
  ArrowRight,
  Bell,
  Camera,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Download,
  Eye,
  EyeOff,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Target,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalyticsRange, DashboardAnalytics, DashboardAnalyticsData } from "./dashboard-analytics";

type Member = {
  id: string;
  name: string;
  phone: string;
  role: "OWNER" | "ADMIN" | "TREASURER" | "CHAIRPERSON" | "SECRETARY" | "CREDIT_OFFICER" | "MEMBER";
  joinedAt: string;
};

type MemberInvitation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Member["role"];
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  status: "PENDING" | "REVIEW" | "ACCEPTED" | "REJECTED" | "EXPIRED";
};

type MembershipRequest = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: Member["role"];
  joinedAt: string;
};

type Contribution = {
  id: string;
  reference: string;
  amountMinor: string;
  method: "MPESA" | "BANK" | "CASH";
  note: string | null;
  createdAt: string;
  member: { id: string; name: string };
  savingsGoal: { id: string; title: string } | null;
};

type Loan = {
  id: string;
  amountMinor: string;
  purpose: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  createdAt: string;
  member: { id: string; name: string };
  product: SaccoLoanProduct | null;
};

type Workspace = {
  group: { id: string; name: string; currency: string; type: "CHAMA" | "SACCO" };
  currentMemberId: string | null;
  canManageGoals: boolean;
  canManageMembers: boolean;
  canRecordSaccoEntries: boolean;
  canDecideLoans: boolean;
  isAdmin: boolean;
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  summary: {
    memberCount: number;
    contributionCount: number;
    contributionTotalMinor: string;
    pendingLoans: number;
  };
};

type SavingsGoal = {
  id: string;
  title: string;
  targetMinor: string;
  savedMinor: string;
  progressPercent: number;
  disciplineScore: number;
  amountBehindMinor: string;
  suggestedWeeklyMinor: string;
  projectedCompletionAt: string | null;
  hasStarted: boolean;
  memberId: string | null;
  startsAt: string;
  deadline: string;
  createdAt: string;
  member: { id: string; name: string } | null;
};

type Account = { id: string; name: string; email: string; phone: string | null; profilePhotoData: string | null };
type GroupWorkspace = { id: string; name: string; currency: string; type: "CHAMA" | "SACCO"; role: Member["role"] };
type SaccoLoanProduct = { id: string; name: string; calculationMethod: "FLAT" | "REDUCING_BALANCE"; annualInterestBps: number; termMonths: number; createdAt?: string };
type SaccoEntry = { id: string; kind: "SHARE_CAPITAL" | "DEPOSIT" | "WITHDRAWAL"; accountType: "BOSA" | "FOSA"; amountMinor: string; reference: string; note: string | null; createdAt: string; member: { id: string; name: string } };
type SaccoTotal = { memberId: string; kind: SaccoEntry["kind"]; accountType: SaccoEntry["accountType"]; amountMinor: string };
type SaccoWorkspace = { entries: SaccoEntry[]; totals: SaccoTotal[]; isManager: boolean };
type FinancialProviderSetup = {
  type: "BANK" | "MMF" | "INVESTMENT";
  providerName: string;
  maskedIdentifier: string | null;
  productName: string | null;
  updatedAt: string;
};
type PersonalActivity = { id: string; title: string; kind: "SAVING" | "INVESTMENT" | "INCOME" | "EXPENSE"; amountMinor: string; occurredAt: string; goal: { id: string; title: string } | null };
type PersonalGoal = { id: string; title: string; kind: "SAVING" | "INVESTMENT"; targetMinor: string; savedMinor: string; progressPercent: number; targetDate: string };
type PersonalWorkspace = { goals: PersonalGoal[]; activities: PersonalActivity[] };
type Reminder = { id: string; title: string; message: string; dueAt: string; emailEnabled: boolean; smsEnabled: boolean; groupId: string | null; processedAt: string | null };
type UserNotification = { id: string; title: string; message: string; readAt: string | null; createdAt: string; deliveryError: string | null };
type DarajaConfig = { configured: boolean; shortcode: string | null; shortcodeType: "PAYBILL" | "TILL"; environment: "sandbox" };
type DarajaPayment = { id: string; status: "PENDING" | "SUCCEEDED" | "FAILED"; amountMinor: string; receipt: string | null; message: string | null };
type Section = "Overview" | "Personal" | "Reminders" | "Savings" | "Members" | "Contributions" | "Sacco accounts" | "Loans" | "Reports" | "Settings";
type ModalKind = "member" | "contribution" | "payment" | "loan" | "goal" | "personalActivity" | "personalGoal" | "reminder" | "createGroup" | "saccoEntry" | "saccoProduct" | null;

class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const apiBaseUrl = (/^https?:\/\//i.test(configuredApiUrl) ? configuredApiUrl : `https://${configuredApiUrl}`).replace(/\/+$/, "");

type OAuthProvider = "google" | "apple" | "microsoft" | "facebook" | "github";

function OAuthProviderIcon({ provider }: { provider: OAuthProvider }) {
  if (provider === "google") {
    return <svg aria-hidden="true" className="oauth-provider-icon" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v2.94h3.76c2.2-2.03 3.68-5.02 3.68-8.58Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.93l-3.76-2.94c-1.04.7-2.37 1.12-4.19 1.12-3.22 0-5.95-2.17-6.93-5.09H1.19v3.02A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.07 14.16a7.2 7.2 0 0 1 0-4.32V6.82H1.19a12 12 0 0 0 0 10.36l3.88-3.02Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.81l3.44-3.44C17.96 1.15 15.24 0 12 0A12 12 0 0 0 1.19 6.82l3.88 3.02C6.05 6.92 8.78 4.75 12 4.75Z" />
    </svg>;
  }
  if (provider === "apple") {
    return <svg aria-hidden="true" className="oauth-provider-icon oauth-provider-icon-dark" viewBox="0 0 24 24">
      <path d="M16.6 1.9c0 1.3-.5 2.6-1.4 3.6-.9 1-2.3 1.8-3.7 1.7-.2-1.3.5-2.7 1.3-3.6.9-1 2.4-1.7 3.8-1.7ZM20.9 17.6c-.6 1.3-.9 1.9-1.6 3.1-1 1.5-2.4 3.5-4.2 3.5-1.6 0-2.1-1-4.4-1-2.2 0-2.8 1-4.4 1-1.8 0-3.1-1.8-4.1-3.3-2.9-4.4-3.2-9.6-1.4-12.4 1.3-2 3.4-3.2 5.3-3.2 1.7 0 2.8 1 4.3 1 1.4 0 2.3-1 4.4-1 1.6 0 3.4.9 4.7 2.4-4.1 2.2-3.5 8.1 1.4 9.9Z" transform="translate(1 0) scale(.92)" />
    </svg>;
  }
  if (provider === "microsoft") {
    return <svg aria-hidden="true" className="oauth-provider-icon" viewBox="0 0 24 24">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>;
  }
  if (provider === "facebook") {
    return <svg aria-hidden="true" className="oauth-provider-icon" viewBox="0 0 24 24">
      <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.91v-8.42H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.54-4.69 1.31 0 2.68.23 2.68.23v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.27h3.32l-.53 3.49h-2.79v8.42C19.61 23.09 24 18.09 24 12.07Z" />
    </svg>;
  }
  return <svg aria-hidden="true" className="oauth-provider-icon oauth-provider-icon-dark" viewBox="0 0 24 24">
    <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.23 1.83 1.23 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12.01 12.01 0 0 0 12 .5Z" />
  </svg>;
}

const navItems: { label: Section; icon: typeof LayoutDashboard }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Personal", icon: Wallet },
  { label: "Reminders", icon: Bell },
  { label: "Savings", icon: Target },
  { label: "Members", icon: Users },
  { label: "Contributions", icon: ArrowDownLeft },
  { label: "Sacco accounts", icon: Wallet },
  { label: "Loans", icon: HandCoins },
  { label: "Reports", icon: SlidersHorizontal },
];

function kes(minor: string | bigint) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Number(BigInt(minor) / 100n));
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(new Date(value));
}

function inputDate(date = new Date()) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function inputDateTime(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(typeof window !== "undefined" && window.localStorage.getItem("maliwise-active-workspace")
          ? { "X-Maliwise-Workspace": window.localStorage.getItem("maliwise-active-workspace")! }
          : {}),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (reason) {
    if (reason instanceof TypeError) {
      throw new Error("Cannot reach the Wealth Sketch API. Check that the API server is running, then try again.");
    }
    throw reason;
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const body = payload as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message) ? body.message.join(" ") : body?.message;
    throw new ApiError(message || `Request failed (${response.status}).`, response.status);
  }
  return payload as T;
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-labelledby="modal-title" aria-modal="true" className="modal" role="dialog">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">WEALTH SKETCH WORKSPACE</span>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button aria-label="Close dialog" className="icon-button" onClick={onClose}><X size={19} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

export type HomeInitialData = {
  user: Account | null;
  workspaces: GroupWorkspace[];
  pendingMemberships: { id: string; name: string; type: "CHAMA" | "SACCO" }[];
  activeWorkspace: string;
  workspace: Workspace | null;
  goals: SavingsGoal[];
  personalWorkspace: PersonalWorkspace;
  reminders: Reminder[];
  notifications: UserNotification[];
  analyticsData: DashboardAnalyticsData | null;
  analyticsUpdatedAt: string | null;
  saccoWorkspace: SaccoWorkspace;
  saccoLoanProducts: SaccoLoanProduct[];
};

export default function Home({
  initialData,
  initialAuthMode,
  initialLoadError,
  initialOAuthError,
  initialShowLanding,
}: {
  initialData: HomeInitialData;
  initialAuthMode: "login" | "register";
  initialLoadError: string | null;
  initialOAuthError: boolean;
  initialShowLanding: boolean;
}) {
  const [account, setAccount] = useState<Account | null>(initialData.user);
  const [workspace, setWorkspace] = useState<Workspace | null>(initialData.workspace);
  const [memberInvitations, setMemberInvitations] = useState<MemberInvitation[] | null>(null);
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[] | null>(null);
  const [pendingMemberships, setPendingMemberships] = useState(initialData.pendingMemberships);
  const [groupWorkspaces, setGroupWorkspaces] = useState<GroupWorkspace[]>(initialData.workspaces);
  const [activeWorkspace, setActiveWorkspace] = useState(initialData.activeWorkspace);
  const [goals, setGoals] = useState<SavingsGoal[]>(initialData.goals);
  const [personalWorkspace, setPersonalWorkspace] = useState<PersonalWorkspace>(initialData.personalWorkspace);
  const [reminders, setReminders] = useState<Reminder[]>(initialData.reminders);
  const [notifications, setNotifications] = useState<UserNotification[]>(initialData.notifications);
  const [saccoWorkspace, setSaccoWorkspace] = useState<SaccoWorkspace>(initialData.saccoWorkspace);
  const [saccoLoanProducts, setSaccoLoanProducts] = useState<SaccoLoanProduct[]>(initialData.saccoLoanProducts);
  const [financialProviders, setFinancialProviders] = useState<FinancialProviderSetup[] | null>(null);
  const [authState, setAuthState] = useState<"signed-out" | "signed-in">(initialData.user ? "signed-in" : "signed-out");
  const [authMode, setAuthMode] = useState<"login" | "register" | "reset">(initialAuthMode);
  const [showLanding, setShowLanding] = useState(initialShowLanding);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [darajaConfig, setDarajaConfig] = useState<DarajaConfig | null>(null);
  const [darajaConfigLoading, setDarajaConfigLoading] = useState(false);
  const [darajaConfigForm, setDarajaConfigForm] = useState({ shortcode: "", shortcodeType: "PAYBILL" as "PAYBILL" | "TILL", consumerKey: "", consumerSecret: "", passkey: "" });
  const [darajaPayment, setDarajaPayment] = useState<DarajaPayment | null>(null);
  const [invitationToken, setInvitationToken] = useState("");
  const [invitation, setInvitation] = useState<{ email: string; name: string; groupName: string; existingAccount?: boolean } | null>(null);
  const [createGroupOnSignup, setCreateGroupOnSignup] = useState(true);
  const [signupGroupType, setSignupGroupType] = useState<"CHAMA" | "SACCO">("CHAMA");
  const [section, setSection] = useState<Section>(initialData.activeWorkspace === "personal" ? "Personal" : "Overview");
  const [modal, setModal] = useState<ModalKind>(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState(initialOAuthError
    ? "Social sign-in could not be completed. Check the provider setup and try again."
    : initialLoadError ?? "");
  const [authMessage, setAuthMessage] = useState("");
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [passwordResetToken, setPasswordResetToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState<AnalyticsRange>("30d");
  const [analyticsData, setAnalyticsData] = useState<DashboardAnalyticsData | null>(initialData.analyticsData);
  const [analyticsUpdatedAt, setAnalyticsUpdatedAt] = useState<Date | null>(initialData.analyticsUpdatedAt ? new Date(initialData.analyticsUpdatedAt) : null);
  const [liveStream, setLiveStream] = useState(false);
  const [dashboardTheme, setDashboardTheme] = useState<"light" | "dark">("light");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const contributionAttempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const profilePhotoInput = useRef<HTMLInputElement>(null);
  const loginEmailInput = useRef<HTMLInputElement>(null);
  const registrationNameInput = useRef<HTMLInputElement>(null);
  const invitationPasswordInput = useRef<HTMLInputElement>(null);
  const resetEmailInput = useRef<HTMLInputElement>(null);
  const resetPasswordInput = useRef<HTMLInputElement>(null);
  const skipInitialAnalyticsRefresh = useRef(Boolean(initialData.analyticsData));

  const persistWorkspace = useCallback((workspaceId: string) => {
    window.localStorage.setItem("maliwise-active-workspace", workspaceId);
    document.cookie = `maliwise-active-workspace=${encodeURIComponent(workspaceId)}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  }, []);

  const refreshSaccoWorkspace = useCallback(async () => {
    const [entries, products] = await Promise.all([
      api<SaccoWorkspace>("sacco/entries"),
      api<SaccoLoanProduct[]>("sacco/loan-products"),
    ]);
    setSaccoWorkspace(entries);
    setSaccoLoanProducts(products);
  }, []);

  const refreshWorkspace = useCallback(async () => {
    const [response, savingsGoals] = await Promise.all([
      api<Workspace>("workspace"),
      api<SavingsGoal[]>("goals"),
    ]);
    setWorkspace(response);
    setGoals(savingsGoals);
    if (response.group.type === "SACCO") await refreshSaccoWorkspace();
    else {
      setSaccoWorkspace({ entries: [], totals: [], isManager: false });
      setSaccoLoanProducts([]);
    }
    return response;
  }, [refreshSaccoWorkspace]);

  const refreshMemberInvitations = useCallback(async () => {
    const invitations = await api<MemberInvitation[]>("invitations");
    setMemberInvitations(invitations);
  }, []);

  const refreshMembershipRequests = useCallback(async () => {
    const requests = await api<MembershipRequest[]>("membership-requests");
    setMembershipRequests(requests);
  }, []);

  const refreshAnalytics = useCallback(async (range: AnalyticsRange, signal?: AbortSignal) => {
    const result = await api<DashboardAnalyticsData>(`analytics?range=${range}`, { signal });
    setAnalyticsData(result);
    setAnalyticsUpdatedAt(new Date());
  }, []);

  const refreshPersonalWorkspace = useCallback(async () => {
    const result = await api<PersonalWorkspace>("personal");
    setPersonalWorkspace(result);
  }, []);

  const refreshReminders = useCallback(async () => {
    const [items, alerts] = await Promise.all([
      api<Reminder[]>("reminders"),
      api<UserNotification[]>("notifications"),
    ]);
    setReminders(items);
    setNotifications(alerts);
  }, []);

  const loadAccountWorkspaces = useCallback(async () => {
    const result = await api<{
      user: Account | null;
      workspaces: GroupWorkspace[];
      pendingMemberships: { id: string; name: string; type: "CHAMA" | "SACCO" }[];
    }>("auth/me", {
      headers: { "X-Maliwise-Workspace": "" },
    });
    if (!result.user) throw new Error("Please sign in to continue.");
    setAccount(result.user);
    setPendingMemberships(result.pendingMemberships ?? []);
    const available = result.workspaces ?? [];
    setGroupWorkspaces(available);
    const saved = window.localStorage.getItem("maliwise-active-workspace");
    const chosen = saved === "personal"
      ? "personal"
      : available.some((group) => group.id === saved)
        ? saved!
        : available[0]?.id ?? "personal";
    persistWorkspace(chosen);
    setActiveWorkspace(chosen);
    if (chosen === "personal") {
      setWorkspace(null);
      setGoals([]);
      setSection("Personal");
      await Promise.all([refreshPersonalWorkspace(), refreshReminders()]);
    } else {
      setSection("Overview");
      const selected = await refreshWorkspace();
      await Promise.all([
        ...(selected.group.type === "SACCO" ? [] : [refreshAnalytics("30d")]),
        refreshReminders(),
      ]);
    }
  }, [persistWorkspace, refreshAnalytics, refreshPersonalWorkspace, refreshReminders, refreshWorkspace]);

  const selectWorkspace = useCallback(async (workspaceId: string) => {
    persistWorkspace(workspaceId);
    setActiveWorkspace(workspaceId);
    setError("");
    setMenuOpen(false);
    if (workspaceId === "personal") {
      setWorkspace(null);
      setGoals([]);
      setSection("Personal");
      await Promise.all([refreshPersonalWorkspace(), refreshReminders()]);
    } else {
      setSection("Overview");
      const selected = await refreshWorkspace();
      await Promise.all([
        ...(selected.group.type === "SACCO" ? [] : [refreshAnalytics(analyticsRange)]),
        refreshReminders(),
      ]);
    }
  }, [analyticsRange, persistWorkspace, refreshAnalytics, refreshPersonalWorkspace, refreshReminders, refreshWorkspace]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("maliwise-dashboard-theme");
    if (savedTheme === "light" || savedTheme === "dark") setDashboardTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (!account) return;
    setProfileName(account.name);
    setProfilePhone(account.phone ?? "");
    setProfilePhoto(account.profilePhotoData);
  }, [account]);

  useEffect(() => {
    if (section !== "Members" || !workspace?.canManageMembers) {
      setMemberInvitations(null);
      setMembershipRequests(null);
      return;
    }
    let active = true;
    setMemberInvitations(null);
    setMembershipRequests(null);
    Promise.all([api<MemberInvitation[]>("invitations"), api<MembershipRequest[]>("membership-requests")])
      .then(([invitations, requests]) => {
        if (active) {
          setMemberInvitations(invitations);
          setMembershipRequests(requests);
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load member review information.");
      });
    return () => { active = false; };
  }, [activeWorkspace, section, workspace?.canManageMembers]);

  const settingsGroupId = workspace?.group.id;
  useEffect(() => {
    if (section !== "Settings" || !settingsGroupId) {
      setFinancialProviders(null);
      return;
    }
    let active = true;
    setFinancialProviders(null);
    api<FinancialProviderSetup[]>("financial-providers")
      .then((providers) => { if (active) setFinancialProviders(providers); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load group provider details.");
      });
    return () => { active = false; };
  }, [activeWorkspace, section, settingsGroupId]);

  useEffect(() => {
    window.localStorage.setItem("maliwise-dashboard-theme", dashboardTheme);
  }, [dashboardTheme]);

  useEffect(() => {
    if (authState !== "signed-in" || section !== "Overview" || workspace?.group.type === "SACCO") return;
    if (skipInitialAnalyticsRefresh.current) {
      skipInitialAnalyticsRefresh.current = false;
      return;
    }
    const controller = new AbortController();
    refreshAnalytics(analyticsRange, controller.signal).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to load group analytics.");
    });
    return () => controller.abort();
  }, [analyticsRange, authState, refreshAnalytics, section, workspace?.group.type]);

  useEffect(() => {
    if (!liveStream || authState !== "signed-in" || section !== "Overview" || workspace?.group.type === "SACCO") return;
    let active = true;
    const interval = window.setInterval(() => {
      Promise.all([refreshWorkspace(), refreshAnalytics(analyticsRange)]).catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Live analytics refresh failed.");
      });
    }, 15_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [analyticsRange, authState, liveStream, refreshAnalytics, refreshWorkspace, section, workspace?.group.type]);

  useEffect(() => {
    let mounted = true;
    if (new URLSearchParams(window.location.search).has("reset")) {
      return () => { mounted = false; };
    }
    loadAccountWorkspaces()
      .then(() => {
        if (mounted) setAuthState("signed-in");
      })
      .catch((reason: unknown) => {
        if (!mounted || (reason instanceof ApiError && reason.status === 401)) return;
        setError(reason instanceof Error ? reason.message : "Unable to load your account.");
      });
    return () => { mounted = false; };
  }, [loadAccountWorkspaces]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedAuth = params.get("auth");
    const invite = params.get("invite");
    const reset = params.get("reset");
    const verifyEmail = params.get("verifyEmail");
    if (requestedAuth === "register" || requestedAuth === "signup") {
      setAuthMode("register");
      setShowLanding(false);
    } else if (requestedAuth || params.has("oauth_error")) {
      setAuthMode("login");
      setShowLanding(false);
    }
    if (params.has("oauth_error")) {
      setError("Social sign-in could not be completed. Check the provider setup and try again.");
    }
    if (invite) {
      setInvitationToken(invite);
      setAuthMode("register");
      setShowLanding(false);
      window.history.replaceState({}, "", window.location.pathname);
      api<{ email: string; name: string; groupName: string }>(`auth/invitation/${encodeURIComponent(invite)}`)
        .then(setInvitation)
        .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "This invitation could not be verified."));
    } else if (verifyEmail) {
      setShowLanding(false);
      setAuthMode("login");
      window.history.replaceState({}, "", window.location.pathname);
      api<{ message: string }>("auth/email-verification/confirm", {
        method: "POST",
        body: JSON.stringify({ token: verifyEmail }),
      })
        .then((result) => setAuthMessage(result.message))
        .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "This email verification link could not be verified."));
    } else if (reset) {
      setShowLanding(false);
      setPasswordResetToken(reset);
      setAuthMode("reset");
      window.history.replaceState({}, "", window.location.pathname);
      window.requestAnimationFrame(() => resetPasswordInput.current?.focus({ preventScroll: true }));
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (section !== "Settings" || !workspace?.isAdmin || workspace.group.type !== "CHAMA") return;
    let mounted = true;
    setDarajaConfigLoading(true);
    api<DarajaConfig>("payments/daraja/config")
      .then((configuration) => {
        if (!mounted) return;
        setDarajaConfig(configuration);
        setDarajaConfigForm((current) => ({
          ...current,
          shortcode: configuration.shortcode ?? "",
          shortcodeType: configuration.shortcodeType,
        }));
      })
      .catch((reason: unknown) => {
        if (mounted) setError(reason instanceof Error ? reason.message : "Unable to load M-Pesa settings.");
      })
      .finally(() => { if (mounted) setDarajaConfigLoading(false); });
    return () => { mounted = false; };
  }, [section, workspace?.group.type, workspace?.isAdmin]);

  const filteredMembers = useMemo(() =>
    (workspace?.members ?? []).filter((member) =>
      `${member.name} ${member.role} ${member.phone}`.toLowerCase().includes(search.toLowerCase()),
    ), [workspace?.members, search]);
  const filteredContributions = useMemo(() =>
    (workspace?.contributions ?? []).filter((item) =>
      `${item.member.name} ${item.reference} ${item.method}`.toLowerCase().includes(search.toLowerCase()),
    ), [workspace?.contributions, search]);
  const currentMonthContributions = useMemo(() => {
    const now = new Date();
    return (workspace?.contributions ?? []).filter((item) => {
      const date = new Date(item.createdAt);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }).length;
  }, [workspace?.contributions]);
  const pendingLoans = workspace?.loans.filter((loan) => loan.status === "PENDING") ?? [];
  const notificationCount = notifications.filter((notification) => !notification.readAt).length + (workspace?.summary.pendingLoans ?? 0);
  const activeGoals = goals.filter((goal) => goal.progressPercent < 100);
  const saccoSummary = useMemo(() => {
    const balance = (accountType: SaccoEntry["accountType"], kind: SaccoEntry["kind"]) =>
      saccoWorkspace.totals
        .filter((item) => item.accountType === accountType && item.kind === kind)
        .reduce((sum, item) => sum + BigInt(item.amountMinor), 0n);
    const total = (accountType: SaccoEntry["accountType"]) =>
      saccoWorkspace.totals
        .filter((item) => item.accountType === accountType && item.kind !== "SHARE_CAPITAL")
        .reduce((sum, item) => sum + (item.kind === "WITHDRAWAL" ? -BigInt(item.amountMinor) : BigInt(item.amountMinor)), 0n);
    return {
      shareCapital: balance("BOSA", "SHARE_CAPITAL"),
      bosaDeposits: total("BOSA"),
      fosaDeposits: total("FOSA"),
    };
  }, [saccoWorkspace.totals]);
  const activeNavItems = activeWorkspace === "personal"
    ? navItems.filter(({ label }) => label === "Personal" || label === "Reminders")
    : workspace?.group.type === "SACCO"
      ? navItems.filter(({ label }) => ["Overview", "Members", "Sacco accounts", "Loans", "Reminders", "Reports"].includes(label))
      : navItems.filter(({ label }) => label !== "Personal" && label !== "Sacco accounts");
  const activeMembership = groupWorkspaces.find((group) => group.id === activeWorkspace);
  const canManageSaccoProducts = activeMembership?.role === "CHAIRPERSON" || activeMembership?.role === "CREDIT_OFFICER";
  const canChooseLoanMember = activeMembership !== undefined &&
    ["OWNER", "ADMIN", "TREASURER", "CHAIRPERSON"].includes(activeMembership.role);
  const personalSavingsMinor = personalWorkspace.activities
    .filter((activity) => activity.kind === "SAVING")
    .reduce((total, activity) => total + BigInt(activity.amountMinor), 0n);
  const personalInvestmentMinor = personalWorkspace.activities
    .filter((activity) => activity.kind === "INVESTMENT")
    .reduce((total, activity) => total + BigInt(activity.amountMinor), 0n);
  const pageTitle = section === "Overview" ? `Welcome, ${account?.name.split(" ")[0] ?? ""}` : section;

  function flipAuthCard(mode: "login" | "register" | "reset") {
    setShowLanding(false);
    setAuthMode(mode);
    setError("");
    setAuthMessage("");
    window.requestAnimationFrame(() => {
      const input = mode === "login"
        ? loginEmailInput.current
        : mode === "reset" && passwordResetToken
          ? resetPasswordInput.current
          : mode === "reset"
            ? resetEmailInput.current
        : invitationToken
          ? invitationPasswordInput.current
          : registrationNameInput.current;
      window.scrollTo({ top: 0, behavior: "auto" });
      input?.focus({ preventScroll: true });
    });
  }

  async function runAction(action: () => Promise<unknown>, success: string) {
    setError("");
    setBusy(true);
    try {
      await action();
      if (activeWorkspace === "personal") {
        await Promise.all([refreshPersonalWorkspace(), refreshReminders()]);
      } else {
        const selected = await refreshWorkspace();
        await Promise.all([
          ...(selected.group.type === "SACCO" ? [] : [refreshAnalytics(analyticsRange)]),
          ...(section === "Members" && selected.canManageMembers ? [refreshMemberInvitations(), refreshMembershipRequests()] : []),
          refreshReminders(),
        ]);
      }
      setNotice(success);
      setModal(null);
      contributionAttempt.current = null;
      setSearch("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The request could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPersonalActivity(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      await runAction(
        () => api("personal/activities", { method: "POST", body: JSON.stringify(Object.fromEntries(form.entries())) }),
        "Personal record saved privately.",
      );
    }

  async function submitPersonalGoal(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      await runAction(
        () => api("personal/goals", { method: "POST", body: JSON.stringify(Object.fromEntries(form.entries())) }),
        "Personal goal created.",
      );
    }

  async function submitReminder(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const body: Record<string, string | boolean> = Object.fromEntries(
        [...form.entries()].map(([key, value]) => [key, String(value)]),
      );
      body.emailEnabled = form.has("emailEnabled");
      body.smsEnabled = form.has("smsEnabled");
      body.sharedWithGroup = form.has("sharedWithGroup");
      await runAction(
        () => api("reminders", { method: "POST", body: JSON.stringify(body) }),
        "Reminder scheduled.",
      );
    }

  async function markNotificationRead(notification: UserNotification) {
      try {
        await api(`notifications/${encodeURIComponent(notification.id)}/read`, { method: "PATCH" });
        await refreshReminders();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Unable to update this notification.");
      }
    }
  async function chooseProfilePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Choose a PNG, JPEG, or WebP photo.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Choose a photo smaller than 8 MB.");
      return;
    }
    setError("");
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare the selected photo.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const photo = canvas.toDataURL("image/jpeg", 0.82);
      if (photo.length > 1_400_000) throw new Error("Choose a simpler or smaller photo.");
      setProfilePhoto(photo);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The selected photo could not be opened.");
    }
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    setBusy(true);
    setError("");
    try {
      const updated = await api<Account>("profile", {
        method: "PATCH",
        body: JSON.stringify({ name: profileName, phone: profilePhone || undefined, profilePhotoData: profilePhoto }),
      });
      setAccount(updated);
      if (activeWorkspace !== "personal") await refreshWorkspace();
      setNotice("Profile updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update your profile.");
    } finally {
      setBusy(false);
    }
  }

  function openPaymentModal() {
    setDarajaPayment((current) => current?.status === "PENDING" ? current : null);
    setModal("payment");
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const body: Record<string, string | boolean> = Object.fromEntries(
        [...form.entries()].map(([key, value]) => [key, String(value)]),
      );
      const confirmation = body.confirmPassword;
      delete body.confirmPassword;
      if (authMode === "register" && body.password !== confirmation) {
        throw new Error("The passwords do not match.");
      }
      if (authMode === "register" && !invitationToken && !createGroupOnSignup) {
        delete body.groupName;
        delete body.phone;
        delete body.groupType;
        delete body.constitutionSigned;
      } else if (authMode === "register" && !invitationToken) {
        body.groupType = signupGroupType;
        body.constitutionSigned = body.constitutionSigned === "on" || body.constitutionSigned === "true";
        if (body.groupName && body.phone && body.constitutionSigned !== true) {
          throw new Error("Confirm that the Chama or SACCO constitution or bylaws have been signed before creating the workspace.");
        }
      }
      if (invitationToken) body.token = invitationToken;
      const endpoint = invitationToken
        ? "auth/accept-invitation"
        : `auth/${authMode === "register" ? "register" : "login"}`;
      await api<unknown>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (authMode === "register" && !invitationToken) {
        const email = String(body.email ?? "").trim();
        if (loginEmailInput.current && email) loginEmailInput.current.value = email;
        setAuthMode("login");
        setAuthMessage(`Account created for ${email}. Check your inbox for a verification link. You can resend it below if it does not arrive.`);
        setCanResendVerification(true);
        setPasswordVisible(false);
        return;
      }
      await loadAccountWorkspaces();
      setAuthState("signed-in");
      setCanResendVerification(false);
      if (invitationToken) {
        const url = new URL(window.location.href);
        url.searchParams.delete("invite");
        window.history.replaceState({}, "", url);
        setInvitationToken("");
        setInvitation(null);
      }
    } catch (reason) {
      if (authMode === "login" && reason instanceof ApiError && reason.status === 401 && reason.message.toLowerCase().includes("verify your email")) {
        setCanResendVerification(true);
      }
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function resendEmailVerification() {
    setError("");
    setAuthMessage("");
    const email = loginEmailInput.current?.value.trim();
    if (!email) {
      setError("Enter your email address first.");
      loginEmailInput.current?.focus();
      return;
    }
    setBusy(true);
    try {
      const result = await api<{ message: string }>("auth/email-verification/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setAuthMessage(result.message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to resend the verification email.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPasswordResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setAuthMessage("");
    try {
      const email = String(form.get("email") ?? "");
      const result = await api<{ message: string }>("auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setAuthMessage(result.message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to request a password reset.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmPassword") ?? "");
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({ token: passwordResetToken, password }),
      });
      setPasswordResetToken("");
      setPasswordVisible(false);
      setConfirmPasswordVisible(false);
      flipAuthCard("login");
      setAuthMessage("Your password has been reset. Sign in with your new password.");
      window.history.replaceState({}, "", window.location.pathname);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to reset your password.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    try {
      await api("auth/logout", { method: "POST" });
      setAccount(null);
      setWorkspace(null);
      document.cookie = `maliwise-active-workspace=; Path=/; Max-Age=0; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
      setGroupWorkspaces([]);
      setActiveWorkspace("personal");
      setAuthState("signed-out");
      setAuthMode("login");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign out.");
    }
  }

  async function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction(() => api("invitations", { method: "POST", body: JSON.stringify(Object.fromEntries(form.entries())) }), "Invitation email sent.");
  }

  async function decideMembership(id: string, decision: "APPROVE" | "REJECT") {
    await runAction(
      () => api(`membership-requests/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ decision }),
      }),
      decision === "APPROVE" ? "Membership approved." : "Membership request rejected.",
    );
  }

  async function submitFinancialProvider(type: FinancialProviderSetup["type"], event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const saved = await api<FinancialProviderSetup>("financial-providers", {
        method: "PUT",
        body: JSON.stringify({
          type,
          providerName: form.get("providerName"),
          maskedIdentifier: form.get("maskedIdentifier"),
          productName: form.get("productName"),
        }),
      });
      setFinancialProviders((current) => [
        ...(current ?? []).filter((provider) => provider.type !== type),
        saved,
      ]);
      setNotice("Provider details saved. Automatic balance syncing is not enabled.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save provider details.");
    } finally {
      setBusy(false);
    }
  }

  async function submitContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    if (!values.savingsGoalId) delete values.savingsGoalId;
    const fingerprint = JSON.stringify(values);
    if (contributionAttempt.current?.fingerprint !== fingerprint) {
      contributionAttempt.current = { fingerprint, key: crypto.randomUUID() };
    }
    const idempotencyKey = contributionAttempt.current.key;
    await runAction(() => api("contributions", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: fingerprint,
    }), "Contribution recorded in the group ledger.");
  }

  async function submitDarajaConfiguration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { consumerKey, consumerSecret, passkey, shortcode, shortcodeType } = darajaConfigForm;
      const configuration = await api<DarajaConfig>("payments/daraja/config", {
        method: "PUT",
        body: JSON.stringify({ shortcode, shortcodeType, consumerKey, consumerSecret, passkey }),
      });
      setDarajaConfig(configuration);
      setDarajaConfigForm({
        shortcode: configuration.shortcode ?? "",
        shortcodeType: configuration.shortcodeType,
        consumerKey: "",
        consumerSecret: "",
        passkey: "",
      });
      setNotice("Sandbox M-Pesa settings saved securely.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save M-Pesa settings.");
    } finally {
      setBusy(false);
    }
  }

  async function submitDarajaPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      let payment = darajaPayment?.status === "PENDING" ? darajaPayment : null;
      if (!payment) {
        const form = new FormData(event.currentTarget);
        const values = Object.fromEntries(form.entries());
        if (!values.savingsGoalId) delete values.savingsGoalId;
        payment = await api<DarajaPayment>("payments/daraja/stk-push", {
          method: "POST",
          body: JSON.stringify(values),
        });
      }
      setDarajaPayment(payment);
      const deadline = Date.now() + 60_000;
      while (payment.status === "PENDING" && Date.now() < deadline) {
        await new Promise((resolve) => window.setTimeout(resolve, 3000));
        try {
          payment = await api<DarajaPayment>(`payments/daraja/stk-push/${encodeURIComponent(payment.id)}`);
          setDarajaPayment(payment);
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : "Unable to verify the payment status. You can check again.");
          break;
        }
      }
      if (payment.status === "SUCCEEDED") {
        await Promise.all([refreshWorkspace(), refreshAnalytics(analyticsRange)]);
        setNotice(`Payment received and confirmed${payment.receipt ? ` · ${payment.receipt}` : ""}.`);
        setModal(null);
      } else if (payment.status === "FAILED") {
        setError(payment.message ?? "The M-Pesa payment was not completed.");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to start the M-Pesa payment.");
    } finally {
      setBusy(false);
    }
  }

  async function submitLoan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (workspace?.group.type === "SACCO" && !form.get("productId")) {
      setError("Choose a SACCO loan product.");
      return;
    }
    await runAction(() => api("loans", { method: "POST", body: JSON.stringify(Object.fromEntries(form.entries())) }), "Loan request submitted.");
  }

  async function submitSaccoEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    await runAction(() => api("sacco/entries", {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify(body),
    }), "Manual SACCO tracking entry saved.");
  }

  async function submitSaccoProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const annualInterestPercent = Number(form.get("annualInterestPercent"));
    if (!Number.isFinite(annualInterestPercent) || annualInterestPercent < 0 || annualInterestPercent > 99.99) {
      setError("Enter an annual interest rate between 0 and 99.99 percent.");
      return;
    }
    form.delete("annualInterestPercent");
    form.set("annualInterestBps", String(Math.round(annualInterestPercent * 100)));
    await runAction(
      () => api("sacco/loan-products", { method: "POST", body: JSON.stringify(Object.fromEntries(form.entries())) }),
      "SACCO loan product created.",
    );
  }

  async function submitGroupWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const signed = form.get("constitutionSigned") === "on" || form.get("constitutionSigned") === "true";
    if (!signed) {
      setError("Confirm that the Chama or SACCO constitution or bylaws have been signed before creating the workspace.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await api<GroupWorkspace>("groups", {
        method: "POST",
        body: JSON.stringify({ ...Object.fromEntries(form.entries()), constitutionSigned: true }),
      });
      await loadAccountWorkspaces();
      await selectWorkspace(created.id);
      setModal(null);
      setNotice(`${created.type === "SACCO" ? "SACCO" : "Chama"} workspace created.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create the workspace.");
    } finally {
      setBusy(false);
    }
  }

  async function submitGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    if (!values.memberId) delete values.memberId;
    await runAction(() => api("goals", {
      method: "POST",
      body: JSON.stringify(values),
    }), "Savings goal created.");
  }

  async function deleteGoal(goal: SavingsGoal) {
    if (!window.confirm(`Delete “${goal.title}”? This will not change contribution records.`)) return;
    await runAction(() => api(`goals/${encodeURIComponent(goal.id)}`, { method: "DELETE" }), "Savings goal deleted.");
  }

  async function decideLoan(id: string, status: "APPROVED" | "DECLINED") {
    await runAction(
      () => api(`loans/${encodeURIComponent(id)}/decision`, { method: "POST", body: JSON.stringify({ status }) }),
      status === "APPROVED" ? "Loan request approved." : "Loan request declined.",
    );
  }

  function exportReport() {
    if (!workspace) return;
    const csvCell = (value: string) => {
      const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replaceAll('"', '""')}"`;
    };
    const rows = [
      ["Contribution reference", "Member", "Amount (KES)", "Recorded", "Method", "Savings goal", "Note"],
      ...workspace.contributions.map((item) => [
        item.reference,
        item.member.name,
        String(BigInt(item.amountMinor) / 100n),
        displayDate(item.createdAt),
        item.method,
        item.savingsGoal?.title ?? "",
        item.note ?? "",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => csvCell(String(cell))).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "wealth-sketch-contributions.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  if (authState === "signed-out") {
    if (showLanding) {
      return (
        <main className="landing-screen">
          <header className="landing-header">
            <Brand />
            <nav aria-label="Main navigation" className="landing-nav">
              <a href="#how-it-works">How it works</a>
              <a href="#features">What you can do</a>
            </nav>
            <div className="landing-actions">
              <button className="landing-login" onClick={() => flipAuthCard("login")} type="button">Sign in</button>
              <button className="button button-primary landing-signup" onClick={() => flipAuthCard("register")} type="button">Get started <ArrowRight size={15} /></button>
            </div>
          </header>
          <section className="landing-hero">
            <div className="landing-copy">
              <span className="landing-kicker"><span /> A clearer way to grow together</span>
              <h1>Make good money habits a <em>group effort.</em></h1>
              <p>Bring your chama, SACCO, and personal plans into one calm, clear workspace. Track what matters, celebrate progress, and keep everyone moving in the same direction.</p>
              {initialLoadError && <p className="landing-load-error" role="alert">{initialLoadError}</p>}
              <div className="landing-hero-actions">
                <button className="button button-primary landing-cta" onClick={() => flipAuthCard("register")} type="button">Create your free workspace <ArrowRight size={17} /></button>
                <button className="landing-secondary-cta" onClick={() => flipAuthCard("login")} type="button">I already have an account</button>
              </div>
              <div className="landing-trust"><ShieldCheck size={16} /><span>Your records stay private to your account and workspace.</span></div>
            </div>
            <div aria-label="A preview of a group savings dashboard" className="landing-preview">
              <div className="preview-topline"><span className="preview-brand-mark"><span /><span /><span /><span /></span><span>JIRANI CIRCLE</span><span className="preview-status"><i /> ON TRACK</span></div>
              <div className="preview-title"><div><small>GROUP OVERVIEW</small><strong>Good progress, together.</strong></div><span className="preview-period">THIS MONTH</span></div>
              <div className="preview-total"><small>CONTRIBUTIONS RECORDED</small><strong>KES 84,500</strong><span><CheckCircle2 size={14} /> 12 members contributing</span></div>
              <div className="preview-chart" aria-hidden="true"><div className="preview-chart-labels"><span>Progress this month</span><span>+18%</span></div><div className="preview-bars">{[38, 51, 45, 68, 61, 82, 72, 100].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="preview-chart-axis"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div></div>
              <div className="preview-goal"><span className="preview-goal-icon"><Target size={17} /></span><span><small>SHARED SAVINGS GOAL</small><strong>December getaway</strong></span><span className="preview-goal-progress"><strong>68%</strong><i><b /></i></span></div>
              <div className="preview-caption"><Users size={15} /> Built for real groups, clear records, and shared goals.</div>
            </div>
          </section>
          <section className="landing-benefits" id="features">
            <div className="landing-section-heading"><span className="eyebrow">EVERYTHING IN ONE PLACE</span><h2>Less chasing. More progress.</h2><p>Useful tools for managing money together and building your own financial habits.</p></div>
            <div className="landing-benefit-grid">
              <article><span className="landing-benefit-icon"><Users size={19} /></span><h3>Keep your group in sync</h3><p>See members, contributions, and loan requests together, with clear roles and records.</p></article>
              <article><span className="landing-benefit-icon"><Target size={19} /></span><h3>Make goals feel achievable</h3><p>Set personal or shared savings targets and follow progress over time.</p></article>
              <article><span className="landing-benefit-icon"><Wallet size={19} /></span><h3>Understand your activity</h3><p>Keep personal finances separate, and review the activity that matters to you.</p></article>
            </div>
          </section>
          <section className="landing-how" id="how-it-works">
            <div><span className="eyebrow">GET STARTED IN MINUTES</span><h2>Your next step is simple.</h2><p>Create an account, choose how you want to use Wealth Sketch, and invite your group when you’re ready.</p></div>
            <ol><li><span>01</span><div><strong>Create your account</strong><p>Sign up with your email and set up a secure password.</p></div></li><li><span>02</span><div><strong>Start personal or group tracking</strong><p>Build your own plan, or create a Chama or SACCO workspace.</p></div></li><li><span>03</span><div><strong>Grow together</strong><p>Record activity, set goals, and keep your members in the loop.</p></div></li></ol>
          </section>
          <footer className="landing-footer"><Brand /><span>Clearer records. Stronger money habits.</span><button onClick={() => flipAuthCard("register")} type="button">Get started <ArrowRight size={14} /></button></footer>
        </main>
      );
    }
    return (
      <div className="auth-screen">
        {initialLoadError && <div className="error-banner auth-load-error" role="alert">{initialLoadError}</div>}
        <div className="auth-flip">
          <div className={`auth-flip-inner ${authMode !== "login" ? "auth-flip-turned" : ""}`}>
            <section aria-hidden={authMode !== "login"} className={`auth-card-face auth-card-face-front ${authMode !== "login" ? "auth-card-face-inactive" : ""}`} inert={authMode !== "login"}>
              <Brand />
              <span className="eyebrow">YOUR GROUP, IN GOOD COMPANY</span>
              <h1>Welcome back.</h1>
              <p className="auth-description">Sign in to manage your chama and personal finances.</p>
              {authMode === "login" && authMessage && <div className="form-note auth-message" role="status">{authMessage}</div>}
              {authMode === "login" && error && <div className="error-banner" role="alert">{error}</div>}
              <form className="modal-form auth-form" onSubmit={submitAuth}>
                <label>Email address<input autoComplete="email" autoFocus={authMode === "login"} name="email" placeholder="you@example.com" ref={loginEmailInput} required type="email" /></label>
                <div className="auth-password-field"><label>Password<div className="password-input-wrap"><input autoComplete="current-password" name="password" placeholder="Your password" required type={passwordVisible ? "text" : "password"} /><button aria-label={passwordVisible ? "Hide password" : "Show password"} aria-pressed={passwordVisible} className="password-visibility-toggle" onClick={() => setPasswordVisible(!passwordVisible)} type="button">{passwordVisible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}</button></div></label><button className="auth-recovery-link" onClick={() => flipAuthCard("reset")} type="button">Forgot password?</button></div>
                <button className="button button-primary auth-submit" disabled={busy} type="submit">{busy ? "Please wait…" : "Sign in"} <ArrowRight size={16} /></button>
              </form>
              <div aria-hidden="true" className="auth-divider"><span>or continue with</span></div>
              <div aria-label="Sign in with another provider" className="oauth-options">
                {([
                  ["google", "Google"],
                  ["apple", "Apple"],
                  ["microsoft", "Microsoft"],
                  ["facebook", "Facebook"],
                  ["github", "GitHub"],
                ] as const).map(([provider, label]) => (
                  <a className="oauth-button" href={`${apiBaseUrl}/api/auth/oauth/${provider}`} key={provider}>
                    <OAuthProviderIcon provider={provider} /> Continue with {label}
                  </a>
                ))}
              </div>
              {canResendVerification && <button className="auth-recovery-link" disabled={busy} onClick={() => void resendEmailVerification()} type="button">Resend verification email</button>}
              <p className="auth-switch">New to Wealth Sketch? <button onClick={() => flipAuthCard("register")} type="button">Create an account</button></p>
            </section>
            <section aria-hidden={authMode === "login"} className={`auth-card-face auth-card-face-back ${authMode === "login" ? "auth-card-face-inactive" : ""}`} inert={authMode === "login"}>
              {authMode === "register" ? <>
                <Brand />
                <span className="eyebrow">{invitation ? "YOU'RE INVITED" : "YOUR GROUP, IN GOOD COMPANY"}</span>
                <h1>{invitation ? "Join your group." : "Start growing together."}</h1>
                <p className="auth-description">{invitation ? `${invitation.name}, ${invitation.existingAccount ? "sign in to add" : "create an account to join"} ${invitation.groupName}.` : "Create a secure account for personal finance, and add a group whenever you need one."}</p>
                {error && <div className="error-banner" role="alert">{error}</div>}
                <form className="modal-form auth-form" onSubmit={submitAuth}>
                  {invitation && <div className="form-note"><Mail size={15} /> Invitation for {invitation.email}</div>}
                  {!invitationToken && <>
                    <label>Your name<input autoComplete="name" name="name" placeholder="Full name" ref={registrationNameInput} required /></label>
                    <label className="checkbox-field"><input checked={createGroupOnSignup} onChange={(event) => setCreateGroupOnSignup(event.target.checked)} type="checkbox" /> Create an organization now</label>
                    {createGroupOnSignup && <>
                      <label>Organization type<select onChange={(event) => setSignupGroupType(event.target.value as "CHAMA" | "SACCO")} value={signupGroupType}><option value="CHAMA">Chama</option><option value="SACCO">SACCO</option></select></label>
                      <label>{signupGroupType === "SACCO" ? "SACCO name" : "Chama name"}<input autoComplete="organization" name="groupName" placeholder={signupGroupType === "SACCO" ? "e.g. Upendo SACCO" : "e.g. Jirani Investment Circle"} required /></label>
                      <label>Phone number<input autoComplete="tel" name="phone" placeholder="0712 345 678" required /></label>
                      <label className="checkbox-field"><input name="constitutionSigned" required type="checkbox" /> I confirm this {signupGroupType === "SACCO" ? "SACCO" : "Chama"} has a signed constitution or bylaws and designated officials.</label>
                    </>}
                    <label>Email address<input autoComplete="email" name="email" placeholder="you@example.com" required type="email" /></label>
                  </>}
                  {invitation?.existingAccount && <div className="form-note"><ShieldCheck size={15} /> Enter your existing account password to securely join this group.</div>}
                  <label>Password<div className="password-input-wrap"><input autoComplete="new-password" minLength={12} name="password" placeholder="At least 12 characters" ref={invitationPasswordInput} required type={passwordVisible ? "text" : "password"} /><button aria-label={passwordVisible ? "Hide password" : "Show password"} aria-pressed={passwordVisible} className="password-visibility-toggle" onClick={() => setPasswordVisible(!passwordVisible)} type="button">{passwordVisible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}</button></div></label>
                  <label>Confirm password<div className="password-input-wrap"><input autoComplete="new-password" minLength={12} name="confirmPassword" placeholder="Enter the same password again" required type={confirmPasswordVisible ? "text" : "password"} /><button aria-label={confirmPasswordVisible ? "Hide confirm password" : "Show confirm password"} aria-pressed={confirmPasswordVisible} className="password-visibility-toggle" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} type="button">{confirmPasswordVisible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}</button></div></label>
                  <p className="form-note"><ShieldCheck size={15} /> Use a unique password. We store a one-way password hash, never the password itself.</p>
                  <button className="button button-primary auth-submit" disabled={busy || (Boolean(invitationToken) && !invitation)} type="submit">{busy ? "Please wait…" : invitationToken ? invitation?.existingAccount ? "Join group" : "Accept invitation" : "Create account"} <ArrowRight size={16} /></button>
                </form>
                {!invitationToken && <p className="auth-switch">Already have an account? <button onClick={() => flipAuthCard("login")} type="button">Sign in</button></p>}
              </> : <>
                <Brand />
                <span className="eyebrow">ACCOUNT RECOVERY</span>
                <h1>{passwordResetToken ? "Choose a new password." : "Reset your password."}</h1>
                <p className="auth-description">{passwordResetToken ? "Create a new password to secure your account." : "Enter your email and we’ll send a secure reset link if an account exists."}</p>
                {authMessage && <div className="form-note auth-message" role="status">{authMessage}</div>}
                {error && <div className="error-banner" role="alert">{error}</div>}
                {passwordResetToken ? <form className="modal-form auth-form" onSubmit={submitPasswordReset}>
                  <label>New password<div className="password-input-wrap"><input autoComplete="new-password" minLength={12} name="password" placeholder="At least 12 characters" ref={resetPasswordInput} required type={passwordVisible ? "text" : "password"} /><button aria-label={passwordVisible ? "Hide password" : "Show password"} aria-pressed={passwordVisible} className="password-visibility-toggle" onClick={() => setPasswordVisible(!passwordVisible)} type="button">{passwordVisible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}</button></div></label>
                  <label>Confirm new password<div className="password-input-wrap"><input autoComplete="new-password" minLength={12} name="confirmPassword" placeholder="Enter the same password again" required type={confirmPasswordVisible ? "text" : "password"} /><button aria-label={confirmPasswordVisible ? "Hide confirm password" : "Show confirm password"} aria-pressed={confirmPasswordVisible} className="password-visibility-toggle" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} type="button">{confirmPasswordVisible ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}</button></div></label>
                  <button className="button button-primary auth-submit" disabled={busy} type="submit">{busy ? "Updating password…" : "Set new password"} <ArrowRight size={16} /></button>
                </form> : <form className="modal-form auth-form" onSubmit={submitPasswordResetRequest}>
                  <label>Email address<input autoComplete="email" name="email" placeholder="you@example.com" ref={resetEmailInput} required type="email" /></label>
                  <button className="button button-primary auth-submit" disabled={busy} type="submit">{busy ? "Sending…" : "Send reset link"} <ArrowRight size={16} /></button>
                </form>}
                <p className="auth-switch"><button onClick={() => flipAuthCard("login")} type="button">Back to sign in</button>{!passwordResetToken && <> · <button onClick={() => flipAuthCard("register")} type="button">Create an account</button></>}</p>
              </>}
            </section>
          </div>
        </div>
        <div className="auth-footer"><ShieldCheck size={14} /> Private group workspace · Secure sign-in</div>
      </div>
    );
  }

  if (!account || (activeWorkspace !== "personal" && !workspace)) return null;

  return (
    <div className={`app-shell ${dashboardTheme === "dark" ? "dashboard-dark" : ""} ${liveStream && section === "Overview" && workspace?.group.type !== "SACCO" ? "stream-active" : ""}`}>
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <Brand />
        <div className="workspace-picker">
          <div className="workspace-avatar">{activeWorkspace === "personal" ? initials(account.name) : initials(workspace?.group.name ?? "")}</div>
          <div className="workspace-copy"><strong>{activeWorkspace === "personal" ? "Personal finance" : workspace?.group.name}</strong><span>{activeWorkspace === "personal" ? "Private workspace" : workspace?.group.type === "SACCO" ? "SACCO workspace" : "Chama workspace"}</span></div>
          <select aria-label="Switch workspace" onChange={(event) => void selectWorkspace(event.target.value)} value={activeWorkspace}>
            <option value="personal">Personal finance</option>
            {groupWorkspaces.map((group) => <option key={group.id} value={group.id}>{group.name} · {group.type === "SACCO" ? "SACCO" : "Chama"} · {roleLabel(group.role)}</option>)}
          </select>
          <ChevronDown size={16} />
        </div>
        <button className="text-button workspace-create" onClick={() => setModal("createGroup")} type="button"><Plus size={14} /> Create a chama or SACCO</button>
        <span className="nav-label">WORKSPACE</span>
        <nav aria-label="Main navigation" className="primary-nav">
          {activeNavItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-link ${section === label ? "active" : ""}`} onClick={() => {
              if (label === "Personal") void selectWorkspace("personal");
              else { setSection(label); setMenuOpen(false); setSearch(""); }
            }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              {label === "Loans" && pendingLoans.length > 0 && <span className="nav-count">{pendingLoans.length}</span>}
            </button>
          ))}
          {(activeWorkspace !== "personal" || workspace) && <button className={`nav-link ${section === "Settings" ? "active" : ""}`} onClick={() => { setSection("Settings"); setMenuOpen(false); }}>
            <Settings size={18} strokeWidth={1.8} /><span>Settings</span>
          </button>}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={17} /></div>
            <strong>Need a hand?</strong>
            <p>Contact your group administrator for help with your records.</p>
          </div>
          <div className="profile">
            <ProfileAvatar className="avatar avatar-green" name={account.name} photo={account.profilePhotoData} />
            <div className="profile-copy"><strong>{account.name}</strong><span>{account.email}</span></div>
            <button aria-label="Sign out" className="icon-button profile-menu" onClick={signOut}><LogOut size={17} /></button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>{activeWorkspace === "personal" ? "Personal finance" : workspace?.group.name}</span><span className="crumb-slash">/</span><strong>{section}</strong></div>
          <div className="topbar-actions">
            {section === "Overview" && workspace?.group.type !== "SACCO" && <button aria-pressed={liveStream} className={`dashboard-control live-stream-control ${liveStream ? "is-live" : ""}`} onClick={() => setLiveStream((current) => !current)} type="button"><Radio size={15} /><span>{liveStream ? "Live Stream on" : "Live Stream"}</span><i /></button>}
            {section === "Overview" && <button aria-label={`Switch to ${dashboardTheme === "light" ? "dark" : "light"} theme`} className="icon-button theme-toggle" onClick={() => setDashboardTheme((current) => current === "light" ? "dark" : "light")} title={`Switch to ${dashboardTheme === "light" ? "dark" : "light"} theme`}>{dashboardTheme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button>}
            <span className="live-chip"><span /> {activeWorkspace === "personal" ? "PRIVATE" : "LIVE WORKSPACE"}</span>
            <button aria-label="Refresh workspace" className="icon-button" onClick={() => Promise.all(activeWorkspace === "personal" ? [refreshPersonalWorkspace(), refreshReminders()] : [refreshWorkspace(), section === "Overview" && workspace?.group.type !== "SACCO" ? refreshAnalytics(analyticsRange) : Promise.resolve(), refreshReminders()]).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to refresh workspace."))}><RefreshCw size={17} /></button>
            <div className="notification-wrap">
              <button aria-label="Open notifications" aria-expanded={notificationsOpen} className="icon-button notification-button" onClick={() => setNotificationsOpen((current) => !current)}><Bell size={19} />{notificationCount > 0 && <span className="notification-badge">{notificationCount > 9 ? "9+" : notificationCount}</span>}</button>
              {notificationsOpen && <section aria-label="Notifications" className="notification-popover" role="dialog">
                <div className="notification-heading"><div><strong>Alerts & reminders</strong><span>{notificationCount ? `${notificationCount} unread or pending alert${notificationCount === 1 ? "" : "s"}` : "Your reminders and updates"}</span></div><button aria-label="Close notifications" className="icon-button" onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div>
                {notifications.slice(0, 6).map((notification) => <button className="notification-item" key={notification.id} onClick={() => { void markNotificationRead(notification); setSection("Reminders"); setNotificationsOpen(false); }}>
                  <span className="notification-icon"><Bell size={15} /></span><span><strong>{notification.title}</strong><small>{notification.message} · {displayDate(notification.createdAt)}</small></span><ArrowRight size={14} />
                </button>)}
                {pendingLoans.slice(0, 4).map((loan) => <button className="notification-item" key={`loan-${loan.id}`} onClick={() => { setSection("Loans"); setNotificationsOpen(false); }}>
                  <span className="notification-icon notification-icon-loan"><HandCoins size={15} /></span><span><strong>Loan request needs review</strong><small>{loan.member.name} · {kes(loan.amountMinor)} · {displayDate(loan.createdAt)}</small></span><ArrowRight size={14} />
                </button>)}
                {notifications.length === 0 && pendingLoans.length === 0 && <p className="notification-empty">No reminders or alerts yet. Your due-date reminders will appear here.</p>}
              </section>}
            </div>
            <div className="topbar-divider" />
            <button className="top-profile" onClick={() => { setSection("Settings"); setMenuOpen(false); }}><ProfileAvatar className="avatar avatar-green" name={account.name} photo={account.profilePhotoData} /><span>{account.name.split(" ")[0]}</span><Settings size={15} /></button>
            <button aria-label="Open menu" className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={21} /></button>
          </div>
        </header>

        <div className="content">
          {error && <div className="error-banner content-error" role="alert"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X size={15} /></button></div>}
          {pendingMemberships.length > 0 && <div className="form-note" role="status"><Clock3 size={15} /> Your membership request{pendingMemberships.length === 1 ? "" : "s"} for {pendingMemberships.map(({ name }) => name).join(", ")} {pendingMemberships.length === 1 ? "is" : "are"} awaiting admin approval. Access will be available once approved. This confirms your email and admin review only; membership is not checked against official SACCO records.</div>}
          <section className="page-heading">
            <div>
              <div className="date-line"><span className="date-dot" /> {new Intl.DateTimeFormat("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" }).format(new Date()).toUpperCase()}</div>
              <h1>{section === "Personal" ? "Your personal finances" : section === "Reminders" ? "Alerts & reminders" : pageTitle}</h1>
              <p>{section === "Personal" ? "Private savings, investments, and personal finance records." : section === "Reminders" ? "Keep important contribution, loan, savings, and meeting dates on track." : workspace?.group.type === "SACCO" ? "SACCO records are manually entered tracking data, not verified account balances or live transactions." : section === "Overview" ? "A clear, up-to-date view of your group records." : `Manage your group’s ${section.toLowerCase()}.`}</p>
            </div>
            <div className="heading-actions">
              {section === "Personal" ? <><button className="button button-secondary" onClick={() => setModal("personalActivity")}><Plus size={16} /> Add record</button><button className="button button-primary" onClick={() => setModal("personalGoal")}><Target size={16} /> New personal goal</button></> : section === "Reminders" ? <button className="button button-primary" onClick={() => setModal("reminder")}><Bell size={16} /> Schedule reminder</button> : section === "Reports" && workspace?.group.type !== "SACCO" ? <button className="button button-primary" onClick={exportReport}><Download size={16} /> Export report</button> : workspace?.group.type === "SACCO" ? <>
                {section === "Sacco accounts" && workspace.canRecordSaccoEntries && <button className="button button-primary" onClick={() => setModal("saccoEntry")}><Plus size={16} /> Record manual entry</button>}
                {section === "Members" && workspace.canManageMembers && <button className="button button-primary" onClick={() => setModal("member")}><Mail size={16} /> Invite member</button>}
                {section === "Loans" && <button className="button button-primary" onClick={() => setModal("loan")}><Plus size={16} /> Apply for loan</button>}
                {section === "Settings" && canManageSaccoProducts && <button className="button button-primary" onClick={() => setModal("saccoProduct")}><Plus size={16} /> Add loan product</button>}
              </> : workspace && <>
                {section !== "Members" && (workspace.canManageGoals ? <>
                  <button className="button button-secondary" onClick={() => setModal("contribution")}><Plus size={16} /> Record contribution</button>
                  <button className="button button-quiet" onClick={openPaymentModal}><Wallet size={16} /> Pay with M-Pesa</button>
                </> : <button className="button button-secondary" onClick={openPaymentModal}><Wallet size={16} /> Pay contribution</button>)}
                {(section !== "Members" || workspace.canManageGoals) && <button className="button button-primary" onClick={() => setModal(section === "Members" ? "member" : section === "Savings" ? "goal" : "loan")}><Plus size={16} /> {section === "Members" ? "Invite member" : section === "Savings" ? "New savings goal" : "New loan request"}</button>}
              </>}
            </div>
          </section>

          {section === "Personal" && <section className="personal-finance-page">
            <section className="stat-grid">
              <StatCard icon={<Wallet size={17} />} label="PERSONAL SAVINGS" value={kes(personalSavingsMinor)} foot="Private records only" />
              <StatCard icon={<ArrowDownLeft size={17} />} label="INVESTMENTS TRACKED" value={kes(personalInvestmentMinor)} foot="Tracking, not a balance or valuation" />
              <StatCard icon={<Target size={17} />} label="ACTIVE PERSONAL GOALS" value={String(personalWorkspace.goals.filter((goal) => goal.progressPercent < 100).length)} foot={`${personalWorkspace.goals.length} total goals`} />
            </section>
            <article className="panel full-panel">
              <div className="panel-heading"><div><h2>Personal goals</h2><p>Saved amounts are totals of your own private entries, separate from every chama ledger.</p></div><button className="button button-primary button-small" onClick={() => setModal("personalGoal")}><Plus size={14} /> Add goal</button></div>
              {personalWorkspace.goals.length ? <div className="personal-goal-grid">{personalWorkspace.goals.map((goal) => <article className="personal-goal-card" key={goal.id}>
                <div className="goal-overview-row"><strong>{goal.title}</strong><span>{goal.kind === "INVESTMENT" ? "Investment" : "Savings"}</span></div>
                <div aria-label={`${goal.progressPercent}% complete`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={goal.progressPercent} className="goal-progress-track" role="progressbar"><span style={{ width: `${goal.progressPercent}%` }} /></div>
                <div className="goal-overview-foot"><span>{kes(goal.savedMinor)} of {kes(goal.targetMinor)}</span><span>By {displayDate(goal.targetDate)}</span></div>
              </article>)}</div> : <div className="empty-state">Set a personal savings or investment goal to start tracking progress.</div>}
            </article>
            <article className="panel full-panel">
              <div className="panel-heading"><div><h2>Your private activity</h2><p>These records are visible only to you and do not change group balances.</p></div><button className="button button-secondary button-small" onClick={() => setModal("personalActivity")}><Plus size={14} /> Add record</button></div>
              {personalWorkspace.activities.length ? <div className="table-wrap"><table><thead><tr><th>ACTIVITY</th><th>TYPE</th><th>AMOUNT</th><th>DATE</th></tr></thead><tbody>{personalWorkspace.activities.map((activity) => <tr key={activity.id}><td><strong>{activity.title}</strong>{activity.goal && <small className="personal-goal-label">{activity.goal.title}</small>}</td><td>{activityKindLabel(activity.kind)}</td><td className="amount-cell">{kes(activity.amountMinor)}</td><td>{displayDate(activity.occurredAt)}</td></tr>)}</tbody></table></div> : <div className="empty-state">Add a private savings, investment, income, or expense record.</div>}
            </article>
          </section>}

          {section === "Reminders" && <section className="reminders-page">
            <article className="panel full-panel">
              <div className="panel-heading"><div><h2>Upcoming reminders</h2><p>{activeWorkspace === "personal" ? "Only you can see these personal reminders." : "Personal reminders are private; shared reminders notify this chama."}</p></div><button className="button button-primary button-small" onClick={() => setModal("reminder")}><Bell size={14} /> Schedule reminder</button></div>
              {reminders.length ? <div className="reminder-list">{reminders.map((reminder) => <article className="reminder-card" key={reminder.id}>
                <span className="notification-icon"><CalendarDays size={16} /></span><div className="reminder-copy"><strong>{reminder.title}</strong><p>{reminder.message}</p><small>{displayDate(reminder.dueAt)} · {new Intl.DateTimeFormat("en-KE", { hour: "numeric", minute: "2-digit" }).format(new Date(reminder.dueAt))}{reminder.groupId ? " · Shared with chama" : " · Private"}</small></div>
                <div className="reminder-channels">{reminder.emailEnabled && <span>Email</span>}{reminder.smsEnabled && <span>SMS</span>}{reminder.processedAt && <span>Sent</span>}</div>
              </article>)}</div> : <div className="empty-state">No reminders yet. Add contribution due dates, loan due dates, savings milestones, or meeting dates.</div>}
            </article>
            <article className="panel full-panel">
              <div className="panel-heading"><div><h2>Recent alerts</h2><p>Alerts are private to your account, even when triggered by a shared group reminder.</p></div></div>
              {notifications.length ? <div className="reminder-list">{notifications.slice(0, 10).map((notification) => <article className={`reminder-card ${notification.readAt ? "reminder-read" : ""}`} key={notification.id}>
                <span className="notification-icon"><Bell size={16} /></span><div className="reminder-copy"><strong>{notification.title}</strong><p>{notification.message}</p><small>{displayDate(notification.createdAt)}{notification.deliveryError ? ` · Delivery issue: ${notification.deliveryError}` : ""}</small></div>
                {!notification.readAt && <button className="button button-quiet button-small" onClick={() => void markNotificationRead(notification)}>Mark read</button>}
              </article>)}</div> : <div className="empty-state">Your in-app alerts will appear here when a reminder is due.</div>}
            </article>
          </section>}

          {section === "Overview" && workspace?.group.type === "SACCO" && <section className="sacco-dashboard">
            <section className="stat-grid">
              <StatCard icon={<Target size={17} />} label={`${saccoWorkspace.isManager ? "" : "YOUR "}BOSA SHARE CAPITAL RECORDED`} value={kes(saccoSummary.shareCapital)} foot="Manual tracking only; non-withdrawable status is not enforced" />
              <StatCard icon={<Wallet size={17} />} label={`${saccoWorkspace.isManager ? "" : "YOUR "}BOSA DEPOSITS (NET)`} value={kes(saccoSummary.bosaDeposits)} foot="Deposits less recorded withdrawals; share capital excluded" />
              <StatCard icon={<ArrowDownLeft size={17} />} label={`${saccoWorkspace.isManager ? "" : "YOUR "}FOSA DEPOSITS (NET)`} value={kes(saccoSummary.fosaDeposits)} foot="Deposits less recorded withdrawals" />
              <StatCard icon={<Users size={17} />} label="SACCO MEMBERS" value={String(workspace.summary.memberCount)} foot="Member records" />
            </section>
            <article className="panel full-panel">
              <div className="panel-heading"><div><h2>Share capital & deposit activity</h2><p>Manually recorded entries; this is not a verified balance or payment service.</p></div><button className="text-button" onClick={() => setSection("Sacco accounts")}>View accounts <ArrowRight size={15} /></button></div>
              <div className="table-wrap">
                {saccoWorkspace.entries.length ? <table><thead><tr><th>MEMBER</th><th>ENTRY</th><th>ACCOUNT</th><th>AMOUNT</th><th>REFERENCE</th><th>DATE</th></tr></thead><tbody>
                  {saccoWorkspace.entries.slice(0, 8).map((entry) => <tr key={entry.id}><td>{entry.member.name}</td><td>{saccoEntryLabel(entry.kind)}</td><td>{entry.accountType}</td><td className="amount-cell">{entry.kind === "WITHDRAWAL" ? "−" : ""}{kes(entry.amountMinor)}</td><td>{entry.reference}</td><td>{displayDate(entry.createdAt)}</td></tr>)}
                </tbody></table> : <div className="empty-state">No share-capital or deposit entries have been recorded.</div>}
              </div>
              <p className="form-note"><ShieldCheck size={15} /> No funds are collected, disbursed, or reconciled by Wealth Sketch. Confirm every entry against your SACCO’s own records.</p>
            </article>
            <article className="panel full-panel"><div className="panel-heading"><div><h2>Loan requests</h2><p>Applications and decisions are tracked; approval does not calculate repayments or disburse funds.</p></div><button className="button button-primary button-small" onClick={() => setSection("Loans")}>View loans</button></div>
              <div className="loan-list">{workspace.loans.slice(0, 5).map((loan) => <div className="loan-row" key={loan.id}><div className="avatar avatar-peach">{initials(loan.member.name)}</div><div className="loan-main"><strong>{loan.member.name}</strong><span>{loan.product?.name ?? loan.purpose}</span></div><div className="loan-date">{displayDate(loan.createdAt)}</div><strong className="loan-amount">{kes(loan.amountMinor)}</strong><StatusPill status={loan.status} /><span className="decision-spacer" /></div>)}
                {workspace.loans.length === 0 && <div className="empty-state">No SACCO loan applications yet.</div>}
              </div>
            </article>
          </section>}

          {section === "Overview" && workspace?.group.type === "CHAMA" && <>
            <section className="stat-grid">
              <StatCard icon={<Wallet size={17} />} label="RECORDED CONTRIBUTIONS" value={kes(workspace.summary.contributionTotalMinor)} foot={`${workspace.summary.contributionCount} recorded entries`} />
              <StatCard icon={<Users size={17} />} label="GROUP MEMBERS" value={String(workspace.summary.memberCount)} foot="Active group records" />
              <StatCard icon={<ArrowDownLeft size={17} />} label="THIS MONTH" value={String(currentMonthContributions)} foot="Contribution entries recorded" />
              <StatCard icon={<Clock3 size={17} />} label="LOANS TO REVIEW" value={String(workspace.summary.pendingLoans)} foot="Awaiting a group decision" />
            </section>
            {analyticsData && <DashboardAnalytics
              data={analyticsData}
              goals={goals}
              range={analyticsRange}
              onRangeChange={setAnalyticsRange}
              live={liveStream}
              lastUpdated={analyticsUpdatedAt}
            />}
            <section className="goal-overview-grid">
              <article className="goal-glass animate-rise relative overflow-hidden rounded-2xl border border-white/70 bg-white/65 p-5 shadow-[0_18px_55px_rgba(34,88,59,0.12)] backdrop-blur-xl">
                <div className="goal-orb animate-float" aria-hidden="true" />
                <div className="goal-overview-heading">
                  <div>
                    <span className="goal-kicker"><Target size={14} /> SAVINGS DISCIPLINE</span>
                    <h2>Small steps add up.</h2>
                    <p>Track the contributions your group assigns to each savings goal.</p>
                  </div>
                  <button className="text-button" onClick={() => setSection("Savings")}>All goals <ArrowRight size={15} /></button>
                </div>
                {activeGoals.length > 0 ? <div className="goal-overview-list">
                  {activeGoals.slice(0, 2).map((goal, index) => (
                    <GoalProgress key={goal.id} goal={goal} index={index} />
                  ))}
                </div> : goals.length > 0 ? <div className="goal-empty-inline"><span>Every savings goal is complete. Great work building the habit.</span></div> : <div className="goal-empty-inline">
                  <span>Make a group or personal savings target and track its progress here.</span>
                  {(workspace.canManageGoals || workspace.currentMemberId) && <button className="button button-primary button-small" onClick={() => setModal("goal")}><Plus size={14} /> Set a goal</button>}
                </div>}
              </article>
            </section>
            <section className="lower-grid">
              <article className="panel transactions-panel">
                <div className="panel-heading"><div><h2>Latest contributions</h2><p>Recently recorded for this group.</p></div><button className="text-button" onClick={() => setSection("Contributions")}>View all <ArrowRight size={15} /></button></div>
                <div className="table-wrap"><ContributionTable items={workspace.contributions.slice(0, 6)} /></div>
              </article>
              <article className="panel approvals-panel">
                <div className="panel-heading"><div><h2>Loan requests <span className="heading-count">{pendingLoans.length}</span></h2><p>Requests awaiting a decision.</p></div><button className="text-button" onClick={() => setSection("Loans")}>View all <ArrowRight size={15} /></button></div>
                {pendingLoans.length === 0 ? <div className="empty-state"><CheckCircle2 size={20} /><span>No loan requests are awaiting a decision.</span></div> : pendingLoans.slice(0, 4).map((loan) => <div className="approval-item" key={loan.id}>
                  <div className="avatar avatar-peach">{initials(loan.member.name)}</div><div className="approval-person"><strong>{loan.member.name}</strong><span>{loan.purpose} · {displayDate(loan.createdAt)}</span></div>
                  <div className="approval-actions"><strong>{kes(loan.amountMinor)}</strong><button className="approve-button" disabled={busy} onClick={() => decideLoan(loan.id, "APPROVED")} aria-label={`Approve ${loan.member.name}'s loan`}><Check size={16} /></button></div>
                </div>)}
              </article>
            </section>
            <div className="ledger-note"><ShieldCheck size={16} /><span>These are group records, not a bank balance. Only verified money receipts should be recorded as contributions.</span></div>
          </>}

          {section === "Savings" && workspace && <section className="savings-page">
            <div className="savings-intro">
              <div><span className="goal-kicker"><Target size={14} /> SAVINGS DISCIPLINE</span><h2>Every contribution moves you forward.</h2><p>Only contributions explicitly assigned to a goal count toward its progress. This is a tracking aid, not a verified cash balance.</p></div>
              {(workspace.canManageGoals || workspace.currentMemberId) && <button className="button button-primary" onClick={() => setModal("goal")}><Plus size={16} /> New savings goal</button>}
            </div>
            {goals.length > 0 ? <div className="savings-goal-grid">
              {goals.map((goal, index) => (
                <article className="goal-card animate-rise" key={goal.id} style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="goal-card-top">
                    <span className={`goal-type ${goal.memberId ? "goal-type-personal" : ""}`}>{goal.member?.name ?? "Group goal"}</span>
                    {(workspace.canManageGoals || goal.memberId === workspace.currentMemberId) && <button aria-label={`Delete ${goal.title}`} className="icon-button goal-delete" disabled={busy} onClick={() => deleteGoal(goal)}><Trash2 size={16} /></button>}
                  </div>
                  <h3>{goal.title}</h3>
                  <div className="goal-amount-line"><strong>{kes(goal.savedMinor)}</strong><span>of {kes(goal.targetMinor)}</span></div>
                  <div aria-label={`${goal.progressPercent}% complete`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={goal.progressPercent} className="goal-progress-track" role="progressbar"><span style={{ width: `${goal.progressPercent}%` }} /></div>
                  <div className="goal-meta"><span>{goal.progressPercent >= 100 ? "Goal reached" : `${goal.progressPercent}% of target`}</span><span><CalendarDays size={13} /> Due {displayDate(goal.deadline)}</span></div>
                  <div className="goal-discipline-grid">
                    <div><span>{goal.hasStarted ? "DISCIPLINE SCORE" : "GOAL STATUS"}</span><strong>{goal.hasStarted ? `${goal.disciplineScore}/100` : "Not started"}</strong></div>
                    <div><span>WEEKLY PACE</span><strong>{goal.progressPercent >= 100 ? "Complete" : kes(goal.suggestedWeeklyMinor)}</strong></div>
                  </div>
                  {goal.amountBehindMinor !== "0" && goal.hasStarted && <p className="goal-shortfall">Behind your planned pace by {kes(goal.amountBehindMinor)}.</p>}
                  <p className="goal-projection">{goal.progressPercent >= 100 ? "Target reached. Well done!" : goal.projectedCompletionAt ? `At this pace, estimated finish: ${displayDate(goal.projectedCompletionAt)}.` : "Allocate contributions to this goal to estimate a finish date."}</p>
                  <div className="goal-range">Assigned entries from {displayDate(goal.startsAt)}{goal.member ? ` · ${goal.member.name}` : " · All members"}</div>
                </article>
              ))}
            </div> : <div className="goal-empty-state">
              <span className="goal-empty-icon"><Target size={23} /></span>
              <h3>No savings goals yet</h3>
              <p>Create a shared target or a personal goal to encourage consistent saving.</p>
              {(workspace.canManageGoals || workspace.currentMemberId) && <button className="button button-primary" onClick={() => setModal("goal")}><Plus size={15} /> Create the first goal</button>}
            </div>}
          </section>}

          {section === "Members" && workspace && <>
            <section className="panel full-panel">
              <div className="panel-heading"><div><h2>Your members <span className="heading-count">{workspace.members.length}</span></h2><p>{workspace.group.type === "SACCO" ? "SACCO membership roster and assigned officer roles." : "Members with an active account in your group."}</p></div>{workspace.canManageMembers && <button className="button button-primary" onClick={() => setModal("member")}><Mail size={16} /> Invite member</button>}</div>
              <div className="table-toolbar"><SearchField value={search} onChange={setSearch} label="Search members" /><span className="muted-small">{workspace.members.length} {workspace.group.type === "SACCO" ? "SACCO" : "group"} members</span></div>
              <div className="table-wrap"><table><thead><tr><th>MEMBER</th><th>ROLE</th><th>PHONE</th><th>JOINED</th></tr></thead><tbody>{filteredMembers.map((member, index) => <tr key={member.id}><td><PersonCell name={member.name} detail={member.id} index={index} /></td><td><RolePill role={member.role} /></td><td>{member.phone}</td><td>{displayDate(member.joinedAt)}</td></tr>)}</tbody></table>{filteredMembers.length === 0 && <div className="empty-state">No members match your search.</div>}</div>
            </section>
            {workspace.canManageMembers && <section className="panel full-panel">
            <div className="panel-heading"><div><h2>Member invitations <span className="heading-count">{memberInvitations?.filter((invitation) => invitation.status === "PENDING").length ?? 0} pending</span></h2><p>Track invitations through email confirmation and administrator review.</p></div><button className="icon-button" aria-label="Refresh invitations" disabled={memberInvitations === null} onClick={() => void Promise.all([refreshMemberInvitations(), refreshMembershipRequests()]).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to refresh member review information."))}><RefreshCw size={17} /></button></div>
            {memberInvitations === null ? <div className="empty-state">Loading member invitations…</div> : memberInvitations.length === 0 ? <div className="empty-state">No member invitations have been sent for this workspace.</div> : <div className="table-wrap"><table><thead><tr><th>INVITEE</th><th>ROLE</th><th>STATUS</th><th>SENT</th><th>UPDATED</th></tr></thead><tbody>{memberInvitations.map((invitation, index) => <tr key={invitation.id}><td><PersonCell name={invitation.name} detail={invitation.email} index={index} /></td><td><RolePill role={invitation.role} /></td><td><span className={`status-pill ${invitation.status === "ACCEPTED" ? "status-success" : invitation.status === "EXPIRED" || invitation.status === "REJECTED" ? "status-danger" : "status-warning"}`}><i />{invitation.status === "ACCEPTED" ? "Approved" : invitation.status === "REVIEW" ? "Awaiting approval" : invitation.status === "REJECTED" ? "Rejected" : invitation.status === "EXPIRED" ? "Expired" : "Awaiting response"}</span></td><td>{displayDate(invitation.createdAt)}</td><td>{invitation.acceptedAt ? invitation.status === "ACCEPTED" ? `Approved ${displayDate(invitation.acceptedAt)}` : `Responded ${displayDate(invitation.acceptedAt)}` : displayDate(invitation.expiresAt)}</td></tr>)}</tbody></table></div>}
            </section>}
            {workspace.canManageMembers && <section className="panel full-panel">
              <div className="panel-heading"><div><h2>Membership requests <span className="heading-count">{membershipRequests?.length ?? 0} pending</span></h2><p>Review members who accepted an invitation. Approval grants access to this workspace.</p></div><button className="icon-button" aria-label="Refresh membership requests" disabled={membershipRequests === null} onClick={() => void refreshMembershipRequests().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to refresh membership requests."))}><RefreshCw size={17} /></button></div>
              {membershipRequests === null ? <div className="empty-state">Loading membership requests…</div> : membershipRequests.length === 0 ? <div className="empty-state">No membership requests need review.</div> : <div className="table-wrap"><table><thead><tr><th>APPLICANT</th><th>ROLE</th><th>PHONE</th><th>REQUESTED</th><th>REVIEW</th></tr></thead><tbody>{membershipRequests.map((request) => <tr key={request.id}><td><PersonCell name={request.name} detail={request.email ?? "Email unavailable"} index={0} /></td><td><RolePill role={request.role} /></td><td>{request.phone}</td><td>{displayDate(request.joinedAt)}</td><td><div className="heading-actions"><button className="button button-primary" disabled={busy} onClick={() => void decideMembership(request.id, "APPROVE")} type="button">Approve</button><button className="button button-quiet" disabled={busy} onClick={() => void decideMembership(request.id, "REJECT")} type="button">Reject</button></div></td></tr>)}</tbody></table></div>}
            </section>}
          </>}

          {section === "Sacco accounts" && workspace?.group.type === "SACCO" && <section className="panel full-panel">
            <div className="panel-heading"><div><h2>BOSA & FOSA account tracking</h2><p>Manual register only. Share-capital entries are restricted to BOSA; deposit entries may use either account type.</p></div>{workspace.canRecordSaccoEntries && <button className="button button-primary" onClick={() => setModal("saccoEntry")}><Plus size={16} /> Record manual entry</button>}</div>
            <section className="stat-grid sacco-account-grid">
              <StatCard icon={<Target size={17} />} label={`${saccoWorkspace.isManager ? "" : "YOUR "}BOSA SHARE CAPITAL`} value={kes(saccoSummary.shareCapital)} foot="Manually recorded" />
              <StatCard icon={<Wallet size={17} />} label={`${saccoWorkspace.isManager ? "" : "YOUR "}BOSA DEPOSITS (NET)`} value={kes(saccoSummary.bosaDeposits)} foot="Deposits less withdrawals; share capital excluded" />
              <StatCard icon={<ArrowDownLeft size={17} />} label={`${saccoWorkspace.isManager ? "" : "YOUR "}FOSA DEPOSITS (NET)`} value={kes(saccoSummary.fosaDeposits)} foot="Deposits less recorded withdrawals" />
            </section>
            <div className="form-note"><ShieldCheck size={15} /> BOSA/FOSA balances are calculated from manual entries only. This MVP does not enforce withdrawability rules, reconcile payments, or move money.</div>
            <div className="table-toolbar"><SearchField value={search} onChange={setSearch} label="Search account activity" /><span className="muted-small">{saccoWorkspace.entries.length} recent entries</span></div>
            <div className="table-wrap">{saccoWorkspace.entries.length ? <table><thead><tr><th>MEMBER</th><th>ENTRY</th><th>ACCOUNT</th><th>AMOUNT</th><th>REFERENCE</th><th>NOTE</th><th>DATE</th></tr></thead><tbody>
              {saccoWorkspace.entries.filter((entry) => `${entry.member.name} ${entry.kind} ${entry.accountType} ${entry.reference} ${entry.note ?? ""}`.toLowerCase().includes(search.toLowerCase())).map((entry) => <tr key={entry.id}><td>{entry.member.name}</td><td>{saccoEntryLabel(entry.kind)}</td><td>{entry.accountType}</td><td className="amount-cell">{entry.kind === "WITHDRAWAL" ? "−" : ""}{kes(entry.amountMinor)}</td><td>{entry.reference}</td><td>{entry.note ?? "—"}</td><td>{displayDate(entry.createdAt)}</td></tr>)}
            </tbody></table> : <div className="empty-state">No account entries yet.</div>}</div>
          </section>}

          {section === "Contributions" && workspace && <section className="panel full-panel">
            <div className="panel-heading"><div><h2>Contribution ledger <span className="heading-count">{workspace.summary.contributionCount}</span></h2><p>Payments confirmed through M-Pesa and receipts recorded by group officers.</p></div><div className="heading-actions">
              {workspace.canManageGoals && <button className="button button-quiet" onClick={openPaymentModal}><Wallet size={15} /> Pay with M-Pesa</button>}
              <button className="button button-primary" onClick={() => workspace.canManageGoals ? setModal("contribution") : openPaymentModal()}><Plus size={16} /> {workspace.canManageGoals ? "Record contribution" : "Pay contribution"}</button>
            </div></div>
            <div className="table-toolbar"><SearchField value={search} onChange={setSearch} label="Search contributions" /><button className="select-button" onClick={exportReport}><Download size={14} /> Export CSV</button></div>
            <div className="table-wrap"><ContributionTable items={filteredContributions} extended /></div>
          </section>}

          {section === "Loans" && workspace && <section className="panel full-panel">
            <div className="panel-heading"><div><h2>{workspace.group.type === "SACCO" ? "Loan applications" : "Loan requests"} <span className="heading-count">{pendingLoans.length} pending</span></h2><p>{workspace.group.type === "SACCO" ? "Product and application tracking only. No amortization schedule, penalties, guarantors, or disbursement is included." : "Approvals are recorded with an audit trail. Approval does not disburse funds."}</p></div><button className="button button-primary" onClick={() => setModal("loan")}><Plus size={16} /> {workspace.group.type === "SACCO" ? "Apply for loan" : "New request"}</button></div>
            <div className="loan-list">{workspace.loans.map((loan) => <div className="loan-row" key={loan.id}>
              <div className="avatar avatar-peach">{initials(loan.member.name)}</div>
              <div className="loan-main"><strong>{loan.member.name}</strong><span>{loan.product ? `${loan.product.name} · ${loan.product.calculationMethod === "FLAT" ? "Flat" : "Reducing balance"} · ${loan.product.termMonths} months` : loan.purpose}</span></div>
              <div className="loan-date">{displayDate(loan.createdAt)}</div><strong className="loan-amount">{kes(loan.amountMinor)}</strong>
              <StatusPill status={loan.status} />
              {loan.status === "PENDING" && workspace.canDecideLoans && loan.member.id !== workspace.currentMemberId ? <div className="loan-decision"><button className="button button-quiet" disabled={busy} onClick={() => decideLoan(loan.id, "DECLINED")}>Decline</button><button className="button button-primary button-small" disabled={busy} onClick={() => decideLoan(loan.id, "APPROVED")}><Check size={15} /> Approve</button></div> : <span className="decision-spacer" />}
            </div>)}{workspace.loans.length === 0 && <div className="empty-state">There are no loan requests yet.</div>}</div>
          </section>}

          {section === "Reports" && workspace?.group.type === "SACCO" && <section className="reports-grid">
            <article className="panel report-highlight"><span className="report-icon"><Wallet size={19} /></span><span className="summary-label">{saccoWorkspace.isManager ? "BOSA SHARE CAPITAL RECORDED" : "YOUR BOSA SHARE CAPITAL RECORDED"}</span><strong>{kes(saccoSummary.shareCapital)}</strong><p>Manual register total; not a verified balance.</p></article>
            <article className="panel report-highlight"><span className="report-icon report-icon-violet"><Users size={19} /></span><span className="summary-label">SACCO MEMBERS</span><strong>{workspace.summary.memberCount}</strong><p>Members in this workspace.</p><button className="text-button" onClick={() => setSection("Members")}>View members <ArrowRight size={15} /></button></article>
            <article className="panel report-table"><div className="panel-heading"><div><h2>Product-based loan tracking</h2><p>{saccoLoanProducts.length} configured loan {saccoLoanProducts.length === 1 ? "product" : "products"} · {workspace.loans.length} recent applications</p></div><button className="text-button" onClick={() => setSection("Loans")}>View loans <ArrowRight size={15} /></button></div><div className="table-wrap">{saccoLoanProducts.length ? <table><thead><tr><th>PRODUCT</th><th>METHOD</th><th>ANNUAL RATE</th><th>TERM</th></tr></thead><tbody>{saccoLoanProducts.map((product) => <tr key={product.id}><td>{product.name}</td><td>{product.calculationMethod === "FLAT" ? "Flat" : "Reducing balance"}</td><td>{(product.annualInterestBps / 100).toFixed(2)}%</td><td>{product.termMonths} months</td></tr>)}</tbody></table> : <div className="empty-state">No loan products have been configured.</div>}</div></article>
            <div className="report-note"><ShieldCheck size={17} /><span>This MVP does not generate SASRA regulatory returns, amortization schedules, or accounting statements. Use your SACCO’s approved records for reporting.</span></div>
          </section>}

          {section === "Reports" && workspace?.group.type === "CHAMA" && <section className="reports-grid">
            <article className="panel report-highlight"><span className="report-icon"><Wallet size={19} /></span><span className="summary-label">TOTAL RECORDED CONTRIBUTIONS</span><strong>{kes(workspace.summary.contributionTotalMinor)}</strong><p>Sum of contribution records in this group’s ledger.</p><button className="button button-primary" onClick={exportReport}><Download size={16} /> Download CSV</button></article>
            <article className="panel report-highlight"><span className="report-icon report-icon-violet"><Users size={19} /></span><span className="summary-label">GROUP MEMBERS</span><strong>{workspace.summary.memberCount}</strong><p>Members currently recorded in this group.</p><button className="text-button" onClick={() => setSection("Members")}>View members <ArrowRight size={15} /></button></article>
            <article className="panel report-table"><div className="panel-heading"><div><h2>Recent contribution records</h2><p>Export a copy for your group records.</p></div><button className="icon-button" aria-label="Download contribution report" onClick={exportReport}><Download size={17} /></button></div><div className="table-wrap"><ContributionTable items={workspace.contributions.slice(0, 10)} extended /></div></article>
            <div className="report-note"><ShieldCheck size={17} /><span>Contributions are manually recorded group entries. Reconcile them against your official bank or mobile-money statements.</span></div>
          </section>}

          {section === "Settings" && <section className="settings-grid">
            {workspace && <article className="panel settings-panel"><div className="panel-heading"><div><h2>Group profile</h2><p>Your group’s workspace details.</p></div></div><div className="settings-row"><span>Organization type</span><strong>{workspace.group.type === "SACCO" ? "SACCO" : "Chama"}</strong></div><div className="settings-row"><span>Group name</span><strong>{workspace.group.name}</strong></div><div className="settings-row"><span>Currency</span><strong>{workspace.group.currency} · Kenyan Shilling</strong></div><div className="settings-row"><span>Members</span><strong>{workspace.summary.memberCount}</strong></div><div className="settings-row"><span>Your role</span><strong>{roleLabel(groupWorkspaces.find((group) => group.id === activeWorkspace)?.role ?? "MEMBER")}</strong></div></article>}
            {workspace && <article className="panel settings-panel">
              <div className="panel-heading"><div><h2>Bank, MMF & investment providers</h2><p>Set up provider details for this group.</p></div></div>
              <p className="form-note"><ShieldCheck size={15} /> Provider details only—no balances are imported and automatic syncing is not active. Never enter PINs, passwords, full account numbers, or API secrets. Details are visible to approved group members and authorized managers.</p>
              {financialProviders === null ? <div className="empty-state">Loading provider details…</div> : (["BANK", "MMF", "INVESTMENT"] as const).map((type) => {
                const provider = financialProviders.find((item) => item.type === type);
                const heading = type === "BANK" ? "Bank account" : type === "MMF" ? "Money market fund (MMF)" : "Investment holding";
                const identifierLabel = type === "BANK" ? "Masked account identifier" : "Masked member/reference number";
                const productLabel = type === "BANK" ? null : type === "MMF" ? "Fund name" : "Product or holding";
                return <div className="provider-setup-block" key={`${activeWorkspace}-${type}`}>
                  <h3>{heading}</h3>
                  {workspace.canManageMembers ? <form className="modal-form settings-daraja-form" onSubmit={(event) => void submitFinancialProvider(type, event)}>
                    <label>Provider name<input autoComplete="organization" defaultValue={provider?.providerName ?? ""} maxLength={100} minLength={2} name="providerName" placeholder={type === "BANK" ? "Bank name" : type === "MMF" ? "Fund manager" : "Investment provider"} required /></label>
                    <label>{identifierLabel}<input autoComplete="off" defaultValue={provider?.maskedIdentifier ?? ""} maxLength={40} name="maskedIdentifier" placeholder="Optional · e.g. ••••1234" /></label>
                    {productLabel && <label>{productLabel}<input defaultValue={provider?.productName ?? ""} maxLength={120} name="productName" placeholder={productLabel} /></label>}
                    <button className="button button-primary button-small" disabled={busy} type="submit">Save {heading.toLowerCase()}</button>
                  </form> : provider ? <div className="provider-setup-details">
                    <div className="settings-row"><span>Provider</span><strong>{provider.providerName}</strong></div>
                    {provider.maskedIdentifier && <div className="settings-row"><span>{identifierLabel}</span><strong>{provider.maskedIdentifier}</strong></div>}
                    {provider.productName && <div className="settings-row"><span>{productLabel}</span><strong>{provider.productName}</strong></div>}
                  </div> : <p className="muted-small">No provider details have been added.</p>}
                </div>;
              })}
            </article>}
            {workspace?.group.type === "SACCO" && <article className="panel settings-panel">
              <div className="panel-heading"><div><h2>SACCO loan products</h2><p>Product terms are stored for reference; repayments are not calculated.</p></div>{canManageSaccoProducts && <button className="button button-primary button-small" onClick={() => setModal("saccoProduct")}><Plus size={14} /> Add product</button>}</div>
              {saccoLoanProducts.length ? saccoLoanProducts.map((product) => <div className="settings-row" key={product.id}><span>{product.name}<small className="muted-small">{product.calculationMethod === "FLAT" ? "Flat rate" : "Reducing balance"}</small></span><strong>{(product.annualInterestBps / 100).toFixed(2)}% · {product.termMonths} months</strong></div>) : <div className="empty-state">No products configured yet.</div>}
              <p className="form-note"><ShieldCheck size={15} /> Product terms do not create an amortization schedule, accrue interest, approve a loan, or authorize disbursement.</p>
            </article>}
            <article className="panel settings-panel profile-settings-panel">
              <div className="panel-heading"><div><h2>Your profile</h2><p>Update your display name and profile photo.</p></div></div>
              <form className="profile-settings-form" onSubmit={submitProfile}>
                <div className="profile-photo-editor">
                  <ProfileAvatar className="avatar avatar-green profile-photo-preview" name={account.name} photo={profilePhoto} />
                  <div><strong>Profile photo</strong><span>PNG, JPEG, or WebP · up to 8 MB</span><div className="profile-photo-actions">
                    <button className="button button-secondary button-small" onClick={() => profilePhotoInput.current?.click()} type="button"><Camera size={14} /> Upload photo</button>
                    {profilePhoto && <button className="text-button profile-remove-photo" onClick={() => setProfilePhoto(null)} type="button">Remove</button>}
                  </div></div>
                  <input accept="image/png,image/jpeg,image/webp" className="visually-hidden" onChange={chooseProfilePhoto} ref={profilePhotoInput} type="file" />
                </div>
                <label className="profile-name-field">Display name<input autoComplete="name" maxLength={100} minLength={2} onChange={(event) => setProfileName(event.target.value)} required value={profileName} /></label>
                <label className="profile-name-field">Phone for SMS reminders<input autoComplete="tel" maxLength={13} onChange={(event) => setProfilePhone(event.target.value)} pattern="(?:\\+?254|0)?[17]\\d{8}" placeholder="0712 345 678" value={profilePhone} /></label>
                <div className="settings-row"><span>Email</span><strong>{account.email}</strong></div>
                <div className="settings-row"><span>Session</span><strong>Secure, HTTP-only cookie</strong></div>
                <div className="profile-save-row"><span>Phone number is used only for the SMS reminders you enable.</span><button className="button button-primary" disabled={busy || (profileName.trim() === account.name && profilePhone === (account.phone ?? "") && profilePhoto === account.profilePhotoData)} type="submit">{busy ? "Saving…" : "Save profile"}</button></div>
              </form>
              <div className="settings-row"><span>Sign out</span><button className="button button-quiet" onClick={signOut}>Sign out <LogOut size={14} /></button></div>
            </article>
            {workspace?.group.type === "CHAMA" && workspace.isAdmin && <article className="panel settings-panel">
              <div className="panel-heading"><div><h2>M-Pesa Daraja sandbox</h2><p>Configure this group’s Safaricom sandbox credentials.</p></div></div>
              {darajaConfigLoading ? <p className="muted-small">Loading M-Pesa configuration…</p> : <>
                <p className="form-note"><ShieldCheck size={15} /> Sandbox only: no live payments are processed. Credentials are encrypted before storage and never shown again.</p>
                <form className="modal-form settings-daraja-form" onSubmit={submitDarajaConfiguration}>
                  <label>Shortcode type<select onChange={(event) => setDarajaConfigForm({ ...darajaConfigForm, shortcodeType: event.target.value === "TILL" ? "TILL" : "PAYBILL" })} value={darajaConfigForm.shortcodeType}><option value="PAYBILL">Paybill</option><option value="TILL">Buy Goods (Till)</option></select></label>
                  <label>Business shortcode<input inputMode="numeric" maxLength={7} onChange={(event) => setDarajaConfigForm({ ...darajaConfigForm, shortcode: event.target.value })} pattern="\d{5,7}" required value={darajaConfigForm.shortcode} /></label>
                  <label>Consumer key<input autoComplete="off" onChange={(event) => setDarajaConfigForm({ ...darajaConfigForm, consumerKey: event.target.value })} placeholder={darajaConfig?.configured ? "Stored securely; leave blank to keep" : "Sandbox consumer key"} value={darajaConfigForm.consumerKey} /></label>
                  <label>Consumer secret<input autoComplete="new-password" onChange={(event) => setDarajaConfigForm({ ...darajaConfigForm, consumerSecret: event.target.value })} placeholder={darajaConfig?.configured ? "Stored securely; leave blank to keep" : "Sandbox consumer secret"} type="password" value={darajaConfigForm.consumerSecret} /></label>
                  <label>Passkey<input autoComplete="new-password" onChange={(event) => setDarajaConfigForm({ ...darajaConfigForm, passkey: event.target.value })} placeholder={darajaConfig?.configured ? "Stored securely; leave blank to keep" : "Sandbox Lipa na M-Pesa passkey"} type="password" value={darajaConfigForm.passkey} /></label>
                  {darajaConfig?.configured && <div className="settings-row"><span>Configuration status</span><strong>Sandbox · {darajaConfig.shortcodeType} · {darajaConfig.shortcode}</strong></div>}
                  <button className="button button-primary" disabled={busy} type="submit">{busy ? "Saving…" : darajaConfig?.configured ? "Update M-Pesa settings" : "Save M-Pesa settings"}</button>
                </form>
              </>}
            </article>}
          </section>}

          <footer className="page-footer"><span>© {new Intl.DateTimeFormat("en-KE", { year: "numeric", timeZone: "Africa/Nairobi" }).format(new Date())} Wealth Sketch · Group financial records</span><span><ShieldCheck size={14} /> Protected workspace</span></footer>
        </div>
      </main>

      {modal === "createGroup" && <Modal title="Create a workspace" onClose={() => setModal(null)}><form className="modal-form" onSubmit={submitGroupWorkspace}>
        <label>Organization type<select defaultValue="CHAMA" name="type"><option value="CHAMA">Chama</option><option value="SACCO">SACCO</option></select></label>
        <label>Organization name<input autoFocus maxLength={100} minLength={2} name="name" placeholder="e.g. Upendo SACCO" required /></label>
        <label>Contact phone<input autoComplete="tel" name="phone" placeholder="0712 345 678" required /></label>
        <label className="checkbox-field"><input name="constitutionSigned" required type="checkbox" /> I confirm this Chama or SACCO has a signed constitution or bylaws and designated officials.</label>
        <p className="form-note"><ShieldCheck size={15} /> Chama workspaces and SACCO workspaces have separate records and role permissions.</p>
        {error && <p className="inline-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-quiet" onClick={() => { setModal(null); setError(""); }} type="button">Cancel</button><button className="button button-primary" disabled={busy} type="submit"><Plus size={15} /> Create workspace</button></div>
      </form></Modal>}
      {workspace && modal === "member" && <Modal title="Invite a member" onClose={() => setModal(null)}><form className="modal-form" onSubmit={submitMember}><label>Full name<input autoFocus maxLength={100} name="name" placeholder="e.g. Grace Wanjala" required /></label><label>Email address<input autoComplete="email" maxLength={254} name="email" placeholder="grace@example.com" required type="email" /></label><label>Phone number<input autoComplete="tel" name="phone" placeholder="0712 345 678" required /></label><label>{workspace.group.type === "SACCO" ? "SACCO role" : "Group role"}<select defaultValue="MEMBER" name="role"><option value="MEMBER">Member</option><option value="TREASURER">Treasurer</option>{workspace.group.type === "SACCO" && <><option value="SECRETARY">Secretary</option><option value="CREDIT_OFFICER">Credit officer</option></>}</select></label><p className="form-note"><Mail size={15} /> We’ll email a secure invitation link that expires in 7 days.</p>{error && <p className="inline-error" role="alert">{error}</p>}<div className="modal-actions"><button className="button button-quiet" onClick={() => { setModal(null); setError(""); }} type="button">Cancel</button><button className="button button-primary" disabled={busy} type="submit"><Mail size={15} /> Send invitation</button></div></form></Modal>}
      {workspace?.group.type === "SACCO" && modal === "saccoEntry" && <Modal title="Record a manual SACCO entry" onClose={() => setModal(null)}><form className="modal-form" onSubmit={submitSaccoEntry}>
        <label>Member<select autoFocus defaultValue="" name="memberId" required><option disabled value="">Choose a member</option>{workspace.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
        <label>Entry type<select defaultValue="DEPOSIT" name="kind"><option value="SHARE_CAPITAL">Share capital</option><option value="DEPOSIT">Deposit</option><option value="WITHDRAWAL">Withdrawal</option></select></label>
        <label>Account<select defaultValue="BOSA" name="accountType"><option value="BOSA">BOSA</option><option value="FOSA">FOSA</option></select></label>
        <label>Amount (KES)<input min="1" max="999999999999" name="amountKes" placeholder="e.g. 5,000" required step="1" type="number" /></label>
        <label>Note <span className="optional-label">(optional)</span><input maxLength={300} name="note" placeholder="Reference or useful details" /></label>
        <p className="form-note"><ShieldCheck size={15} /> Share capital must be assigned to BOSA. This records a manual entry only; it does not collect, verify, or move money.</p>
        {error && <p className="inline-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-quiet" onClick={() => { setModal(null); setError(""); }} type="button">Cancel</button><button className="button button-primary" disabled={busy} type="submit"><Plus size={15} /> Save entry</button></div>
      </form></Modal>}
      {workspace?.group.type === "SACCO" && modal === "saccoProduct" && <Modal title="Configure a loan product" onClose={() => setModal(null)}><form className="modal-form" onSubmit={submitSaccoProduct}>
        <label>Product name<input autoFocus maxLength={100} minLength={2} name="name" placeholder="e.g. Development loan" required /></label>
        <label>Interest calculation method<select defaultValue="REDUCING_BALANCE" name="calculationMethod"><option value="REDUCING_BALANCE">Reducing balance</option><option value="FLAT">Flat rate</option></select></label>
        <label>Annual interest rate (%)<input max="99.99" min="0" name="annualInterestPercent" placeholder="e.g. 12.5" required step="0.01" type="number" /></label>
        <label>Term (months)<input max="999" min="1" name="termMonths" placeholder="e.g. 24" required step="1" type="number" /></label>
        <p className="form-note"><ShieldCheck size={15} /> These terms are saved for reference only. Wealth Sketch does not calculate repayments or accrued interest.</p>
        {error && <p className="inline-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-quiet" onClick={() => { setModal(null); setError(""); }} type="button">Cancel</button><button className="button button-primary" disabled={busy} type="submit"><Plus size={15} /> Save product</button></div>
      </form></Modal>}
      {workspace && modal === "contribution" && <Modal title="Record a contribution" onClose={() => setModal(null)}><form className="modal-form" onSubmit={submitContribution}><label>Member<select defaultValue="" name="memberId" required><option disabled value="">Choose a member</option>{workspace.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label><label>Amount (KES)<input min="1" max="999999999999" name="amountKes" placeholder="e.g. 5,000" required step="1" type="number" /></label><label>Allocate to savings goal <span className="optional-label">(optional)</span><select defaultValue="" name="savingsGoalId"><option value="">Do not allocate to a goal</option>{goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title} · {goal.member?.name ?? "Group"}</option>)}</select></label><p className="form-note">An allocated contribution counts toward this goal only. Choose a goal that matches the selected member.</p><label>Received via<select defaultValue="MPESA" name="method"><option value="MPESA">M-Pesa (received externally)</option><option value="BANK">Bank (received externally)</option><option value="CASH">Cash</option></select></label><label>Reference or note <span className="optional-label">(optional)</span><input maxLength={300} name="note" placeholder="e.g. Bank reference" /></label><p className="form-note"><ShieldCheck size={15} /> This records a received payment; verify it against the provider or bank statement first.</p>{error && <p className="inline-error" role="alert">{error}</p>}<div className="modal-actions"><button className="button button-quiet" onClick={() => { setModal(null); setError(""); }} type="button">Cancel</button><button className="button button-primary" disabled={busy} type="submit"><Plus size={15} /> Record entry</button></div></form></Modal>}
      {workspace && modal === "payment" && <Modal title="Pay contribution with M-Pesa" onClose={() => setModal(null)}><form className="modal-form" onSubmit={submitDarajaPayment}>
        <label>Amount (KES)<input autoFocus disabled={busy || darajaPayment?.status === "PENDING"} max="150000" min="1" name="amountKes" placeholder="e.g. 500" required step="1" type="number" /></label>
        <label>M-Pesa phone number<input autoComplete="tel" defaultValue={workspace.members.find((member) => member.id === workspace.currentMemberId)?.phone ?? ""} disabled={busy || darajaPayment?.status === "PENDING"} name="phone" placeholder="0712 345 678" required /></label>
        <label>Allocate to savings goal <span className="optional-label">(optional)</span><select defaultValue="" disabled={busy || darajaPayment?.status === "PENDING"} name="savingsGoalId"><option value="">Do not allocate to a goal</option>{goals.filter((goal) => !goal.memberId || goal.memberId === workspace.currentMemberId).map((goal) => <option key={goal.id} value={goal.id}>{goal.title} · {goal.member?.name ?? "Group"}</option>)}</select></label>
        <p className="form-note"><ShieldCheck size={15} /> Sandbox test only. You will receive a simulated payment prompt; the group ledger updates only after Safaricom confirms the payment.</p>
        {darajaPayment && <p className="form-note" role="status">{darajaPayment.status === "PENDING" ? "Waiting for M-Pesa confirmation…" : darajaPayment.status === "SUCCEEDED" ? `Payment confirmed${darajaPayment.receipt ? ` · ${darajaPayment.receipt}` : ""}.` : darajaPayment.message}</p>}
        {error && <p className="inline-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-quiet" onClick={() => { setModal(null); setError(""); }} type="button">Cancel</button><button className="button button-primary" disabled={busy || darajaPayment?.status === "SUCCEEDED"} type="submit"><Wallet size={15} /> {busy ? "Checking payment…" : darajaPayment?.status === "PENDING" ? "Check payment status" : darajaPayment?.status === "FAILED" ? "Try another payment" : darajaPayment?.status === "SUCCEEDED" ? "Payment confirmed" : "Send M-Pesa prompt"}</button></div>
      </form></Modal>}
      {modal === "personalActivity" && <Modal title="Add a private finance record" onClose={() => setModal(null)}><form className="modal-form" onSubmit={submitPersonalActivity}>
        <label>Description<input autoFocus maxLength={120} minLength={2} name="title" placeholder="e.g. Monthly savings" required /></label>
        <label>Record type<select defaultValue="SAVING" name="kind"><option value="SAVING">Saving</option><option value="INVESTMENT">Investment</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option></select></label>
        <label>Amount (KES)<input min="1" max="999999999999" name="amountKes" placeholder="e.g. 2,000" required step="1" type="number" /></label>
        <label>Personal goal <span className="optional-label">(optional)</span><select defaultValue="" name="goalId"><option value="">No goal</option>{personalWorkspace.goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title} · {activityKindLabel(goal.kind)}</option>)}</select></label>
        <label>Date<input defaultValue={inputDate()} max={inputDate()} name="occurredAt" type="date" /></label>
        <p className="form-note"><ShieldCheck size={15} /> Private to your account. This does not move money or affect a chama ledger.</p>
        {error && <p className="inline-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-quiet" onClick={() => { setModal(null); setError(""); }} type="button">Cancel</button><button className="button button-primary" disabled={busy} type="submit">Save private record</button></div>
      </form></Modal>}
      {modal === "personalGoal" && <Modal title="Create a personal goal" onClose={() => setModal(null)}><form className="modal-form" onSubmit={submitPersonalGoal}>
        <label>Goal name<input autoFocus maxLength={100} minLength={2} name="title" placeholder="e.g. Emergency savings" required /></label>
        <label>Goal type<select defaultValue="SAVING" name="kind"><option value="SAVING">Savings</option><option value="INVESTMENT">Investment</option></select></label>
        <label>Target amount (KES)<input min="1" max="999999999999" name="targetKes" placeholder="e.g. 50,000" required step="1" type="number" /></label>
        <label>Target date<input defaultValue={inputDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))} name="targetDate" required type="date" /></label>
        <p className="form-note"><ShieldCheck size={15} /> Only your private entries count toward personal goal progress.</p>
        {error && <p className="inline-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-quiet" onClick={() => { setModal(null); setError(""); }} type="button">Cancel</button><button className="button button-primary" disabled={busy} type="submit">Create personal goal</button></div>
      </form></Modal>}
      {modal === "reminder" && <Modal title="Schedule a reminder" onClose={() => setModal(null)}><form className="modal-form" onSubmit={submitReminder}>
        <label>Reminder title<input autoFocus maxLength={120} minLength={2} name="title" placeholder="e.g. Monthly contribution due" required /></label>
        <label>Details<input maxLength={500} name="message" placeholder="Add any useful notes" /></label>
        <label>Date and time<input defaultValue={inputDateTime(new Date(Date.now() + 24 * 60 * 60 * 1000))} min={inputDateTime(new Date())} name="dueAt" required type="datetime-local" /></label>
        <fieldset className="reminder-channel-options"><legend>Notify me by</legend><label className="checkbox-field"><input name="emailEnabled" type="checkbox" /> Email</label><label className="checkbox-field"><input name="smsEnabled" type="checkbox" /> SMS</label><small>In-app alerts are always on. Email needs SMTP; SMS needs Twilio and a saved phone number.</small></fieldset>
        {activeWorkspace !== "personal" && workspace?.canManageGoals && <label className="checkbox-field"><input name="sharedWithGroup" type="checkbox" /> Share this reminder with the {workspace.group.type === "SACCO" ? "SACCO" : "chama"}</label>}
        {error && <p className="inline-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-quiet" onClick={() => { setModal(null); setError(""); }} type="button">Cancel</button><button className="button button-primary" disabled={busy} type="submit">Schedule reminder</button></div>
      </form></Modal>}
      {workspace && modal === "goal" && <Modal title="Create a savings goal" onClose={() => setModal(null)}><form className="modal-form" onSubmit={submitGoal}>
        <label>Goal name<input autoFocus maxLength={80} minLength={2} name="title" placeholder="e.g. Emergency fund" required /></label>
        <label>Target amount (KES)<input min="1" max="999999999999" name="targetKes" placeholder="e.g. 50,000" required step="1" type="number" /></label>
        {workspace.canManageGoals ? <label>Goal for<select defaultValue="" name="memberId"><option value="">Whole group</option>{workspace.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label> : <><input name="memberId" type="hidden" value={workspace.currentMemberId ?? ""} /><p className="form-note">This personal goal tracks your recorded contributions.</p></>}
        <div className="goal-date-fields"><label>Start date<input defaultValue={inputDate()} max="9999-12-31" name="startsAt" required type="date" /></label><label>Target date<input defaultValue={inputDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))} name="deadline" required type="date" /></label></div>
        <p className="form-note"><ShieldCheck size={15} /> Only contributions explicitly assigned to this goal count. This does not verify or move money.</p>
        {error && <p className="inline-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-quiet" onClick={() => { setModal(null); setError(""); }} type="button">Cancel</button><button className="button button-primary" disabled={busy} type="submit"><Target size={15} /> Create goal</button></div>
      </form></Modal>}
      {workspace && modal === "loan" && <Modal title={workspace.group.type === "SACCO" ? "Apply for a SACCO loan" : "Create a loan request"} onClose={() => setModal(null)}><form className="modal-form" onSubmit={submitLoan}>
        {canChooseLoanMember ? <label>Requesting member<select defaultValue="" name="memberId" required><option disabled value="">Choose a member</option>{workspace.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label> : <input name="memberId" type="hidden" value={workspace.currentMemberId ?? ""} />}
        {workspace.group.type === "SACCO" && <label>Loan product<select defaultValue="" name="productId" required><option disabled value="">Choose a loan product</option>{saccoLoanProducts.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.calculationMethod === "FLAT" ? "Flat" : "Reducing balance"} · {(product.annualInterestBps / 100).toFixed(2)}% · {product.termMonths} months</option>)}</select></label>}
        <label>Purpose<input maxLength={250} minLength={3} name="purpose" placeholder="e.g. School fees" required /></label>
        <label>Amount (KES)<input min="1" max="999999999999" name="amountKes" placeholder="e.g. 10,000" required step="1" type="number" /></label>
        <p className="form-note"><Clock3 size={15} /> {workspace.group.type === "SACCO" ? "This is an application record only. Product terms do not calculate repayments or authorize a disbursement." : "Approval is recorded, but does not move money or disburse the loan."}</p>
        {workspace.group.type === "SACCO" && saccoLoanProducts.length === 0 && <p className="inline-error" role="alert">A SACCO officer must configure a loan product before applications can be submitted.</p>}
        {error && <p className="inline-error" role="alert">{error}</p>}
        <div className="modal-actions"><button className="button button-quiet" onClick={() => { setModal(null); setError(""); }} type="button">Cancel</button><button className="button button-primary" disabled={busy || (workspace.group.type === "SACCO" && saccoLoanProducts.length === 0)} type="submit"><Plus size={15} /> {workspace.group.type === "SACCO" ? "Submit application" : "Submit request"}</button></div>
      </form></Modal>}
      {notice && <div className="toast" role="status"><CheckCircle2 size={17} /><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice("")}><X size={15} /></button></div>}
    </div>
  );
}

function Brand() {
  return <Link className="brand" href="/" aria-label="Wealth Sketch home"><span className="brand-mark"><span /><span /><span /><span /></span><span className="brand-name">wealth sketch<span className="brand-period">.</span><small>GROUP WEALTH, GROWING</small></span></Link>;
}

function StatCard({ icon, label, value, foot }: { icon: React.ReactNode; label: string; value: string; foot: string }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon balance-icon">{icon}</span></div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></article>;
}

function GoalProgress({ goal, index }: { goal: SavingsGoal; index: number }) {
  return <div className="goal-overview-item" style={{ animationDelay: `${index * 100}ms` }}>
    <div className="goal-overview-row"><strong>{goal.title}</strong><span>{goal.member?.name ?? "Group"}</span></div>
    <div aria-label={`${goal.progressPercent}% complete`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={goal.progressPercent} className="goal-progress-track" role="progressbar"><span style={{ width: `${goal.progressPercent}%` }} /></div>
    <div className="goal-overview-foot"><span>{kes(goal.savedMinor)} of {kes(goal.targetMinor)}</span><span>{goal.hasStarted ? `Score ${goal.disciplineScore}` : "Not started"}</span></div>
  </div>;
}

function SearchField({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return <label className="search-box"><Search size={16} /><input aria-label={label} onChange={(event) => onChange(event.target.value)} placeholder={label} value={value} /></label>;
}

function PersonCell({ name, detail, index }: { name: string; detail: string; index: number }) {
  return <div className="person-cell"><span className={`avatar avatar-${index % 4}`}>{initials(name)}</span><span><strong>{name}</strong><small>{detail}</small></span></div>;
}

function ProfileAvatar({ name, photo, className }: { name: string; photo: string | null; className: string }) {
  return <div className={className}>{photo ? <Image alt="" height={58} src={photo} unoptimized width={58} /> : initials(name)}</div>;
}

function RolePill({ role }: { role: Member["role"] }) {
  const label = roleLabel(role);
  return <span className={`role-pill role-${role.toLowerCase()}`}>{label}</span>;
}

function roleLabel(role: Member["role"]) {
  return role === "OWNER" ? "Owner" : role === "ADMIN" ? "Admin" : role === "TREASURER" ? "Treasurer" : role === "CHAIRPERSON" ? "Chairperson" : role === "SECRETARY" ? "Secretary" : role === "CREDIT_OFFICER" ? "Credit officer" : "Member";
}

function saccoEntryLabel(kind: SaccoEntry["kind"]) {
  return kind === "SHARE_CAPITAL" ? "Share capital" : kind === "DEPOSIT" ? "Deposit" : "Withdrawal";
}

function activityKindLabel(kind: PersonalActivity["kind"]) {
  return kind === "SAVING" ? "Saving" : kind === "INVESTMENT" ? "Investment" : kind === "INCOME" ? "Income" : "Expense";
}

function StatusPill({ status }: { status: Loan["status"] }) {
  const label = status === "PENDING" ? "Awaiting approval" : status === "APPROVED" ? "Approved" : "Declined";
  const className = status === "APPROVED" ? "status-pill status-success" : status === "DECLINED" ? "status-pill status-danger" : "status-pill status-warning";
  return <span className={className}><i />{label}</span>;
}

function ContributionTable({ items, extended = false }: { items: Contribution[]; extended?: boolean }) {
  if (items.length === 0) return <div className="empty-state">No contribution records yet. Add one after confirming the payment was received.</div>;
  return <table><thead><tr><th>MEMBER</th><th>AMOUNT</th><th>RECORDED</th>{extended && <><th>METHOD</th><th>SAVINGS GOAL</th></>}<th>REFERENCE</th></tr></thead><tbody>
    {items.map((item, index) => <tr key={item.id}><td><PersonCell name={item.member.name} detail={extended ? item.reference : displayDate(item.createdAt)} index={index} /></td><td className="amount-cell">{kes(item.amountMinor)}</td><td>{displayDate(item.createdAt)}</td>{extended && <><td><span className="method-label">{item.method === "MPESA" ? "M-Pesa" : item.method === "BANK" ? "Bank" : "Cash"}</span></td><td>{item.savingsGoal?.title ?? "—"}</td></>}<td className="reference-cell">{item.reference}</td></tr>)}
  </tbody></table>;
}
