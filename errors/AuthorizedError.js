const { HTTP_STATUS_UNAUTHORIZED } = require('../utils/constants');

class AuthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = HTTP_STATUS_UNAUTHORIZED;
  }
}

module.exports = AuthorizedError;
