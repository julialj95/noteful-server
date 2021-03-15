const NotesService = {
  getAllNotes(knex) {
    return knex.select("*").from("notes");
  },

  getNoteById(knex, id) {
    return knex.select("*").from("notes").where("id", id).first();
  },

  createNote(knex, newNote) {
    return knex.insert(newNote).into("notes").returning("*");
  },

  deleteNote(knex, id) {
    return knex("notes").where({ id }).delete();
  },

  updateNote(knex, id, newNoteFields) {
    return knex.from("notes").where("id", id).update(newNoteFields);
  },
};

module.exports = NotesService;
