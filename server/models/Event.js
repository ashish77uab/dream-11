import mongoose from "mongoose";
const eventSchema = mongoose.Schema(
  {
    match:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    user:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserTeam",
      required: true,
    },
    teamNumber:{
      type: Number,
       default:1,
      required: true,
    },
   
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
