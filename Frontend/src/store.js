import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./features/usersSlice";
import doctorReducer from "./features/doctorSlice";
import appointmentReducer from "./features/appointmentSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    doctor: doctorReducer,
    appointment: appointmentReducer,
  },
});
