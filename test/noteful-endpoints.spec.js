const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/noteful-app.js");
const { makeFoldersArray, makeMaliciousFolder } = require("./folders-fixtures");
const { makeNotesArray, makeMaliciousNote } = require("./notes-fixtures");

describe("Noteful endpoints", function () {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () =>
    db.raw("TRUNCATE notes, folders RESTART IDENTITY CASCADE")
  );

  afterEach("cleanup", () =>
    db.raw("TRUNCATE notes, folders RESTART IDENTITY CASCADE")
  );

  describe("Folders endpoints", () => {
    describe("GET /api/folders", () => {
      context(`Given no folders`, () => {
        it(`responds with 200 and an empty list`, () => {
          return supertest(app).get("/api/folders").expect(200, []);
        });
      });

      context(`Given there are folders in the database`, () => {
        const testFolders = makeFoldersArray();
        beforeEach("insert test folders", () => {
          return db.into("folders").insert(testFolders);
        });

        it("responds with 200 and all of the folders", () => {
          return supertest(app).get("/api/folders").expect(200, testFolders);
        });
      });

      context(`Given an XSS attack folder`, () => {
        const testFolders = makeFoldersArray();
        const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

        beforeEach("insert malicious folder", () => {
          return db.into("folders").insert([maliciousFolder]);
        });

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/folders`)
            .expect(200)
            .expect((res) => {
              expect(res.body[0].folder_name).to.eql(
                expectedFolder.folder_name
              );
            });
        });
      });
    });

    describe("POST /api/folders", () => {
      it(`creates a folder, responding with 201 and the new folder`, () => {
        const newFolder = {
          folder_name: "New Folder Name",
        };

        return supertest(app)
          .post("/api/folders")
          .send(newFolder)
          .expect(201)
          .expect((res) => {
            expect(res.body.folder_name).to.eql(newFolder.folder_name);
            expect(res.body).to.have.property("id");
            expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`);
          })
          .then((res) =>
            supertest(app).get(`/api/folders/${res.body.id}`).expect(res.body)
          );
      });

      it(`responds with 400 and an error message when the folder name is missing`, () => {
        const badFolder = { bad_request: "nothing" };

        return supertest(app)
          .post("/api/folders")
          .send(badFolder)
          .expect(400, {
            error: { message: `Missing folder name in request body` },
          });
      });
    });

    describe(`GET /api/folders/:folder_id`, () => {
      context(`Given no folders`, () => {
        it(`responds with 404`, () => {
          const folder_id = 123456;
          return supertest(app)
            .get(`/api/folders/${folder_id}`)
            .expect(404, { error: { message: `Folder doesn't exist` } });
        });
      });

      context(`Given there are folders in the database`, () => {
        const testFolders = makeFoldersArray();

        beforeEach("insert test folders", () => {
          return db.into("folders").insert(testFolders);
        });

        it("responds with 200 and the specified folder", () => {
          const folder_id = 2;
          const expectedFolder = testFolders[folder_id - 1];
          return supertest(app)
            .get(`/api/folders/${folder_id}`)
            .expect(200, expectedFolder);
        });
      });
    });

    describe(`PATCH /api/folders/:folder_id`, () => {
      context(`Given no folders in the database`, () => {
        it(`responds with 404`, () => {
          const folder_id = 123456;
          return supertest(app)
            .patch(`/api/folders/${folder_id}`)
            .expect(404, { error: { message: `Folder doesn't exist` } });
        });
      });

      context(`Given there are folders in the database`, () => {
        const testFolders = makeFoldersArray();
        beforeEach("insert folders", () => {
          return db.into("folders").insert(testFolders);
        });

        it("responds with 204 and updates the folder", () => {
          const idToUpdate = 1;
          const updateFolder = {
            folder_name: "Updated Folder Name",
          };
          const expectedFolder = JSON.stringify({
            ...testFolders[idToUpdate - 1],
            ...updateFolder,
          });
          return supertest(app)
            .patch(`/api/folders/${idToUpdate}`)
            .send(updateFolder)
            .expect(204)
            .then((res) =>
              supertest(app)
                .get(`/api/folders/${idToUpdate}`)
                .expect(expectedFolder)
            );
        });
      });
    });

    describe(`DELETE /api/folders/:folder_id`, () => {
      context(`Given no folders`, () => {
        it(`responds with 404`, () => {
          const folder_id = 123456;
          return supertest(app)
            .delete(`/api/folders/${folder_id}`)
            .expect(404, { error: { message: `Folder doesn't exist` } });
        });
      });

      context("Given there are folders in the database", () => {
        const testFolders = makeFoldersArray();

        beforeEach("insert folders", () => {
          return db.into("folders").insert(testFolders);
        });

        it("responds with 204 and removes the folder", () => {
          const idToRemove = 1;
          const expectedFolders = testFolders.filter(
            (folder) => folder.id !== idToRemove
          );
          return supertest(app)
            .delete(`/api/folders/${idToRemove}`)
            .expect(204)
            .then(() =>
              supertest(app).get(`/api/folders`).expect(expectedFolders)
            );
        });
      });
    });
  });

  describe("Notes endpoints", () => {
    describe("GET /api/notes", () => {
      context(`Given no notes`, () => {
        it(`responds with 200 and an empty list`, () => {
          return supertest(app).get("/api/notes").expect(200, []);
        });
      });

      context(`Given there are notes in the database`, () => {
        const testFolders = makeFoldersArray();
        const testNotes = makeNotesArray();
        beforeEach("insert test notes", () => {
          return db
            .into("folders")
            .insert(testFolders)
            .then(() => {
              return db.into("notes").insert(testNotes);
            });
        });

        it("responds with 200 and all of the folders", () => {
          return supertest(app).get("/api/notes").expect(200, testNotes);
        });
      });
    });

    describe("POST /api/notes", () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert test folders", () => {
        return db.into("folders").insert(testFolders);
      });

      it(`creates a note, responding with 201 and the new note`, () => {
        let newNote = {
          note_name: "New Note Name",
          folder: 1,
          date_created: "2019-01-06T00:00:00.000Z",
          content: "New Note Content here",
        };

        return supertest(app)
          .post("/api/notes")
          .send(newNote)
          .expect(201)
          .expect((res) => {
            expect(res.body.note_name).to.eql(newNote.note_name);
            expect(Number(res.body.folder)).to.eql(newNote.folder);
            expect(res.body.content).to.eql(newNote.content);
            expect(res.body.date_created).to.eql(newNote.date_created);
            expect(res.body).to.have.property("id");
            expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
          })
          .then((res) =>
            supertest(app).get(`/api/notes/${res.body.id}`).expect(res.body)
          );
      });

      const requiredFields = ["note_name", "folder", "content"];

      requiredFields.forEach((field) => {
        const newNote = {
          note_name: "Test new note",
          folder: 1,
          date_created: "2018-05-16T23:00:00.000Z",
          content: "Test new note content...",
        };

        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newNote[field];

          return supertest(app)
            .post("/api/notes")
            .send(newNote)
            .expect(400, {
              error: { message: `Missing ${field} in request body` },
            });
        });
      });
    });

    describe(`GET /api/notes/:note_id`, () => {
      context(`Given no notes`, () => {
        it(`responds with 404`, () => {
          const note_id = 123456;
          return supertest(app)
            .get(`/api/notes/${note_id}`)
            .expect(404, { error: { message: `Note doesn't exist` } });
        });
      });

      context(`Given there are notes in the database`, () => {
        const testFolders = makeFoldersArray();
        const testNotes = makeNotesArray();
        beforeEach("insert test notes", () => {
          return db
            .into("folders")
            .insert(testFolders)
            .then(() => {
              return db.into("notes").insert(testNotes);
            });
        });

        it("responds with 200 and the specified note", () => {
          const note_id = 2;
          const expectedNote = testNotes[note_id - 1];
          return supertest(app)
            .get(`/api/notes/${note_id}`)
            .expect(200, expectedNote);
        });
      });

      context(`Given an XSS attack note`, () => {
        // const testNotes = makeNotesArray();
        const testFolders = makeFoldersArray();
        const { maliciousNote, expectedNote } = makeMaliciousNote();

        beforeEach("insert malicious note", () => {
          return db
            .into("folders")
            .insert(testFolders)
            .then(() => {
              return db.into("notes").insert(maliciousNote);
            });
        });
        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/api/notes/${maliciousNote.id}`)
            .expect(200)
            .expect((res) => {
              expect(res.body.note_name).to.eql(expectedNote.note_name);
              expect(res.body.content).to.eql(expectedNote.content);
            });
        });
      });
    });

    describe(`PATCH /api/notes/:note_id`, () => {
      context(`Given no notes in the database`, () => {
        it(`responds with 404`, () => {
          const note_id = 123456;
          return supertest(app)
            .patch(`/api/notes/${note_id}`)
            .expect(404, { error: { message: `Note doesn't exist` } });
        });
      });

      context(`Given there are notes in the database`, () => {
        const testFolders = makeFoldersArray();
        const testNotes = makeNotesArray();
        beforeEach("insert test notes", () => {
          return db
            .into("folders")
            .insert(testFolders)
            .then(() => {
              return db.into("notes").insert(testNotes);
            });
        });

        it("responds with 204 and updates the note", () => {
          const idToUpdate = 1;
          const updateNote = {
            note_name: "Updated Note Name",
            folder: 1,
            content: "Updated note content",
          };
          const expectedNote = {
            ...testNotes[idToUpdate - 1],
            ...updateNote,
          };
          return supertest(app)
            .patch(`/api/notes/${idToUpdate}`)
            .send(updateNote)
            .expect(204)
            .then((res) =>
              supertest(app)
                .get(`/api/notes/${idToUpdate}`)
                .expect(expectedNote)
            );
        });
      });
    });

    describe(`DELETE /api/notes/:note_id`, () => {
      context(`Given no notes`, () => {
        it(`responds with 404`, () => {
          const note_id = 123456;
          return supertest(app)
            .delete(`/api/notes/${note_id}`)
            .expect(404, { error: { message: `Note doesn't exist` } });
        });
      });

      context("Given there are notes in the database", () => {
        const testFolders = makeFoldersArray();
        const testNotes = makeNotesArray();
        beforeEach("insert test notes", () => {
          return db
            .into("folders")
            .insert(testFolders)
            .then(() => {
              return db.into("notes").insert(testNotes);
            });
        });

        it("responds with 204 and removes the note", () => {
          const idToRemove = 1;
          const expectedNotes = testNotes.filter(
            (note) => note.id !== idToRemove
          );
          return supertest(app)
            .delete(`/api/notes/${idToRemove}`)
            .expect(204)
            .then(() => supertest(app).get(`/api/notes`).expect(expectedNotes));
        });
      });
    });
  });
});
