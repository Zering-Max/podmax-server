import express from "express";
import "dotenv/config";
import "express-async-errors";
import "./db";
const serverless = require("serverless-http");
import authRouter from "./routers/auth";
import audioRouter from "./routers/audio";
import favoriteRouter from "./routers/favorite";
import playlistRouter from "./routers/playlist";
import profileRouter from "./routers/profile";
import historyRouter from "./routers/history";
import "./utils/schedule";
import { errorHandler } from "./middleware/error";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));

app.use("/auth", authRouter);
app.use("/audio", audioRouter);
app.use("/favorite", favoriteRouter);
app.use("/playlist", playlistRouter);
app.use("/profile", profileRouter);
app.use("/history", historyRouter);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({
    alive: true,
  });
});

app.get("*", (req, res) => {
  res.status(404).json({
    error: "Not Found !",
  });
});

app.use('/.netlify/src/index', app)

const PORT = process.env.PORT || 8887;

app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});

module.exports.handler = serverless(app);
