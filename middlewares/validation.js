const { Joi, celebrate } = require('celebrate');

const { urlPattern } = require('../utils/constants');

module.exports.createUserValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    avatar: Joi.string().regex(urlPattern),
    password: Joi.string().required(),
  }),
});

module.exports.cardByIdValidation = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().regex(urlPattern),
  }),
});

module.exports.loginValidation = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

module.exports.validationUpdateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(urlPattern),
  }),
});

module.exports.updateUserValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    about: Joi.string().min(2).max(30).required(),
  }),
});

module.exports.createCardValidation = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required().regex(urlPattern),
  }),
});

module.exports.userIdValidation = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24).hex(),
  }),
});
