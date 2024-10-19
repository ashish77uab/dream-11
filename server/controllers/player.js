import mongoose from "mongoose";
import Player from "../models/Player.js";
import Team from "../models/Team.js";
import PlayerStat from "../models/PlayerStat.js";
import Event from "../models/Event.js";
import PlayerStatHistory from "../models/PlayerStatHistory.js";
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
export const getPlayerScore = async (req, res) => {
  try {
    let score
     score = await PlayerStat.find({player:req.params.playerId});
    
    if (!score?.[0]) {
      score[0] = await PlayerStat.create({player:req.params.playerId});
    }
   

    res.status(200).json(score[0]);
  } catch (error) {
    console.log(error,'attt')
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
export const updtePlayerPlayingStatus = async (req, res) => {
  try {
    const playerIds = req.body.playerIds; // Array of player IDs

    // Find all players with the provided IDs
    const players = await Player.find({ _id: { $in: playerIds } });

    if (!players || players.length === 0) {
      return res.status(404).json({ message: "No players found with the given IDs" });
    }

    const updatedPlayers = await Promise.all(
      players.map(player =>
        Player.findByIdAndUpdate(
          player._id,
          { isPlaying: !player.isPlaying },  // Toggle the isPlaying status
          { new: true }  // Return the updated player document
        )
      )
    );

    // Return the updated player records
    res.status(200).json({ message: "Players updated successfully", updatedPlayers });
  } catch (error) {
    console.error("Error updating player status:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
export const updtePlayerScore = async (req, res) => {
  try {
    const updatedScore = await PlayerStat.findByIdAndUpdate(
      req.params.scoreId,
      {
        ...req.body
      },
      { new: true }
    );
    const tempData = { ...updatedScore.toObject() }; 
    delete tempData?._id
    await PlayerStatHistory.findOneAndUpdate({ player: updatedScore?.player }, tempData, {new: true})
    const events = await Event.aggregate([
      {
        $lookup: {
          from: "userteams", // Join userteams collection
          localField: "team", // Field from Event schema
          foreignField: "_id", // Field from UserTeam schema
          as: "team" // Alias for the output
        }
      },
      {
        $unwind: "$team" // Unwind the array to get a single team object
      },
      {
        $lookup: {
          from: "players", // Join players collection
          localField: "team.players", // Field from UserTeam schema (players array)
          foreignField: "_id", // Field from Player schema
          as: "team.playerDetails" // Alias for player details
        }
      },
      {
        $lookup: {
          from: "playerstathistories", // Join playerscores collection
          localField: "team.players", // Field from UserTeam schema (players array)
          foreignField: "player", // Field from PlayerScore schema
          as: "team.playerScores" // Alias for player scores
        }
      },
      {
        $addFields: {
          "team.players": {
            $map: {
              input: "$team.playerDetails", // Iterate over playerDetails array
              as: "playerDetail", // Alias for each player detail
              in: {
                $mergeObjects: [
                  "$$playerDetail", // Player details object
                  {
                    // Find the matching player score by player ID
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$team.playerScores", // Array of player scores
                          as: "playerScore", // Alias for each player score
                          cond: { $eq: ["$$playerScore.player", "$$playerDetail._id"] } // Match by player ID
                        }
                      },
                      0 // Return the first matched player score
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      // Add the total points for each player
      {
        $addFields: {
          "team.players": {
            $map: {
              input: "$team.players",
              as: "player",
              in: {
                $mergeObjects: [
                  "$$player",
                  {
                    totalPoints: {
                      $add: [
                        { $multiply: ["$$player.run", 1] }, // Points for runs
                        { $multiply: ["$$player.wicket", 20] }, // Points for wickets
                        { $multiply: ["$$player.catch", 8] }, // Points for catches
                        { $multiply: ["$$player.stumping", 10] }, // Points for stumpings
                        { $multiply: ["$$player.runOut", 6] } // Points for run-outs
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      // Apply captain and vice-captain bonuses
      {
        $addFields: {
          "team.players": {
            $map: {
              input: "$team.players",
              as: "player",
              in: {
                $mergeObjects: [
                  "$$player",
                  {
                    totalPoints: {
                      $cond: {
                        if: { $eq: [{ $toString: "$$player.player" }, { $toString: "$team.captain" }] }, // Check if the player is the captain
                        then: { $multiply: ["$$player.totalPoints", 2] }, // Double the points for captain
                        else: {
                          $cond: {
                            if: { $eq: [{ $toString: "$$player.player" }, { $toString: "$team.viceCaptain" }] }, // Check if the player is the vice-captain
                            then: { $multiply: ["$$player.totalPoints", 1.5] }, // 1.5x points for vice-captain
                            else: "$$player.totalPoints" // Regular points for other players
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          "team.totalPoints": {
            $sum: "$team.players.totalPoints" // Sum of all player totalPoints
          }
        }
      },
      // Sort players by totalPoints in descending order
      {
        $sort: {
          "team.totalPoints": -1 // Sort by total points, descending
        }
      },
      {
        $project: {
          _id: 1,
          match: 1,
          user: 1,
          teamNumber: 1,
          "team._id": 1,
          "team.captain": 1,
          "team.viceCaptain": 1,
          "team.players": 1,
          "team.totalPoints": 1,
        }
      }
    ]);
    if (events?.length > 0) {
      let currentRank = 1;  // Track the current rank
      let previousPoints = null;  // Track the previous team's total points
      let rankSkip = 0; // For skipping ranks if teams have the same points

      events?.forEach(async (event, index) => {
        // Check if the current team's totalPoints are equal to the previous team's
        if (previousPoints === event?.team?.totalPoints) {
          rankSkip++;  // Increment rank skip because this team has the same points
        } else {
          // If points are different, update rank and reset rank skip
          currentRank += rankSkip; // Apply rank skip
          rankSkip = 1;  // Reset rank skip to 1 for the next team with the same points
        }

        // Update the previousPoints to the current team's totalPoints
        previousPoints = event?.team?.totalPoints;

        // Update the team with the correct rank and score
        await Event.findOneAndUpdate(
          { team: event?.team?._id },
          {
            teamRank: currentRank,  // Set the rank
            teamScore: event?.team?.totalPoints  // Set the team's total score
          }
        );
      });
    }

    if (!updatedScore)
      return res.status(400).json({ message: "the score cannot be updated!" });
    res.status(201).json(updatedScore);
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
