import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getMe,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
const router = express.Router();

router.get("/", authMiddleware, getMe);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

export default router;
