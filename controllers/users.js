const userSchema = require('../models/user');

module.exports.getUserById = (request, response) => {
  const { userId } = request.params;

  userSchema
    .findById(userId)
    .orFail()
    .then((user) => response.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return response.status(400)
          .send({ message: 'Bad Request' });
      }

      if (err.name === 'DocumentNotFoundError') {
        return response.status(404)
          .send({ message: 'User with _id not found' });
      }

      return response.status(500)
        .send({ message: err.message });
    });
};

module.exports.getUsers = (request, response) => {
  userSchema
    .find({})
    .then((users) => response.send(users))
    .catch((err) => response.status(500)
      .send({ message: err.message }));
};

module.exports.createUser = (request, response) => {
  const {
    name,
    about,
    avatar,
  } = request.body;

  userSchema
    .create({
      name,
      about,
      avatar,
    })
    .then((user) => response.status(201)
      .send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        response.status(400)
          .send({ message: 'Invalid data to create user' });
      } else {
        response.status(500)
          .send({ message: err.message });
      }
    });
};

module.exports.updateUser = (request, response) => {
  const {
    name,
    about,
  } = request.body;

  userSchema
    .findByIdAndUpdate(
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
    .then((user) => response.status(200)
      .send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return response.status(400)
          .send({ message: 'Invalid data to update user' });
      }

      return response.status(500)
        .send({ message: err.message });
    });
};

module.exports.updateAvatar = (request, response) => {
  const { avatar } = request.body;

  userSchema
    .findByIdAndUpdate(
      request.user._id,
      { avatar },
      {
        new: true,
        runValidators: true,
      },
    )
    .then((user) => response.status(200)
      .send(user))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        response.status(400)
          .send({ message: 'Invalid data to update avatar' });
      } else {
        response.status(500)
          .send({ message: err.message });
      }
    });
};
