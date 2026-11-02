"use client";

import { Activity, CircleDollarSign, Clock3, Users } from "lucide-react";
import { useMemo, useState } from "react";

export type AnalyticsRange = "7d" | "30d" | "90d" | "12m";

export type DashboardAnalyticsData = {
  range: AnalyticsRange;
  trend: {
    date: string;
    contributionMinor: string;
    contributionCount: number;
    loanMinor: string;
    loanCount: number;
  }[];
  methods: { method: "MPESA" | "BANK" | "CASH"; amountMinor: string; count: number }[];
  members: { memberId: string; name: string; contributionMinor: string; loanMinor: string }[];
  totals: {
    contributionMinor: string;
    contributionCount: number;
    loanMinor: string;
    loanCount: number;
    activeMembers: number;
    memberCount: number;
    resolvedLoans: number;
  };
};

type Props = {
  data: DashboardAnalyticsData;
  goals: { progressPercent: number; disciplineScore: number; hasStarted: boolean }[];
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
  live: boolean;
  lastUpdated: Date | null;
};

const methodLabels = { MPESA: "M-Pesa", BANK: "Bank", CASH: "Cash" } as const;
const methodColors = { MPESA: "#16865b", BANK: "#6684d9", CASH: "#e5a84e" } as const;
const rangeLabels: Record<AnalyticsRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
};

function amount(minor: string | bigint) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(Number(BigInt(minor) / 100n));
}

function minorNumber(minor: string) {
  return Number(BigInt(minor));
}

