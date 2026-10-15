import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { selectDate } from "../redux/actions";
import {
  addDays,
  formatMonthLabel,
  getMonthGrid,
  parseDateKey,
  todayKey,
} from "../utils/dates";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function DatePicker({ selectedDate, tasksByDay, selectDate }) {
  // The month being shown can differ from the selected day while browsing months.
  const [view, setView] = useState(() => {
    const d = parseDateKey(selectedDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Jump the calendar to the selected day's month when it changes (e.g. via the arrows).
  useEffect(() => {
    const d = parseDateKey(selectedDate);
    if (d) setView({ year: d.getFullYear(), month: d.getMonth() });
  }, [selectedDate]);

  const shiftMonth = (delta) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const today = todayKey();
  const weeks = getMonthGrid(view.year, view.month);

  return (
    <div className="date-picker">
      <div className="day-nav">
        <button onClick={() => selectDate(addDays(selectedDate, -1))} aria-label="Previous day">
          ‹ Day
        </button>
        <button className="today-btn" onClick={() => selectDate(today)}>
          Today
        </button>
        <button onClick={() => selectDate(addDays(selectedDate, 1))} aria-label="Next day">
          Day ›
        </button>
      </div>

      <div className="month-nav">
        <button onClick={() => shiftMonth(-1)} aria-label="Previous month">
          ‹
        </button>
        <strong>{formatMonthLabel(view.year, view.month)}</strong>
        <button onClick={() => shiftMonth(1)} aria-label="Next month">
          ›
        </button>
      </div>

      <table className="calendar">
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((key, j) => (
                <td key={j}>
                  {key && (
                    <button
                      className={[
                        "day",
                        key === selectedDate ? "selected" : "",
                        key === today ? "today" : "",
                        tasksByDay[key] ? "has-tasks" : "",
                      ].join(" ")}
                      onClick={() => selectDate(key)}
                      aria-label={key}
                      aria-pressed={key === selectedDate}
                    >
                      {Number(key.slice(8))}
                    </button>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const mapStateToProps = (state) => ({
  selectedDate: state.selectedDate,
  tasksByDay: state.tasksByDay,
});

const mapDispatchToProps = { selectDate };

export default connect(mapStateToProps, mapDispatchToProps)(DatePicker);
