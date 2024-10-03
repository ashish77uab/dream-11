import mongoose from "mongoose";

const matchSchema = mongoose.Schema(
  {
    home: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    away: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    time: {
      type: Date,
      required: true,

    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    location: {
      type: String,
    },
    toss: {
      type: String,
      enum: ["Pending", "Home", "Away"],
      default: "Pending",
      required: true,
    },
    isTop: {
      type: Boolean,
      default: false,
    },
    winningAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    entryFees: {
      type: Number,
      default: 0,
      required: true,
    },
    winningPercentage: {
      type: Number,
      default: 0,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Live", "Completed"],
      default: "Pending",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);
