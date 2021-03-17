const FoldersService = {
  getAllFolders(knex) {
    return knex.select("*").from("folders");
  },
  getFolderById(knex, id) {
    return knex.select("*").from("folders").where({ id }).first();
  },
  createFolder(knex, newFolder) {
    return knex("folders")
      .insert(newFolder)
      .returning("*")
      .then((rows) => rows[0]);
  },
  updateFolder(knex, id, newFields) {
    return knex.from("folders").where("id", id).update(newFields);
  },
  deleteFolder(knex, id) {
    return knex("folders").where({ id }).delete();
  },
};

module.exports = FoldersService;
