import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import { bookAppointment } from "../controllers/appointment.controller.js";

const router = express.Router();

router.post("/book", authMiddleware, authorizeRole("Patient"), bookAppointment);

export default router;
