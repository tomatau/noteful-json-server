require('dotenv').config();
const path = require('path')
const express = require('express');
const xss = require('xss'); // for sanitisation purposes
const NotesService = require('./notes.service');

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderId: note.folderid,   
    content: xss(note.content)
});

notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, folderId, content } = req.body;
        const newNote = { 
            name, 
            folderid: folderId, 
            content 
        };

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note))
            })
            .catch(next)
    })


notesRouter
    .route('/:note_id')
    .all((req, res, next) => {

        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: `Note Not Found`}
                    })
                }
                res.note = note;
                next();
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.status(200).json(serializeNote(res.note))
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
                // NOTE: because there is no content/json response on promise success
                // be sure the client app has no .then(res => res.json())
                // otherwise, the app breaks with Uncaught (in promise) "SyntaxError: Unexpected end of JSON input"
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, folderId, content } = req.body;
        const newNote = { 
            name, 
            folderid: folderId, 
            content 
        };

        const numberOfValues = Object.values(newNote).filter(Boolean).length;
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    messsage: `Request body must contain either 'name', 'folderId', or 'content'`
                }
            })
        }

        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            newNote
        )
            .then(note => {
                res .status(204).end()
            })
            .catch(next)
    })


module.exports = notesRouter;