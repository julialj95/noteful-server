require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config.js");
const errorHandler = require("./error-handler");
const NotesRouter = require("./notes/notes-router");
const FoldersRouter = require("./folders/folders-router");
const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use("/api/folders", FoldersRouter);
app.use("/api/notes", NotesRouter);

app.use(errorHandler);

module.exports = app;
