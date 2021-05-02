require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')

const foldersRouter = require('./folders/folders.router');
const notesRouter = require('./notes/notes.router')
const errorHandler = require('./error-handler')

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'dev';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use('/folders', foldersRouter);
app.use('/notes', notesRouter);

app.get('/', (req, res) => {
    res.send('Hello, world!');
})

app.use(errorHandler)

module.exports = app;