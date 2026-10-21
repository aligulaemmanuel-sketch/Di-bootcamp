import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";
import type { Story, StoryVersion, CollaboratorRole } from "../types";

interface StoriesState {
  list: Story[];
  filter: "feed" | "mine" | "shared";
  current: Story | null;
  myRole: CollaboratorRole | null;
  versions: StoryVersion[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: StoriesState = {
  list: [],
  filter: "feed",
  current: null,
  myRole: null,
  versions: [],
  status: "idle",
  error: null,
};

const err = (e: any) => e.response?.data?.error ?? e.response?.data?.errors?.[0] ?? "Request failed";

export const fetchStories = createAsyncThunk("stories/fetch", async (filter: "feed" | "mine" | "shared", { rejectWithValue }) => {
  try {
    const { data } = await api.get("/stories", { params: { filter } });
    return { filter, stories: data.stories };
  } catch (e: any) { return rejectWithValue(err(e)); }
});

export const fetchStory = createAsyncThunk("stories/fetchOne", async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/stories/${id}`);
    return data;
  } catch (e: any) { return rejectWithValue(err(e)); }
});

export const createStory = createAsyncThunk("stories/create", async (form: { title: string; genre: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/stories", form);
    return data.story;
  } catch (e: any) { return rejectWithValue(err(e)); }
});

export const deleteStory = createAsyncThunk("stories/delete", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/stories/${id}`);
    return id;
  } catch (e: any) { return rejectWithValue(err(e)); }
});

export const addCollaborator = createAsyncThunk(
  "stories/addCollaborator",
  async ({ id, username, role }: { id: string; username: string; role: CollaboratorRole }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/stories/${id}/collaborators`, { username, role });
      return data.story;
    } catch (e: any) { return rejectWithValue(err(e)); }
  }
);

export const fetchVersions = createAsyncThunk("stories/fetchVersions", async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/stories/${id}/versions`);
    return data.versions;
  } catch (e: any) { return rejectWithValue(err(e)); }
});

export const saveVersion = createAsyncThunk(
  "stories/saveVersion",
  async ({ id, label }: { id: string; label?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/stories/${id}/versions`, { label });
      return data.version;
    } catch (e: any) { return rejectWithValue(err(e)); }
  }
);

export const restoreVersion = createAsyncThunk("stories/restoreVersion", async (versionId: string, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/versions/${versionId}/restore`);
    return data.story as Story;
  } catch (e: any) { return rejectWithValue(err(e)); }
});

const storiesSlice = createSlice({
  name: "stories",
  initialState,
  reducers: {
    setFilter(state, action) { state.filter = action.payload; },
    applyRemoteUpdate(state, action: { payload: { title: string; content: string } }) {
      if (state.current) {
        state.current.title = action.payload.title;
        state.current.content = action.payload.content;
      }
    },
    clearCurrent(state) { state.current = null; state.myRole = null; state.versions = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.list = action.payload.stories;
        state.filter = action.payload.filter;
      })
      .addCase(fetchStory.fulfilled, (state, action) => {
        state.current = action.payload.story;
        state.myRole = action.payload.role;
      })
      .addCase(createStory.fulfilled, (state, action) => { state.list.unshift(action.payload); })
      .addCase(deleteStory.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s.id !== action.payload);
      })
      .addCase(addCollaborator.fulfilled, (state, action) => { state.current = action.payload; })
      .addCase(fetchVersions.fulfilled, (state, action) => { state.versions = action.payload; })
      .addCase(saveVersion.fulfilled, (state, action) => { state.versions.unshift(action.payload); })
      .addCase(restoreVersion.fulfilled, (state, action) => { state.current = action.payload; });
  },
});

export const { setFilter, applyRemoteUpdate, clearCurrent } = storiesSlice.actions;
export default storiesSlice.reducer;
