const express = require("express");
const xss = require("xss");
const path = require("path");
const NotesService = require("./notes-service");
const NotesRouter = express.Router();
const jsonParser = express.json();

serializeNote = (newNote) => ({
  id: newNote.id,
  note_name: xss(newNote.note_name),
  date_created: newNote.date_created,
  folder: xss(newNote.folder),
  content: xss(newNote.content),
});

NotesRouter.route("/")
  .get((req, res, next) => {
    return NotesService.getAllNotes(req.app.get("db"))
      .then((notes) => {
        res.json(notes);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { note_name, date_created, folder, content } = req.body;
    const newNote = { note_name, date_created, folder, content };

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    NotesService.createNote(req.app.get("db"), newNote)
      .then((note) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${note.id}`))
          .json(serializeNote(newNote));
      })
      .catch(next);
  });

NotesRouter.route("/:id")
  .get((req, res, next) => {
    const { id } = req.params;

    NotesService.getNoteById(req.app.get("db"), id)
      .then((note) => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` },
          });
        }
        res.json({
          id: note.id,
          note_name: note.note_name,
          date_created: note.date_created,
          folder: note.folder,
          content: note.content,
        });
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { id } = req.params;
    const { note_name, date_created, folder, content } = req.body;
    const noteToUpdate = { note_name, date_created, folder, content };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'note_name', 'folder' or 'content'`,
        },
      });

    NotesService.updateNote(req.app.get("db"), id, noteToUpdate)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const { id } = req.params;
    NotesService.deleteNote(req.app.get("db"), id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });
module.exports = NotesRouter;
