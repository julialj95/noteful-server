CREATE TABLE notes (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  note_name TEXT NOT NULL,
  date_created TIMESTAMPTZ DEFAULT now() NOT NULL,
  folder INTEGER REFERENCES folders(id) NOT NULL
);