import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import { appointmentPerDoctors } from "../controllers/clinicAdmin.controller.js";
const router = express.Router();

router.get("/", authMiddleware, authorizeRole("Clinic Admin"), appointmentPerDoctors);

export default router;
