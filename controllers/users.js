const httpConstants = require('http2').constants;
const userSchema = require('../models/user');

const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
} = httpConstants;

module.exports.getUsers = (request, response) => { // получаем всех пользователей
  userSchema.find({})
    .then((users) => response.send(users))
    .catch(() => response.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' }));
};

module.exports.getUserById = (request, response) => { // получаем пользователя по id
  const { userId } = request.params;

  userSchema.findById(userId)
    .orFail()
    .then((user) => response.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return response.status(HTTP_STATUS_BAD_REQUEST).send({ message: ' Bad Request ' });
      }

      if (err.name === 'DocumentNotFoundError') {
        return response.status(HTTP_STATUS_NOT_FOUND).send({ message: ' User by _id not found ' }); // пользователь с данным id не найден
      }

      return response.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.createUser = (request, response) => { // создаём пользователя
  const {
    name,
    about,
    avatar,
  } = request.body;

  userSchema.create({
    name,
    about,
    avatar,
  })
    .then((user) => response.status(HTTP_STATUS_CREATED)
      .send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        response.status(HTTP_STATUS_BAD_REQUEST)
          .send({ message: ' Invalid data to user create ' });
      } else {
        response.status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.updateUser = (request, response) => { // обновление данных пользователя
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
      if (err.name === 'DocumentNotFoundError') {
        return response.status(HTTP_STATUS_NOT_FOUND).send({ message: 'User by id not found' });
      }
      if (err.name === 'ValidationError') {
        return response.status(HTTP_STATUS_BAD_REQUEST).send({ message: ' Invalid data to user update ' });
      }

      return response.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports.updateAvatar = (request, response) => { // обновление аватара пользователя
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
        response.status(HTTP_STATUS_BAD_REQUEST)
          .send({ message: ' Invalid data to avatar update ' }); //  некорректные данные для обновления
      } else {
        response.status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'Произошла ошибка' });
      }
    });
};
