const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');

describe('App', () => {
    it('GET / responds with 200', () => {
        return supertest(app)
            .get('/')
            .expect(200, 'Hello, world!')
    });
});