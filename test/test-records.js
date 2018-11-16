/* eslint-disable no-unused-expressions */
/* eslint-disable no-invalid-this */
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const jwt = require('jsonwebtoken');

const {app, runServer, closeServer} = require('../server');
const {Record} = require('../records');
const {JWT_SECRET, TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;
chai.use(chaiHttp);

function generateTestRecord() {
  return {
    username: faker.internet.userName(),
    score: faker.random.number(),
    time: faker.random.number(),
    date: faker.date.recent(),
  };
}

describe('/api/records', function() {
  this.beforeAll(function() {
    return runServer(TEST_DATABASE_URL);
  });

  this.afterAll(function() {
    return closeServer();
  });

  this.afterEach(function() {
    return Record.deleteMany({});
  });

  describe('POST', function() {
    it('should add a new record', function() {
      const testRecord = generateTestRecord();
      const token = jwt.sign(
          {
            user: {
              username: testRecord.username,
            },
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            subject: testRecord.username,
            expiresIn: '7d',
          },
      );

      let count;
      return Record.countDocuments()
          .then(function(_count) {
            count = _count;
          })
          .then(function() {
            return chai.request(app)
                .post('/api/records')
                .set('authorization', `Bearer ${token}`)
                .set('content-type', 'application/json')
                .send(testRecord);
          })
          .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.an('Object');
            expect(res.body).to.include.key(
                ['username', 'score', 'time', 'date']
            );
            expect(res.body.username).to.equal(testRecord.username);
            expect(res.body.time).to.equal(testRecord.time);
            expect(res.body.score).to.equal(testRecord.score);
            console.log(res.body.id);
            return Record.findById(res.body.id);
          })
          .then(function(record) {
            expect(record.name).to.equal(testRecord.name);
            expect(record.score).to.equal(testRecord.score);

            return Record.countDocuments();
          })
          .then(function(_count) {
            expect(_count).to.equal(count + 1);
          });
    });
  });
});
