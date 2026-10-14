import React from "react";
import DatePicker from "./features/planner/DatePicker";
import TaskList from "./features/planner/TaskList";
import ErrorBanner from "./features/planner/ErrorBanner";

export default function App() {
  return (
    <main className="app">
      <h1>Daily Planner</h1>
      <ErrorBanner />
      <div className="layout">
        <aside>
          <DatePicker />
        </aside>
        <TaskList />
      </div>
    </main>
  );
}
