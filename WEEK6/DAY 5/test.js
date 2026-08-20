const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('./DAILY CHALLENGE.JS');

describe('Emoji Guessing Game API', () => {
    it('should return a new question with emoji and options', async () => {
        const response = await request(app)
            .get('/api/new-question')
            .expect(200);

        expect(response.body).to.have.property('emoji');
        expect(response.body).to.have.property('options');
        expect(response.body.options).to.be.an('array').with.lengthOf(4);
    });

    it('should accept a guess and return result', async () => {
        // First get a question
        const questionResponse = await request(app)
            .get('/api/new-question')
            .expect(200);

        const { emoji, options } = questionResponse.body;
        const guess = options[0]; // Guess the first option

        const guessResponse = await request(app)
            .post('/api/guess')
            .send({ guess })
            .expect(200);

        expect(guessResponse.body).to.have.property('correct');
        expect(guessResponse.body).to.have.property('correctName');
        expect(guessResponse.body).to.have.property('currentScore');
    });

    it('should return leaderboard', async () => {
        const response = await request(app)
            .get('/api/leaderboard')
            .expect(200);

        expect(response.body).to.be.an('array');
    });
});