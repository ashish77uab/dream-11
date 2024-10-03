import {
  createPlayer,
  deletePlayer,
  getAllPlayer,
  getPlayer,
  updatePlayer,
} from "../controllers/player.js";
import express from "express";
const router = express.Router();

router.get(`/all/:id`, getAllPlayer);
router.post("/add", createPlayer);
router.get("/:id", getPlayer);
router.put("/:id", updatePlayer);
router.delete("/:id", deletePlayer);
export default router;
