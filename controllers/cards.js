const httpConstants = require('http2').constants;
const cardSchema = require('../models/card');

const {
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
} = httpConstants;

module.exports.getCards = (request, response) => { // получение всех постов
  cardSchema.find({})
    .then((cards) => response.status(HTTP_STATUS_OK)
      .send(cards))
    .catch(() => response.status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: 'Произошла ошибка' }));
};

module.exports.deleteCard = (request, response) => { // удаление поста по id
  const { cardId } = request.params;

  cardSchema.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return response.status(HTTP_STATUS_NOT_FOUND)
          .send({ message: 'Not found' });
      }

      return response.status(HTTP_STATUS_OK)
        .send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        response.status(HTTP_STATUS_BAD_REQUEST)
          .send({ message: 'Card by _id not found' });
      } else {
        response.status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.createCard = (request, response) => { // создание поста
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
        response.status(HTTP_STATUS_BAD_REQUEST)
          .send({ message: 'Invalid data to create card' });
      } else {
        response.status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
          .send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.addLike = (request, response) => { // добавление лайка
  cardSchema.findByIdAndUpdate(
    request.params.cardId,
    { $addToSet: { likes: request.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return response.status(HTTP_STATUS_NOT_FOUND)
          .send({ message: 'Not found' });
      }

      return response.status(HTTP_STATUS_OK)
        .send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return response.status(HTTP_STATUS_BAD_REQUEST)
          .send({ message: 'Invalid data to add like' });
      }

      return response.status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: 'Произошла ошибка' });
    });
};

module.exports.deleteLike = (request, response) => { // удаление лайка по id поста
  cardSchema.findByIdAndUpdate(
    request.params.cardId,
    { $pull: { likes: request.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return response.status(HTTP_STATUS_NOT_FOUND)
          .send({ message: 'Not found' });
      }

      return response.status(HTTP_STATUS_OK)
        .send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return response.status(HTTP_STATUS_BAD_REQUEST)
          .send({ message: 'Invalid data to delete like' });
      }

      return response.status(HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: 'Произошла ошибка' });
    });
};
