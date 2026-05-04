import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authRole.middleware.js";
import {
  joinWaitlist,
  getMyWaitlist,
  leaveWaitlist,
  getSlotQueue,
  processNextInQueue,
} from "../controllers/waitlist.controller.js";
const router = express.Router();

router.post("/join", authMiddleware, authorizeRole("Patient"), joinWaitlist);
router.get("/my", authMiddleware, authorizeRole("Patient"), getMyWaitlist);
router.get("/slot", authMiddleware, authorizeRole("Doctor"), getSlotQueue);
router.post("/process-next", processNextInQueue);
router.post(
  "/:waitlistId",
  authMiddleware,
  authorizeRole("Patient"),
  leaveWaitlist,
);

export default router;
