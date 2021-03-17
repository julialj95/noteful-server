function makeNotesArray() {
  return [
    {
      id: 1,
      note_name: "Test Note 1",
      date_created: "2019-01-03T00:00:00.000Z",
      folder: 1,
      content: "Test Note Content 1.....",
    },
    {
      id: 2,
      note_name: "Test Note 2",
      date_created: "2019-01-04T00:00:00.000Z",
      folder: 2,
      content: "Test Note Content 2.....",
    },
    {
      id: 3,
      note_name: "Test Note 3",
      date_created: "2019-01-05T00:00:00.000Z",
      folder: 3,
      content: "Test Note Content 3.....",
    },
    {
      id: 4,
      note_name: "Test Note 4",
      date_created: "2019-01-06T00:00:00.000Z",
      folder: 4,
      content: "Test Note Content 4.....",
    },
  ];
}

function makeMaliciousNote() {
  const maliciousNote = {
    id: 911,
    note_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    folder: 1,
    date_created: "2019-01-03T00:00:00.000Z",
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  const expectedNote = {
    ...maliciousNote,
    note_name:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousNote,
    expectedNote,
  };
}

module.exports = { makeNotesArray, makeMaliciousNote };
