const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type GoalDiscipline = {
  disciplineScore: number;
  amountBehindMinor: string;
  suggestedWeeklyMinor: string;
  projectedCompletionAt: string | null;
  hasStarted: boolean;
};

export function calculateGoalDiscipline(
  targetMinor: bigint,
  savedMinor: bigint,
  startsAt: Date,
  deadline: Date,
  now: Date,
): GoalDiscipline {
  const startDay = Date.UTC(startsAt.getUTCFullYear(), startsAt.getUTCMonth(), startsAt.getUTCDate());
  const deadlineDay = Date.UTC(deadline.getUTCFullYear(), deadline.getUTCMonth(), deadline.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const totalDays = Math.max(1, Math.floor((deadlineDay - startDay) / DAY_IN_MS) + 1);
  const elapsedDays = Math.min(totalDays, Math.max(0, Math.floor((today - startDay) / DAY_IN_MS) + 1));
  const expectedMinor = targetMinor * BigInt(elapsedDays) / BigInt(totalDays);
  const remainingMinor = savedMinor >= targetMinor ? 0n : targetMinor - savedMinor;
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const suggestedWeeklyMinor = remainingDays > 0
    ? (remainingMinor * 7n + BigInt(remainingDays) - 1n) / BigInt(remainingDays)
    : 0n;
  const daysToCompletion = savedMinor > 0n && remainingMinor > 0n && elapsedDays > 0
    ? Number((remainingMinor * BigInt(elapsedDays) + savedMinor - 1n) / savedMinor)
    : null;

  return {
    disciplineScore: expectedMinor === 0n
      ? 100
      : Math.min(100, Number((savedMinor * 100n) / expectedMinor)),
    amountBehindMinor: (savedMinor >= expectedMinor ? 0n : expectedMinor - savedMinor).toString(),
    suggestedWeeklyMinor: suggestedWeeklyMinor.toString(),
    projectedCompletionAt: daysToCompletion === null
      ? null
      : new Date(today + daysToCompletion * DAY_IN_MS).toISOString(),
    hasStarted: today >= startDay,
  };
}
