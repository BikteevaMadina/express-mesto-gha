const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userSchema = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const AuthorizedError = require('../errors/AuthorizedError');
const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_OK,
} = require('../utils/constants');

module.exports.getUsers = (request, response, next) => { // получаем всех пользователей
  userSchema.find({})
    .then((users) => response.send(users))
    .catch(next);
};

module.exports.getUserById = (request, response, next) => { // получаем пользователя по id
  const { userId } = request.params;

  userSchema.findById(userId)
    .orFail()
    .then((user) => response.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Incorrect id'));
      }

      if (err.name === 'DocumentNotFoundError') {
        return next(new NotFoundError('User by id not found'));
      }

      return next(err);
    });
};

module.exports.createUser = (request, response, next) => { // создаём пользователя
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = request.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      userSchema.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
        .then(() => response.status(HTTP_STATUS_CREATED)
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
            return next(new ConflictError('The User with email has registered'));
          }
          if (err.name === 'ValidationError') {
            return next(new BadRequestError('Incorrect data'));
          }
          return next(err);
        });
    })
    .catch(next);
};

module.exports.updateUser = (request, response, next) => { // обновление данных пользователя
  const {
    name,
    about,
  } = request.body;

  userSchema.findByIdAndUpdate(
    request.user._id,
    {
      name,
      about,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => response.status(HTTP_STATUS_OK)
      .send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new NotFoundError('Invalid user by id'));
      }
      return next(err);
    });
};

module.exports.updateAvatar = (request, response, next) => { // обновление аватара пользователя
  const { avatar } = request.body;

  userSchema.findByIdAndUpdate(
    request.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => response.status(HTTP_STATUS_OK)
      .send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError('Invalid data to avatar update'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (request, response, next) => {
  const {
    email,
    password,
  } = request.body;

  return userSchema.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new AuthorizedError('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(new AuthorizedError('Неправильные почта или пароль'));
          }
          const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });

          response.cookie('jwt', token, {
            httpOnly: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          return response.send({ message: 'Авторизация прошла успешно' });
        });
    })
    .catch((err) => next(err));
};
