const FoldersService = {
  getAllFolders(knex) {
    return knex.select("*").from("folders");
  },
  getFolderById(knex, id) {
    return knex.select("*").from("folders").where({ id }).first();
  },
  deleteFolder(knex, id) {
    return knex("folders").where({ id }).delete();
  },
  createFolder(knex, newFolder) {
    return knex.insert(newFolder).into("folders").returning("*");
  },
  updateFolder(knex, id, newFields) {
    return knex("folders").where({ id }).update(newFields);
  },
};
