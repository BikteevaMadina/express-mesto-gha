const cardRoutes = require('express')
  .Router();

const {
  getCards,
  createCard,
  deleteCard,
  addLike,
  deleteLike,
} = require('../controllers/cards');

cardRoutes.get('/', getCards);
cardRoutes.post('/', createCard);
cardRoutes.delete('/:cardId', deleteCard);
cardRoutes.put('/:cardId/likes', addLike);
cardRoutes.delete('/:cardId/likes', deleteLike);

module.exports = cardRoutes;
