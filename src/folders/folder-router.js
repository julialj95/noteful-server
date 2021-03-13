const express = require("express");
const xss = require("xss");
const path = require("path");
const FoldersService = require("./folders-service");
const FoldersRouter = express.Router();
const jsonParser = express.json();

FoldersRouter.route("/").get().post();

FoldersRouter.route("/folder_id").get().patch().delete();
