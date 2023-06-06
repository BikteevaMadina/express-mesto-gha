const cardSchema = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_OK,
} = require('../utils/constants');

module.exports.getCards = (request, response, next) => { // получение всех постов
  cardSchema.find({})
    .then((cards) => response.status(HTTP_STATUS_OK)
      .send(cards))
    .catch(next);
};

module.exports.deleteCard = (request, response, next) => { // удаление поста по id
  const { cardId } = request.params;

  cardSchema.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('User cannot be found');
      }
      if (!card.owner.equals(request.user._id)) {
        return next(new ForbiddenError('Card cannot be deleted'));
      }
      return card.deleteOne().then(() => response.send({ message: 'Card was deleted' }));
    })
    .catch(next);
};

module.exports.createCard = (request, response, next) => { // создание поста
  const {
    name,
    link,
  } = request.body;
  const owner = request.user._id;

  cardSchema.create({
    name,
    link,
    owner,
  })
    .then((card) => response.status(HTTP_STATUS_CREATED)
      .send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Invalid data for card creation'));
      } else {
        next(err);
      }
    });
};

module.exports.addLike = (request, response, next) => { // добавление лайка
  cardSchema.findByIdAndUpdate(
    request.params.cardId,
    { $addToSet: { likes: request.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('User cannot be found');
      }
      response.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Invalid data'));
      }
      return next(err);
    });
};

module.exports.deleteLike = (request, response, next) => {
  cardSchema
    .findByIdAndUpdate(
      request.params.cardId,
      { $pull: { likes: request.user._id } },
      { new: true },
    )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('User cannot be found');
      }
      response.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Invalid data'));
      }
      return next(err);
    });
};
