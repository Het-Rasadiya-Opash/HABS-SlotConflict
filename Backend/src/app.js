import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/error.middleware.js";
export const app = express();
import userRouters from "./routes/user.route.js";
import doctorProfileRouter from "./routes/doctorProfile.route.js";
import appointmentRouter from "./routes/appointment.route.js";
import clinicAdminRouter from "./routes/clinicAdmin.route.js";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

//routes
app.use("/api/users", userRouters);
app.use("/api/doctor", doctorProfileRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/clinic-admin", clinicAdminRouter);

//error handler
app.use(errorHandler);
