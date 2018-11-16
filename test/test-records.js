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
    date: faker.date.past(),
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

  describe('GET /best/', function() {
    it('Should give highest scoring records from highest to lowest',
        function() {
          const seedData = [...Array(40)].map(() => generateTestRecord());

          return Record.insertMany(seedData)
              .then(() => {
                return chai.request(app)
                    .get('/api/records/best/');
              })
              .then(function(res) {
                const highScore = seedData.reduce((high, current) => {
                  if (high.score < current.score) return current;
                  return high;
                });
                expect(highScore.score).to.equal(res.body[0].score);
                for (let i = 0; i < res.body.length - 1; i++) {
                  expect(res.body[i].score)
                      .to.be.greaterThan(res.body[i + 1].score);
                }
              });
        });
  });

  describe('GET /times/', function() {
    it('Should give the fast scoring times from lowest to highest', function() {
      const seedData = [...Array(40)].map(() => generateTestRecord());

      return Record.insertMany(seedData)
          .then(() => {
            return chai.request(app)
                .get('/api/records/times/');
          })
          .then(function(res) {
            const fastest = seedData.reduce((fastest, current) => {
              if (fastest.time > current.time) return current;
              return fastest;
            });
            expect(res.body[0].time).to.equal(fastest.time);
            for (let i = 0; i < res.body.length - 1; i++) {
              expect(res.body[i].time)
                  .to.be.lessThan(res.body[i + 1].time);
            }
          });
    });
  });

  describe('GET /latest/', function() {
    it('Should give the most recent records', function() {
      const seedData = [...Array(40)].map(() => generateTestRecord());

      return Record.insertMany(seedData)
          .then(() => {
            return chai.request(app)
                .get('/api/records/latest/');
          })
          .then(function(res) {
            const recent = seedData.reduce((recent, current) => {
              if (Date.parse(recent.date) < Date.parse(current.date)) {
                return current;
              }
              return recent;
            });
            expect(res.body[0].date).to.equal(recent.date.toISOString());
            for (let i = 0; i < res.body.length - 1; i++) {
              expect(Date.parse(res.body[i].date))
                  .to.be.greaterThan(Date.parse(res.body[i + 1].date));
            }
          });
    });
  });

  describe('GET /profile/:username', function() {
    it('Should get recent records for the user', function() {
      const testUser = 'Schmitty';
      const seedData = [...Array(40)].map(() => {
        const record = generateTestRecord();
        record.username = testUser;
        return record;
      });
      return Record.insertMany(seedData)
          .then(() => {
            return chai.request(app)
                .get(`/api/records/profile/${testUser}`);
          })
          .then(function(res) {
            expect(res.body[0].username).to.equal(testUser);
            for (let i = 0; i < res.body.length - 1; i++) {
              expect(Date.parse(res.body[i].date))
                  .to.be.greaterThan(Date.parse(res.body[i + 1].date));
            }
          });
    });
  });
});
