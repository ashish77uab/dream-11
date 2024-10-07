import mongoose from "mongoose";
import UserTeam from "../models/UserTeam.js";
import Event from "../models/Event.js";
import Match from "../models/Match.js";
import Wallet from "../models/Wallet.js";
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
export const joinEvent = async (req, res) => {
  try {
    const user = req.user;
    const eventData = { ...req.body }
    const entryFees = Number(eventData.entryFees)
    const walletData = await Wallet.find({ user: user?.id })
    const wallet = walletData[0]
    if (wallet?.amount < entryFees) {
      return res.status(400).json({ message: "Insufficient amount in wallet!" });
    }
    const updatedwallet = await Wallet.findByIdAndUpdate(wallet?._id, { $inc: { amount: -entryFees } })
    delete eventData.entryFees
    const oldEvent = await Event.find({
      match: req.body?.match,
      team: req.body?.team,
      user: user?.id,
    
    })
    if (oldEvent[0]){
      return res.status(400).json({ message: "Already joined with team!" });
    }
    let event = new Event({
      ...eventData
    });
    event = await event.save();
    if (!event)
      return res.status(400).json({ message: "the team cannot be joined!" });
    const updatedMatch = await Match.findByIdAndUpdate(
      req.body.match,
      {
        $push: { joinedTeams: event?._id }
      },
      { new: true }
    );
    res.status(201).json(updatedMatch);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const getEvents = async (req, res) => {
  try {
    const matchId = req.params?.matchId;
    console.log(matchId, 'matchId')
    const events = await Event.aggregate([
      {
        $match: { match: mongoose.Types.ObjectId(matchId) } // Match by ID
      },
      {
        $lookup: {
          from: "users", // Collection to join (Team)
          localField: "user", // Field from Match schema
          foreignField: "_id", // Field from Team schema
          as: "user" // Alias for the output (home team details)
        }
      },
      {
        $unwind: "$user" // Unwind the array to get a single home team object
      },
      {
        $lookup: {
          from: "userteams", // Collection to join (Team)
          localField: "team", // Field from Match schema
          foreignField: "_id", // Field from Team schema
          as: "team" // Alias for the output (away team details)
        }
      },

      {
        $unwind: "$team" // Unwind the array to get a single away team object
      },
    ]);

    res.status(200).json(events); // Return the first and only match
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
