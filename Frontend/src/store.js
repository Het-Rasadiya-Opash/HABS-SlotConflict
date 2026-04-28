import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./features/usersSlice";
import doctorReducer from "./features/doctorSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    doctor: doctorReducer,
  },
});
