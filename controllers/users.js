const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userSchema = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const AuthorizedError = require('../errors/AuthorizedError');
const ConflictError = require('../errors/ConflictError');

const {
  HTTP_STATUS_OK,
} = require('../utils/constants');

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return userSchema
    .findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return next(new AuthorizedError('incorrect email or password'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(new AuthorizedError('incorrect email or password'));
          }

          const token = jwt.sign({ _id: user._id }, 'secret-person-key', { expiresIn: '7d' });
          res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true, sameSite: true });

          return res.status(HTTP_STATUS_OK).send({ token });
        });
    })
    .catch(next);
};

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
            return next(new ConflictError('The username with this email has already been registered'));
          }
          if (err.name === 'ValidationError') {
            return next(new BadRequestError('Incorrect input'));
          }
          return next(err);
        });
    })
    .catch(next);
};

module.exports.getUser = (request, response, next) => {
  userSchema.findById(request.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('User cannot be found');
      }
      response.status(200)
        .send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(BadRequestError('Incorrect data'));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('User cannot be found'));
      } else {
        next(err);
      }
    });
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

// module.exports.login = (request, response, next) => {
//   const {
//     email,
//     password,
//   } = request.body;

//   return userSchema
//     .findUserByCredentials(email, password)
//     .then((user) => {
//       const token = jwt.sign({ _id: user._id }, 'cat', {
//         expiresIn: '3d',
//       });
//       response.send({ token });
//     })
//     .catch(next);
// };
