import test from "node:test";
import assert from "node:assert/strict";
import {
  toDateKey,
  parseDateKey,
  isValidDateKey,
  addDays,
  getMonthGrid,
  formatLongDate,
  todayKey,
} from "../src/utils/dates.js";
import { validateTask } from "../src/utils/validation.js";

test("toDateKey / parseDateKey round-trip using local time", () => {
  const d = new Date(2026, 9, 12); // Oct 12, 2026 local
  assert.equal(toDateKey(d), "2026-10-12");
  const parsed = parseDateKey("2026-10-12");
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 9);
  assert.equal(parsed.getDate(), 12);
});

test("isValidDateKey accepts real dates and rejects bad ones", () => {
  assert.equal(isValidDateKey("2024-02-29"), true); // leap day
  assert.equal(isValidDateKey("2026-02-29"), false);
  assert.equal(isValidDateKey("2026-04-31"), false);
  assert.equal(isValidDateKey("2026-1-5"), false);
  assert.equal(isValidDateKey("1800-01-01"), false);
  assert.equal(isValidDateKey(undefined), false);
  assert.equal(isValidDateKey(20261012), false);
  assert.equal(isValidDateKey(todayKey()), true);
});

test("addDays crosses month and year boundaries", () => {
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-01-01", -1), "2025-12-31");
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addDays("2026-10-12", 0), "2026-10-12");
  assert.equal(addDays("garbage", 1), "garbage");
});

test("getMonthGrid lays out October 2026 correctly", () => {
  // Oct 1, 2026 is a Thursday -> 4 leading blanks; 31 days -> 5 weeks.
  const weeks = getMonthGrid(2026, 9);
  assert.equal(weeks.length, 5);
  assert.ok(weeks.every((w) => w.length === 7));
  assert.deepEqual(weeks[0].slice(0, 5), [null, null, null, null, "2026-10-01"]);
  const days = weeks.flat().filter(Boolean);
  assert.equal(days.length, 31);
  assert.equal(days[30], "2026-10-31");
});

test("getMonthGrid handles February in leap and non-leap years", () => {
  assert.equal(getMonthGrid(2024, 1).flat().filter(Boolean).length, 29);
  assert.equal(getMonthGrid(2026, 1).flat().filter(Boolean).length, 28);
});

test("formatLongDate", () => {
  assert.match(formatLongDate("2026-10-12"), /Monday/);
  assert.match(formatLongDate("2026-10-12"), /October 12, 2026/);
});

test("validateTask", () => {
  assert.deepEqual(validateTask({ title: "  hi  ", time: " 09:30 " }), {
    ok: true,
    value: { title: "hi", time: "09:30" },
  });
  assert.deepEqual(validateTask({ title: "hi" }).value, { title: "hi", time: "" });
  assert.equal(validateTask({ title: "" }).ok, false);
  assert.equal(validateTask({}).ok, false);
  assert.equal(validateTask().ok, false);
  assert.equal(validateTask({ title: 5 }).ok, false);
  assert.equal(validateTask({ title: "x".repeat(100) }).ok, true);
  assert.equal(validateTask({ title: "x".repeat(101) }).ok, false);
  assert.equal(validateTask({ title: "a", time: "24:00" }).ok, false);
  assert.equal(validateTask({ title: "a", time: "12:60" }).ok, false);
  assert.equal(validateTask({ title: "a", time: "23:59" }).ok, true);
});
