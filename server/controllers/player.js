import mongoose from "mongoose";
import Player from "../models/Player.js";
import Team from "../models/Team.js";
export const createPlayer = async (req, res) => {
  try {
    const teamId = req?.body?.team
    let player = new Player({
      ...req?.body
    });
    player = await player.save();
   
    if (!player)
      return res.status(400).json({ message: "the player cannot be created!" });
    await Team.findByIdAndUpdate(
      teamId,
      {
        $push: { players: player?._id } // Push player ID into the players array
      },
      { new: true }
    );
    res.status(201).json(player);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const getPlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      res
        .status(500)
        .json({ message: "The player with the given ID was not found." });
    }
    res.status(200).json(player);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllPlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const playerList = await Player.aggregate([
      {
        $match: { team: mongoose.Types.ObjectId(id) } // Match team ID
      },
      {
        $lookup: {
          from: "teams", // The Team collection
          localField: "team", // Field from Player schema
          foreignField: "_id", // Field from Team schema
          as: "team" // Alias for the team details
        }
      },
      {
        $unwind: "$team" // Unwind the array of team details
      },
     
    ]);

    res.status(200).json(playerList);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const updatePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body
      },
      { new: true }
    );

    if (!player)
      return res.status(400).json({ message: "the player cannot be updated!" });
    res.status(201).json(player);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (player) {
        Player.findByIdAndRemove(req.params.id)
          .then((player) => {
            if (player) {
              return res
                .status(200)
                .json({ success: true, message: "The player is deleted!" });
            } else {
              return res
                .status(404)
                .json({ success: false, message: "player not found!" });
            }
          })
          .catch((err) => {
            return res.status(500).json({ success: false, error: err });
          });
     
    } else {
      res
        .status(500)
        .json({ message: "Not found any team" });

    }

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });

  }
};
