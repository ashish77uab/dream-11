import {
  createMatch,
  deleteMatch,
  getAllMatchOfTournament,
  getMatch,
  updateMatch,
  getTopMatches
} from "../controllers/match.js";
import express from "express";
const router = express.Router();

router.get(`/all/:id`, getAllMatchOfTournament);
router.get(`/top`, getTopMatches);
router.post("/add", createMatch);
router.get("/:id", getMatch);
router.put("/:id", updateMatch);
router.delete("/:id", deleteMatch);
export default router;
