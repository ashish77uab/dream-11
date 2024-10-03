import {
  createUserTeam,
  deleteUserTeam,
  updateUserTeam,
  getUserMatchTeam,
} from "../controllers/userTeam.js";
import express from "express";
const router = express.Router();

router.post("/add", createUserTeam);
router.get("/:matchId/:userId", getUserMatchTeam);
router.put("/:id", updateUserTeam);
router.delete("/:id", deleteUserTeam);
export default router;
