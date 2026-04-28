import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setWeeklyAvailability: (state, action) => {
      if (state.profile) {
        state.profile.weeklyAvailability = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    setBlackoutDates: (state, action) => {
      if (state.profile) {
        state.profile.blackoutDates = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    resetDoctor: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setProfile,
  setLoading,
  setError,
  clearError,
  setWeeklyAvailability,
  setBlackoutDates,
  resetDoctor,
} = doctorSlice.actions;

export default doctorSlice.reducer;
