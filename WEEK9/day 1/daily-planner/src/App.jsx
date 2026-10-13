import React from "react";
import DatePicker from "./components/DatePicker";
import TaskList from "./components/TaskList";
import ErrorBanner from "./components/ErrorBanner";

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
