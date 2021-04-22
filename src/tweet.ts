import mongoose from "mongoose";
const { Schema } = mongoose;

const tweetSchema = new Schema(
  {
    tweet_id: String,
    text: String,
  },
  { timestamps: true }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
