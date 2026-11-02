import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateGoalDiscipline } from "./savings-goals";

describe("calculateGoalDiscipline", () => {
  const start = new Date("2026-01-01T00:00:00.000Z");
  const deadline = new Date("2026-01-10T00:00:00.000Z");

  it("measures pace against the elapsed share of a target", () => {
    const result = calculateGoalDiscipline(
      10_000n,
      2_500n,
      start,
      deadline,
      new Date("2026-01-03T12:00:00.000Z"),
    );

    assert.equal(result.disciplineScore, 83);
    assert.equal(result.amountBehindMinor, "500");
    assert.equal(result.suggestedWeeklyMinor, "7500");
    assert.equal(result.projectedCompletionAt, "2026-01-12T00:00:00.000Z");
    assert.equal(result.hasStarted, true);
  });

  it("reports a shortfall and weekly catch-up amount when savings lag", () => {
    const result = calculateGoalDiscipline(
      10_000n,
      500n,
      start,
      deadline,
      new Date("2026-01-05T00:00:00.000Z"),
    );

    assert.equal(result.disciplineScore, 10);
    assert.equal(result.amountBehindMinor, "4500");
    assert.equal(result.suggestedWeeklyMinor, "13300");
    assert.equal(result.projectedCompletionAt, "2026-04-10T00:00:00.000Z");
  });

  it("does not project completion when no contributions are allocated", () => {
    const result = calculateGoalDiscipline(10_000n, 0n, start, deadline, start);

    assert.equal(result.disciplineScore, 0);
    assert.equal(result.projectedCompletionAt, null);
  });

  it("treats future goals as not started and caps completed goals at 100", () => {
    const future = calculateGoalDiscipline(
      10_000n,
      0n,
      new Date("2026-01-11T00:00:00.000Z"),
      new Date("2026-01-20T00:00:00.000Z"),
      new Date("2026-01-10T00:00:00.000Z"),
    );
    const complete = calculateGoalDiscipline(10_000n, 12_000n, start, deadline, deadline);

    assert.equal(future.hasStarted, false);
    assert.equal(future.disciplineScore, 100);
    assert.equal(complete.disciplineScore, 100);
    assert.equal(complete.amountBehindMinor, "0");
    assert.equal(complete.suggestedWeeklyMinor, "0");
  });
});