function linePath(values: number[], width: number, height: number, max: number) {
  if (values.length === 0) return "";
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  return values.map((value, index) => {
    const x = index * step;
    const y = height - (value / max) * height;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

function chartLabel(date: string, range: AnalyticsRange) {
  const value = new Date(date);
  return new Intl.DateTimeFormat("en-KE", range === "12m"
    ? { month: "short", year: "2-digit", timeZone: "UTC" }
    : { day: "numeric", month: "short", timeZone: "UTC" }).format(value);
}

function donutPath(startAngle: number, endAngle: number, radius: number) {
  const point = (angle: number) => ({
    x: 100 + radius * Math.cos(angle - Math.PI / 2),
    y: 100 + radius * Math.sin(angle - Math.PI / 2),
  });
  const start = point(startAngle);
  const end = point(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M 100 100 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const path = linePath(values, 100, 28, max);
  const fill = values.length > 0 ? `${path} L 100 30 L 0 30 Z` : "";
  return <svg aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 30">
    <path d={fill} fill={color} opacity=".12" />
    <path d={path} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" vectorEffect="non-scaling-stroke" />
  </svg>;
}

export function DashboardAnalytics({ data, goals, range, onRangeChange, live, lastUpdated }: Props) {
  const [chartType, setChartType] = useState<"area" | "line">("area");
  const [distributionType, setDistributionType] = useState<"donut" | "pie">("donut");
  const [visibleTrend, setVisibleTrend] = useState({ contributions: true, loans: true });
  const [visibleMethods, setVisibleMethods] = useState<Record<string, boolean>>({
    MPESA: true,
    BANK: true,
    CASH: true,
  });

  const metrics = useMemo(() => {
    const contributionValues = data.trend.map((item) => minorNumber(item.contributionMinor));
    const loanValues = data.trend.map((item) => minorNumber(item.loanMinor));
    const contributionCountValues = data.trend.map((item) => item.contributionCount);
    const activityPeriods = data.trend.filter((item) => item.contributionCount > 0).length;
    const totalLoanCount = data.totals.loanCount;
    const goalProgress = goals.length
      ? goals.reduce((sum, goal) => sum + goal.progressPercent, 0) / goals.length
      : 0;
    const startedGoals = goals.filter((goal) => goal.hasStarted);
    const discipline = startedGoals.length
      ? startedGoals.reduce((sum, goal) => sum + goal.disciplineScore, 0) / startedGoals.length
      : 0;
    const radar = [
      { label: "Goal progress", value: goalProgress },
      { label: "Member activity", value: data.totals.memberCount ? data.totals.activeMembers / data.totals.memberCount * 100 : 0 },
      { label: "Saving rhythm", value: data.trend.length ? activityPeriods / data.trend.length * 100 : 0 },
      { label: "Loan decisions", value: totalLoanCount ? data.totals.resolvedLoans / totalLoanCount * 100 : 0 },
      { label: "Goal discipline", value: discipline },
    ];
    return { contributionValues, loanValues, contributionCountValues, radar };
  }, [data, goals]);

  const totalMethodMinor = data.methods.reduce((sum, method) => sum + BigInt(method.amountMinor), 0n);
  const hasTrendActivity = data.trend.some((item) => item.contributionCount > 0 || item.loanCount > 0);
  const enabledMethods = data.methods.filter((method) => visibleMethods[method.method]);
  const visibleMethodMinor = enabledMethods.reduce((sum, method) => sum + BigInt(method.amountMinor), 0n);
  const chartWidth = 720;
  const chartHeight = 210;
  const maxTrend = Math.max(
    1,
    ...metrics.contributionValues.filter(() => visibleTrend.contributions),
    ...metrics.loanValues.filter(() => visibleTrend.loans),
  );
  const contributionPath = linePath(metrics.contributionValues, chartWidth, chartHeight, maxTrend);
  const loanPath = linePath(metrics.loanValues, chartWidth, chartHeight, maxTrend);
  const contributionArea = metrics.contributionValues.length
    ? `${contributionPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`
    : "";
  const barMaximum = Math.max(1, ...data.members.flatMap((member) => [
    minorNumber(member.contributionMinor),
    minorNumber(member.loanMinor),
  ]));
  const radarPoints = metrics.radar.map((item, index) => {
    const angle = (index / metrics.radar.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 72 * Math.max(0, Math.min(100, item.value)) / 100;
    return { ...item, x: 100 + Math.cos(angle) * radius, y: 94 + Math.sin(angle) * radius };
  });
  const radarPolygon = radarPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const maxMethodMinor = Math.max(0, ...data.methods.map((method) => minorNumber(method.amountMinor)));
  const contributionAverage = data.totals.contributionCount
    ? BigInt(data.totals.contributionMinor) / BigInt(data.totals.contributionCount)
    : 0n;

  let methodAngle = 0;
  const methodSlices = enabledMethods.map((method) => {
    const amountMinor = BigInt(method.amountMinor);
    const slice = visibleMethodMinor === 0n ? 0 : Number((amountMinor * 1_000_000n) / visibleMethodMinor) / 1_000_000;
    const start = methodAngle;
    methodAngle += slice * Math.PI * 2;
    return { ...method, start, end: methodAngle };
  });

  return (
    <section aria-label="Group analytics" className="analytics-section">
      <div className="analytics-heading">
        <div>
          <span className="analytics-kicker"><Activity size={14} /> GROUP INSIGHTS</span>
          <h2>Money in motion</h2>
          <p>Trends reflect recorded contributions and loan requests, not a live cash balance.</p>
        </div>
        <label className="analytics-range">
          <span>Date range</span>
          <select aria-label="Analytics date range" onChange={(event) => onRangeChange(event.target.value as AnalyticsRange)} value={range}>
            {Object.entries(rangeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
      </div>

      <div className="analytics-kpis">
        <article className="analytics-kpi">
          <span><CircleDollarSign size={15} /> CONTRIBUTIONS</span>
          <strong>{amount(data.totals.contributionMinor)}</strong>
          <small>{data.totals.contributionCount} recorded · avg. {amount(contributionAverage)}</small>
          <div className="analytics-spark"><Sparkline values={metrics.contributionValues} color="#18805a" /></div>
        </article>
        <article className="analytics-kpi">
          <span><Activity size={15} /> LOANS REQUESTED</span>
          <strong>{amount(data.totals.loanMinor)}</strong>
          <small>{data.totals.loanCount} requests in range</small>
          <div className="analytics-spark"><Sparkline values={metrics.loanValues} color="#d89a42" /></div>
        </article>
        <article className="analytics-kpi">
          <span><Users size={15} /> ACTIVE SAVERS</span>
          <strong>{data.totals.activeMembers}<i> / {data.totals.memberCount}</i></strong>
          <small>Members with a recorded contribution</small>
          <div className="analytics-kpi-meter"><span style={{ width: `${data.totals.memberCount ? data.totals.activeMembers / data.totals.memberCount * 100 : 0}%` }} /></div>
        </article>
        <article className="analytics-kpi">
          <span><Clock3 size={15} /> CONTRIBUTION ACTIVITY</span>
          <strong>{data.totals.contributionCount}</strong>
          <small>{rangeLabels[range].toLowerCase()}</small>
          <div className="analytics-spark"><Sparkline values={metrics.contributionCountValues} color="#6684d9" /></div>
        </article>
      </div>

      <div className="analytics-grid">
        <article className="panel analytics-panel analytics-trend">
          <div className="analytics-panel-heading">
            <div><h3>Contribution & loan trend</h3><p>{rangeLabels[range]} · values in KES</p></div>
            <div className="analytics-chart-switch" aria-label="Trend chart type">
              <button aria-pressed={chartType === "area"} onClick={() => setChartType("area")} type="button">Area</button>
              <button aria-pressed={chartType === "line"} onClick={() => setChartType("line")} type="button">Line</button>
            </div>
          </div>
          <div className="analytics-legend">
            <button aria-pressed={visibleTrend.contributions} onClick={() => setVisibleTrend((current) => ({ ...current, contributions: !current.contributions }))} type="button"><i className="legend-contribution" /> Contributions</button>
            <button aria-pressed={visibleTrend.loans} onClick={() => setVisibleTrend((current) => ({ ...current, loans: !current.loans }))} type="button"><i className="legend-loan" /> Loan requests</button>
          </div>
          <div className="analytics-line-chart">
            <svg aria-label={`${chartType} chart of contributions and requested loan amounts`} role="img" preserveAspectRatio="none" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              {[0, 1, 2, 3, 4].map((line) => <line className="analytics-gridline" key={line} x1="0" x2={chartWidth} y1={line * (chartHeight / 4)} y2={line * (chartHeight / 4)} />)}
              {visibleTrend.contributions && chartType === "area" && <path className="analytics-area-fill" d={contributionArea} />}
              {visibleTrend.contributions && <path className="analytics-contribution-line" d={contributionPath} />}
              {visibleTrend.loans && <path className="analytics-loan-line" d={loanPath} />}
              {visibleTrend.contributions && metrics.contributionValues.map((value, index) => {
                if (!value) return null;
                const x = metrics.contributionValues.length > 1 ? index * chartWidth / (metrics.contributionValues.length - 1) : 0;
                const y = chartHeight - (value / maxTrend) * chartHeight;
                return <circle className="analytics-point-contribution" key={`contribution-${data.trend[index].date}`} cx={x} cy={y} r="3" />;
              })}
            </svg>
            {!hasTrendActivity && <span className="analytics-chart-empty">No recorded activity in this range.</span>}
          </div>
          <div className="analytics-axis-labels">
            <span>{data.trend[0] ? chartLabel(data.trend[0].date, range) : rangeLabels[range]}</span>
            <span>{data.trend[Math.floor(data.trend.length / 2)] ? chartLabel(data.trend[Math.floor(data.trend.length / 2)].date, range) : ""}</span>
            <span>{data.trend.at(-1) ? chartLabel(data.trend.at(-1)!.date, range) : "Today"}</span>
          </div>
        </article>

        <article className="panel analytics-panel analytics-methods">
          <div className="analytics-panel-heading">
            <div><h3>Contribution mix</h3><p>Share by recorded payment method</p></div>
            <div className="analytics-chart-switch" aria-label="Distribution chart type">
              <button aria-pressed={distributionType === "donut"} onClick={() => setDistributionType("donut")} type="button">Donut</button>
              <button aria-pressed={distributionType === "pie"} onClick={() => setDistributionType("pie")} type="button">Pie</button>
            </div>
          </div>
          <div className="analytics-donut-layout">
            <div className={`analytics-donut ${distributionType === "pie" ? "analytics-pie" : ""}`}>
              <svg aria-label={`${distributionType} chart of recorded contributions by payment method`} role="img" viewBox="0 0 200 200">
                {totalMethodMinor === 0n && <circle className="analytics-empty-ring" cx="100" cy="100" r="80" />}
                {methodSlices.map((slice) => slice.end - slice.start > Math.PI * 1.999999
                  ? <circle aria-hidden="true" cx="100" cy="100" fill={methodColors[slice.method]} key={slice.method} r="82" />
                  : <path
                    aria-hidden="true"
                    d={donutPath(slice.start, slice.end, 82)}
                    fill={methodColors[slice.method]}
                    key={slice.method}
                  />)}
                {distributionType === "donut" && <circle className="analytics-donut-hole" cx="100" cy="100" r="52" />}
              </svg>
              {distributionType === "donut" && <div className="analytics-donut-center"><strong>{amount(visibleMethodMinor)}</strong><span>RECORDED</span></div>}
            </div>
            <div className="analytics-method-legend">
              {(["MPESA", "BANK", "CASH"] as const).map((method) => {
                const row = data.methods.find((item) => item.method === method);
                const share = totalMethodMinor ? Number(((BigInt(row?.amountMinor ?? "0") * 100n) / totalMethodMinor)) : 0;
                return <button aria-pressed={visibleMethods[method]} className={!visibleMethods[method] ? "is-muted" : ""} key={method} onClick={() => setVisibleMethods((current) => ({ ...current, [method]: !current[method] }))} type="button">
                  <i style={{ backgroundColor: methodColors[method] }} /><span>{methodLabels[method]}<small>{row?.count ?? 0} records</small></span><strong>{share}%</strong>
                </button>;
              })}
              {maxMethodMinor === 0 && <span className="analytics-empty-copy">No contributions recorded in this period.</span>}
            </div>
          </div>
        </article>

        <article className="panel analytics-panel analytics-member-bars">
          <div className="analytics-panel-heading"><div><h3>Member activity</h3><p>Recorded contributions vs requested loans</p></div></div>
          {data.members.length ? <div className="analytics-bar-list">
            {data.members.map((member) => <div className="analytics-member-row" key={member.memberId}>
              <span title={member.name}>{member.name}</span>
              <svg
                aria-label={`${member.name}: ${amount(member.contributionMinor)} contributions, ${amount(member.loanMinor)} loan requests`}
                className="analytics-bar-pair"
                preserveAspectRatio="none"
                role="img"
                viewBox="0 0 100 20"
              >
                <rect className="analytics-contribution-bar" height="6" rx="3" width={minorNumber(member.contributionMinor) / barMaximum * 100} y="1" />
                <rect className="analytics-loan-bar" height="6" rx="3" width={minorNumber(member.loanMinor) / barMaximum * 100} y="11" />
              </svg>
              <small>{amount(member.contributionMinor)}</small>
            </div>)}
            <div className="analytics-bar-legend"><span><i className="legend-contribution" /> Contributions</span><span><i className="legend-loan" /> Requested</span></div>
          </div> : <div className="analytics-empty">No member activity recorded in this period.</div>}
        </article>

        <article className="panel analytics-panel analytics-radar-panel">
          <div className="analytics-panel-heading"><div><h3>Group health</h3><p>Current goal progress & activity in range</p></div></div>
          <div className="analytics-radar-layout">
            <svg aria-label="Radar chart showing goal progress, member activity, saving rhythm, loan decisions, and goal discipline" role="img" viewBox="0 0 200 190">
              {[25, 50, 75, 100].map((scale) => {
                const points = metrics.radar.map((_, index) => {
                  const angle = index / metrics.radar.length * Math.PI * 2 - Math.PI / 2;
                  return `${100 + Math.cos(angle) * 72 * scale / 100},${94 + Math.sin(angle) * 72 * scale / 100}`;
                }).join(" ");
                return <polygon className="analytics-radar-grid" key={scale} points={points} />;
              })}
              {metrics.radar.map((_, index) => {
                const angle = index / metrics.radar.length * Math.PI * 2 - Math.PI / 2;
                return <line className="analytics-radar-axis" key={index} x1="100" x2={100 + Math.cos(angle) * 72} y1="94" y2={94 + Math.sin(angle) * 72} />;
              })}
              <polygon className="analytics-radar-shape" points={radarPolygon} />
              {radarPoints.map((point) => <circle className="analytics-radar-point" cx={point.x} cy={point.y} key={point.label} r="3" />)}
            </svg>
            <ul>{metrics.radar.map((metric) => <li key={metric.label}><span>{metric.label}</span><strong>{Math.round(metric.value)}%</strong></li>)}</ul>
          </div>
          {goals.length === 0 && <p className="analytics-disclaimer">Create a savings goal to include goal progress and discipline.</p>}
        </article>
      </div>
      <div aria-live="polite" className="analytics-updated">
        <span className={live ? "analytics-live-dot" : ""} />
        {live ? "Live Stream on · refreshing from saved records every 15 seconds" : `Updated ${lastUpdated ? lastUpdated.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" }) : "when loaded"}`}
      </div>
    </section>
  );
}
