import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import { joinWaitlist, getMyWaitlist } from "../controllers/waitlist.controller.js";
const router = express.Router();

router.post("/join", authMiddleware, authorizeRole("Patient"), joinWaitlist);
router.get("/my", authMiddleware, authorizeRole("Patient"), getMyWaitlist);

export default router;
