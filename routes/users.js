const userRoutes = require('express')
  .Router();

const {
  getUserById,
  getUsers,
  createUser,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

userRoutes.get('/:userId', getUserById);
userRoutes.get('/', getUsers);
userRoutes.post('/', createUser);
userRoutes.patch('/me', updateUser);
userRoutes.patch('/me/avatar', updateAvatar);

module.exports = userRoutes;
