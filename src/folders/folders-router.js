const express = require("express");
const xss = require("xss");
const path = require("path");
const FoldersService = require("./folders-service");
const NotesService = require("../notes/notes-service");
const FoldersRouter = express.Router();
const jsonParser = express.json();

FoldersRouter.route("/")
  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get("db"))
      .then((folders) => {
        if (!folders) {
          return res.status(400).send("No ");
        }
        res.json(folders);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const newFolderName = req.body.folder_name;
    const newFolder = { folder_name: newFolderName };
    console.log(newFolder);
    if (!newFolderName) {
      return res.status(400).json({
        error: { message: `Missing folder name in request body` },
      });
    }

    FoldersService.createFolder(req.app.get("db"), newFolder)
      .then((folder) => {
        console.log("folder name", folder.folder_name);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl) + `/${folder.id}`)
          .json({ folder_name: xss(folder.folder_name) });
      })
      .catch(next);
  });

FoldersRouter.route("/:folder_id")
  .get((req, res, next) => {
    const { folder_id } = req.params;

    FoldersService.getFolderById(req.app.get("db"), folder_id)
      .then((folder) => res.json(folder))
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { folder_id } = req.params;
    const newFolderName = req.body.folder_name;

    FoldersService.updateFolder(req.app.get("db"), folder_id, newFolderName)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const { folder_id } = req.params;
    FoldersService.deleteFolder(req.app.get("db"), folder_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = FoldersRouter;