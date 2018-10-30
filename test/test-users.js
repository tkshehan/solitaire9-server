const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');

const {app, runServer, closeServer} = require('../server');
const {User} = require('../users');
const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

function generateTestUser() {
  return {
    username: faker.internet.userName,
    password: faker.internet.password,
    firstName: faker.name.firstName,
    lastName: faker.name.lastName,
  };
}

describe('/api/user', function() {
  const testUserA = generateTestUser();
  const testUserB = generateTestUser();

  this.beforeAll(function() {
    return runServer(TEST_DATABASE_URL);
  });

  this.afterAll(function() {
    return closeServer();
  });

  this.afterEach(function() {
    return User.deleteMany({});
  });

  describe('POST', function() {
    it('Should reject users with missing username', function() {
      return chai
          .request(app)
          .post('/api/users')
          .send({
            password: testUserA.password,
            firstName: testUserA.firstName,
            lastName: testUserA.lastName,
          })
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch((err) => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('username');
          });
    });
  });
});
