function makeFoldersArray() {
  return [
    { id: 1, folder_name: "Test Folder 1" },
    { id: 2, folder_name: "Test Folder 2" },
    { id: 3, folder_name: "Test Folder 3" },
    { id: 4, folder_name: "Test Folder 4" },
  ];
}

function makeMaliciousFolder() {
  const maliciousFolder = {
    id: 911,
    folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
  };
  const expectedFolder = {
    ...maliciousFolder,
    folderName:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
  };
  return {
    maliciousFolder,
    expectedFolder,
  };
}

module.exports = { makeFoldersArray, makeMaliciousFolder };
