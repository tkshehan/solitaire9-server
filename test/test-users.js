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
    username: faker.internet.userName(),
    password: faker.internet.password(10),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
  };
}

describe('/api/user', function() {
  const testUser = generateTestUser();

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
            password: testUser.password,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
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

    it('Should reject users with missing password', function() {
      return chai
          .request(app)
          .post('/api/users')
          .send({
            username: testUser.username,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
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
            expect(res.body.location).to.equal('password');
          });
    });
    it('Should reject users with non-string username', function() {
      return chai
          .request(app)
          .post('/api/users')
          .send({
            username: 1234,
            password: testUser.password,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
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
            expect(res.body.message).to.equal(
                'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('username');
          });
    });
    it('Should reject users with non-string password', function() {
      return chai
          .request(app)
          .post('/api/users')
          .send({
            username: testUser.username,
            password: 1234,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
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
            expect(res.body.message).to.equal(
                'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('password');
          });
    });
    it('Should reject users with non-string first name', function() {
      return chai
          .request(app)
          .post('/api/users')
          .send({
            username: testUser.username,
            password: testUser.password,
            firstName: 1234,
            lastName: testUser.lastName,
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
            expect(res.body.message).to.equal(
                'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('firstName');
          });
    });
    it('Should reject users with non-string last name', function() {
      return chai
          .request(app)
          .post('/api/users')
          .send({
            username: testUser.username,
            password: testUser.password,
            firstName: testUser.firstName,
            lastName: 1234,
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
            expect(res.body.message).to.equal(
                'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('lastName');
          });
    });
    it('Should reject users with non-trimmed username', function() {
      return chai
          .request(app)
          .post('/api/users')
          .send({
            username: ` ${testUser.username} `,
            password: testUser.password,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
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
            expect(res.body.message).to.equal(
                'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('username');
          });
    });
    it('Should reject users with non-trimmed password', function() {
      return chai
          .request(app)
          .post('/api/users')
          .send(Object.assign({}, testUser, {
            password: ` ${testUser.password} `,
          }))
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
            expect(res.body.message).to.equal(
                'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('password');
          });
    });
    it('Should reject users with empty username', function() {
      return chai
          .request(app)
          .post('/api/users')
          .send({
            username: '',
            password: testUser.password,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
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
            expect(res.body.message).to.equal(
                'Must be at least 1 characters long'
            );
            expect(res.body.location).to.equal('username');
          });
    });
    it('Should reject users with password less than 8 characters',
        function() {
          return chai
              .request(app)
              .post('/api/users')
              .send(Object.assign({}, testUser, {
                password: '1234567',
              }))
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
                expect(res.body.message).to.equal(
                    'Must be at least 8 characters long'
                );
                expect(res.body.location).to.equal('password');
              });
        });
    it('Should reject users with password greater than 72 characters',
        function() {
          return chai
              .request(app)
              .post('/api/users')
              .send({
                username: testUser.username,
                password: new Array(73).fill('a').join(''),
                firstName: testUser.username,
                lastName: testUser.lastName,
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
                expect(res.body.message).to.equal(
                    'Must be at most 72 characters long'
                );
                expect(res.body.location).to.equal('password');
              });
        });
    it('Should reject users with duplicate username', function() {
      // Create an initial user
      return User.create(testUser)
          .then(() =>
          // Try to create a second user with the same username
            chai.request(app).post('/api/users')
                .send(testUser)
          )
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
            expect(res.body.message).to.equal(
                'Username already taken'
            );
            expect(res.body.location).to.equal('username');
          });
    });
    it('Should create a new user', function() {
      return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then((res) => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
                'username',
                'firstName',
                'lastName'
            );
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.firstName).to.equal(testUser.firstName);
            expect(res.body.lastName).to.equal(testUser.lastName);
            return User.findOne({
              username: testUser.username,
            });
          })
          .then((user) => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(testUser.firstName);
            expect(user.lastName).to.equal(testUser.lastName);
            return user.validatePassword(testUser.password);
          })
          .then((passwordIsCorrect) => {
            expect(passwordIsCorrect).to.be.true;
          });
    });

    it('Should trim firstName and lastName', function() {
      return chai
          .request(app)
          .post('/api/users')
          .send({
            username: testUser.username,
            password: testUser.password,
            firstName: ` ${testUser.firstName} `,
            lastName: ` ${testUser.lastName} `,
          })
          .then((res) => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
                'username',
                'firstName',
                'lastName'
            );
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.firstName).to.equal(testUser.firstName);
            expect(res.body.lastName).to.equal(testUser.lastName);
            return User.findOne({
              username: testUser.username,
            });
          })
          .then((user) => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(testUser.firstName);
            expect(user.lastName).to.equal(testUser.lastName);
          });
    });
  });
});

module.exports = {generateTestUser};
