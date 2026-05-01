import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import { joinWaitlist } from "../controllers/waitlist.controller.js";
const router = express.Router();

router.post("/join", authMiddleware, authorizeRole("Patient"), joinWaitlist);

export default router;
