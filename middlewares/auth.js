const jwt = require('jsonwebtoken');

const AuthorizedError = require('../errors/AuthorizedError');

module.exports = (request, response, next) => {
  const { authorization } = request.headers;
  let payload;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthorizedError('You need to log in'));
  }

  const token = authorization.replace('Bearer ', '');
  try {
    payload = jwt.verify(token, 'cat');
  } catch (err) {
    next(new AuthorizedError('You need to log in'));
  }

  request.user = payload;

  return next();
};
