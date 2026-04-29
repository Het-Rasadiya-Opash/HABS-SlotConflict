import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import {
  bookAppointment,
  getAppointmentByPatient,
} from "../controllers/appointment.controller.js";

const router = express.Router();

router.get(
  "/patient",
  authMiddleware,
  authorizeRole("Patient"),
  getAppointmentByPatient,
);
router.post("/book", authMiddleware, authorizeRole("Patient"), bookAppointment);

export default router;
