import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import {
  bookAppointment,
  getAppointmentByDoctor,
  getAppointmentByPatient,
  cancelAppointment,
  rescheduleAppointment,
  doctorUpdateAppointmentStatus,
  AllAppointmentsOfDoctor,
} from "../controllers/appointment.controller.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizeRole("Doctor"),
  AllAppointmentsOfDoctor,
);

router.get(
  "/patient",
  authMiddleware,
  authorizeRole("Patient"),
  getAppointmentByPatient,
);

router.get(
  "/doctor",
  authMiddleware,
  authorizeRole("Doctor"),
  getAppointmentByDoctor,
);

router.post("/book", authMiddleware, authorizeRole("Patient"), bookAppointment);

router.put("/:id/cancel", authMiddleware, cancelAppointment);

router.post("/:id/reschedule", authMiddleware, rescheduleAppointment);

router.post(
  "/:id/status-update",
  authMiddleware,
  authorizeRole("Doctor"),
  doctorUpdateAppointmentStatus,
);

export default router;
