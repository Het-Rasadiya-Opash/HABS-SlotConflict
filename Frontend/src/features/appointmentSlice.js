import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedDoctor: null,
  selectedSlot: null,
  bookingResult: null,
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    setBookingContext: (state, action) => {
      state.selectedDoctor = action.payload.doctor;
      state.selectedSlot = action.payload.slot;
      state.bookingResult = null;
      state.error = null;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setBookingResult: (state, action) => {
      state.bookingResult = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },

    resetAppointment: (state) => {
      state.selectedDoctor = null;
      state.selectedSlot = null;
      state.bookingResult = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setBookingContext,
  setLoading,
  setBookingResult,
  setError,
  clearError,
  resetAppointment,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
