import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import {
  createDoctorProfile,
  defineWeeklyAvailability,
  updateBlackoutDates,
} from "../controllers/doctorProfile.controller.js";
const router = express.Router();

router.post(
  "/weekly-availability",
  authMiddleware,
  authorizeRole("Doctor"),
  defineWeeklyAvailability,
);

router.post(
  "/blackout-dates",
  authMiddleware,
  authorizeRole("Doctor"),
  updateBlackoutDates,
);

router.post(
  "/create",
  authMiddleware,
  authorizeRole("Doctor"),
  createDoctorProfile,
);


export default router;
