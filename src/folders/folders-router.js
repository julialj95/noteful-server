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
    const { folder_name } = req.body;
    const newFolder = { folder_name };
    if (!newFolder.folder_name) {
      return res.status(400).json({
        error: { message: `Missing folder name in request body` },
      });
    }

    FoldersService.createFolder(req.app.get("db"), newFolder)
      .then((folder) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl) + `/${folder.id}`)
          .json({ id: folder.id, folder_name: xss(folder.folder_name) });
      })
      .catch(next);
  });

FoldersRouter.route("/:folder_id")
  .all((req, res, next) => {
    FoldersService.getFolderById(req.app.get("db"), req.params.folder_id)
      .then((folder) => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist` },
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      id: res.folder.id,
      folder_name: xss(res.folder.folder_name),
    });
  })
  .patch(jsonParser, (req, res, next) => {
    const { folder_id } = req.params;
    const { folder_name } = req.body;
    const newFolderName = { folder_name };

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
