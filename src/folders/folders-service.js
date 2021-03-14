const FoldersService = {
  getAllFolders(knex) {
    return knex.select("*").from("folders");
  },
  getFolderById(knex, id) {
    return knex.select("*").from("folders").where({ id }).first();
  },
  createFolder(knex, newFolderName) {
    return knex.insert(newFolderName).into("folders").returning("*");
  },
  updateFolder(knex, id, newFields) {
    return knex("folders").where({ id }).update(newFields);
  },
  deleteFolder(knex, id) {
    return knex("folders").where({ id }).delete();
  },
};

module.exports = FoldersService;
