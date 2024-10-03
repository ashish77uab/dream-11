import mongoose from "mongoose";
import UserTeam from "../models/UserTeam.js";
export const getUserMatchTeam = async (req, res) => {
  try {
    const { matchId, userId } = req.params;

    const userTeams = await UserTeam.aggregate([
      {
        $match: {
          match: mongoose.Types.ObjectId(matchId),
          user: mongoose.Types.ObjectId(userId),
        }
      },
      {
        $lookup: {
          from: "players", // Collection to join (Player)
          localField: "players", // Field from UserTeam schema
          foreignField: "_id", // Field from Player schema
          as: "players", // Alias for the populated players array
        }
      },
    ]);
    res.status(200).json(userTeams);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createUserTeam = async (req, res) => {
  try {
    let team = new UserTeam({
      ...req?.body
    });
    team = await team.save();
    if (!team)
      return res.status(400).json({ message: "the team cannot be created!" });
    res.status(201).json(team);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const updateUserTeam = async (req, res) => {
  try {
    const userTeam = await UserTeam.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body
      },
      { new: true }
    );

    if (!userTeam)
      return res.status(400).json({ message: "the team cannot be updated!" });
    res.status(201).json(userTeam);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const deleteUserTeam = async (req, res) => {
  try {
    const userTeam = await UserTeam.findById(req.params.id);
    if (userTeam) {
        UserTeam.findByIdAndRemove(req.params.id)
          .then((userTeam) => {
            if (userTeam) {
              return res
                .status(200)
                .json({ success: true, message: "The team is deleted!" });
            } else {
              return res
                .status(404)
                .json({ success: false, message: "team not found!" });
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
