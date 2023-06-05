const mongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

const AuthorizedError = require('../errors/AuthorizedError');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
    default: 'Жак-Ив Кусто',
  },

  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
    default: 'Исследователь',
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  avatar: {
    type: String,
    validate: {
      validator: (url) => validator.isURL(url),
      message: 'Incorrect URL',
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },

  email: {
    unique: true,
    type: String,
    required: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'Incorrect email',
    },
  },
});

userSchema.statics.findUserByCredentials = function _(email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) return Promise.reject(new AuthorizedError('Incorrect email or password'));
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) return Promise.reject(new AuthorizedError('Incorrect email or password'));
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
