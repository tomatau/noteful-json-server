const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures');
const supertest = require('supertest');
const { expect } = require('chai');

describe(`Folders Endpoints`, () => {

    let db;
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    });
    after('disconnect from db', () => db.destroy());

    // Due to tables related via foreign keys, 
    // it is no longer possible to TRUNCATE just a single table
    // before('clean the table', () => db('folders').truncate());
    // afterEach('cleanup', () => db('folders').truncate());

    // Soooo, need to truncate all the tables at the same time
    // plus need to reset RESTART the sequence generatator to generate a primary key
    before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));
    afterEach('cleanup', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));
    // then in every beforeEach hook that is used to load data, 
    // ensure that folders (with no foreign key) is loaded first

    describe('GET /folders', () => {

        context(`Given no folders`, () => {
            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/folders')
                    .expect(200, [])
            });
        });

        context(`Given there are folders in the database`, () => {
            const testFolders = makeFoldersArray();

            beforeEach('insert folders into db', () => {
                return db  
                    .into('folders')
                    .insert(testFolders)
            })

            it(`responds with 200 and all of the folders`, () => {
                return supertest(app)
                    .get('/folders')
                    .expect(200, testFolders)
            });
        });

        context(`Given a cross-site scripting (XSS) attack folder`, () => {
            const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

            beforeEach('insert malicious folder into db', () => {
                return db  
                    .into('folders')
                    .insert(maliciousFolder)
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get('/folders')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedFolder.name)
                    })
            });
        });
    });

    describe('GET /folders/:folderid', () => {

        context(`Given no folders`, () => {
            it(`responds with 404`, () => {
                return supertest(app)
                    .get(`/folders/12312`)
                    .expect(404, { error: { message: `Folder doesn't exist`} })
            });
        });

        context(`Given there are folders in the database`, () => {
            const testFolders = makeFoldersArray();

            beforeEach(`insert folders`, () => {
                return db
                    .into('folders')
                    .insert(testFolders)
            });

            it(`responds with 200 and the specified folder`, () => {
                const folderId = 2;
                const expectedFolder = testFolders[folderId - 1];
                return supertest(app)
                    .get(`/folders/${folderId}`)
                    .expect(200, expectedFolder)
            });
        });

        context(`Given a cross-site scripting (XSS) attack folder`, () => {
            const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

            beforeEach(`insert malicious folder into db`, () => {
                return db
                    .into('folders')
                    .insert(maliciousFolder)
            });

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get('/folders')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedFolder.name)
                    })
            
            });
        });
    });

    describe('POST /folders', () => {

        it(`Creates a folder, responding with 201 and the new folder`, () => {

            const testFolder = { name: 'Test Folder Name'}

            return supertest(app)
                .post('/folders')
                .send(testFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(testFolder.name)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/folders/${res.body.id}`)
                })
                .then(postRes => {
                    return supertest(app)
                        .get(`/folders/${postRes.body.id}`)
                        .expect(postRes.body)
                })
        });

        it(`Removes cross-site scripting (XSS) attack from response`, () => {
            const { maliciousFolder, expectedFolder } = makeMaliciousFolder();
            return supertest(app)
                .post('/folders')
                .send(maliciousFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(expectedFolder.name)
                })
        });

        // DRY validation tests (overkill in this instance, but implementing for practice)
        const requiredFields = ['name'];

        requiredFields.forEach(field => {
            const newFolder = { name: 'Test Folder Name' };
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newFolder[field]
                return supertest(app)
                    .post('/folders')
                    .send(newFolder)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            });
        });

    });
});