import { createSlice } from "@reduxjs/toolkit";
import { plannerReducers } from "./plannerReducers";
import { todayKey } from "../../utils/dates";

/*
 * State shape:
 * {
 *   tasksByDay: { "2026-10-12": [{ id, title, time: "09:30" | "", done }] },
 *   selectedDate: "YYYY-MM-DD",
 *   error: string | null
 * }
 */
export const createInitialState = (selectedDate = todayKey()) => ({
  tasksByDay: {},
  selectedDate,
  error: null,
});

const plannerSlice = createSlice({
  name: "planner",
  initialState: createInitialState(),
  reducers: plannerReducers,
});

export const { selectDate, addTask, editTask, deleteTask, toggleTask, dismissError } =
  plannerSlice.actions;

export default plannerSlice.reducer;
