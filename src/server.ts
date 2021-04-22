import "dotenv-safe/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { Tweet } from "./tweet";
import { error, MyError } from "./error";
import logger from "./logger";

const app = express();

app.use(
  cors({
    origin: [process.env.CORS_ORIGIN, process.env.LOCAL_CORS_ORIGIN],
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// load api secret and port
const apiKey = process.env.SECRET || "aldsfuwaoijv";
const port = process.env.PORT || 3001;

// kdb connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// middleware for checking authorization
app.use("/api/1", (req: Request, _res: Response, next: NextFunction) => {
  let key = req.headers["authorization"];
  if (!key) return next(error(401, "unauthorized"));
  if (key !== apiKey) return next(error(401, "unauthorized"));
  next();
});

// get tweets
app.get(
  "/api/1/tweet",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const tweets = await Tweet.find({}).limit(20).sort({ _id: -1 });
      res.json(tweets);
    } catch (err) {
      logger.error(err);
      next(error(500, "internal server error"));
    }
  }
);

// post tweets
app.post(
  "/api/1/tweet",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tweet = new Tweet({ tweet_id: req.body.id, text: req.body.text });
      await tweet.save();
      res.send("success");
    } catch (err) {
      logger.error(err);
      next(error(500, "internal server error"));
    }
  }
);

// catch 404 errors
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(error(404, "not found"));
});

// sink for handling error
// next() with error passed will end up here
app.use((err: MyError, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500);
  res.send({ error: err.msg });
});

app.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});
