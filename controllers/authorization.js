const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userSchema = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');

// const {
//   HTTP_STATUS_OK,
// } = require('../utils/constants');

module.exports.createUser = (request, response, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = request.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      userSchema
        .create({
          name,
          about,
          avatar,
          email,
          password: hash,
        })
        .then(() => response.status(201)
          .send(
            {
              data: {
                name,
                about,
                avatar,
                email,
              },
            },
          ))
        .catch((err) => {
          if (err.code === 11000) {
            return next(new ConflictError('User with email has registered'));
          }
          if (err.name === 'ValidationError') {
            return next(new BadRequestError('Invalid data'));
          }
          return next(err);
        });
    })
    .catch(next);
};

module.exports.login = (request, response, next) => {
  const {
    email,
    password,
  } = request.body;

  return userSchema
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'cat', {
        expiresIn: '3d',
      });
      response.send({ token });
    })
    .catch(next);
};
