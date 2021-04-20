import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Tweet } from "./tweet.js";
import { error } from "./error.js";

dotenv.config();
const app = express();

// cors white list
let whiteList = [process.env.CORS_ORIGIN, process.env.LOCAL_CORS_ORIGIN];

app.use(
  cors({
    origin: whiteList,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// load api secret and port (very secret btw LULW)
const apiKey = process.env.SECRET || "verysecret";
const port = process.env.PORT || 3001;

// kdb connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// middleware for checking authorization
app.use("/api/1", (req, res, next) => {
  // let key = req.query["api-key"];

  let key = req.headers["authorization"];

  if (!key) return next(error(401, "unauthorized"));

  if (key !== apiKey) return next(error(401, "unauthorized"));

  req.key = key;
  next();
});

// get tweets
app.get("/api/1/tweet", async (req, res, next) => {
  const query = req.query || {};

  //   const page = parseInt(query.page, 10) || 0;
  const perPage = parseInt(query.per_page, 10) || 10;

  try {
    const tweets = await Tweet.find({}).limit(perPage).sort({ _id: -1 });
    res.json(tweets);
  } catch (err) {
    console.log(err);
    next(error(500, "internal server error"));
  }
});

// post tweets
app.post("/api/1/tweet", async (req, res, next) => {
  try {
    const tweet = new Tweet({ tweet_id: req.body.id, text: req.body.text });
    await tweet.save();
    res.send("success");
  } catch (err) {
    console.log(err);
    next(error(500, "internal server error"));
  }
});

// sink for handling error
// next() with error passed will end up here
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({ error: err.message });
});

// final error handling for any other requests
app.use((req, res) => {
  res.status(404);
  res.send({ error: "not found" });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
