import { createSlice } from "@reduxjs/toolkit";

type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
}

const saved = localStorage.getItem("theme") as ThemeMode | null;
const initial: ThemeState = {
  mode: saved || "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState: initial,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.mode);
      document.documentElement.classList.toggle("dark", state.mode === "dark");
    },
    setTheme(state, action) {
      state.mode = action.payload;
      localStorage.setItem("theme", state.mode);
      document.documentElement.classList.toggle("dark", state.mode === "dark");
    },
  },
});
export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;