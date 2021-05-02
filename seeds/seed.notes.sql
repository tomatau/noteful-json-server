BEGIN;

INSERT INTO
    folders (name)
VALUES
    ('Seed Folder Uno');

INSERT INTO
    notes (name, folderid, content)
VALUES
    ('Seed Note One', 1, 'Lorem ipsum duis autem'),
    ('Seed Note Two', 1, 'Duis autem forse');

COMMIT;

-- then in terminal...
-- psql noteful
-- \i ~/path/to/file/seed.notes.sql