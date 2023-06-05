const mongoose = require('mongoose');

const validator = require('validator');

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

module.exports = mongoose.model('user', userSchema);
