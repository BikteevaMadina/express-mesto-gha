const userRoutes = require('express').Router();

const {
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

const {
  updateUserValidation,
  validationUpdateAvatar,
  userIdValidation,
} = require('../middlewares/validation');

userRoutes.get('/', getUsers);
userRoutes.get('/me', getUserById);
userRoutes.get('/:userId', userIdValidation, getUserById);
userRoutes.patch('/me', updateUserValidation, updateUser);
userRoutes.patch('/me/avatar', validationUpdateAvatar, updateAvatar);

module.exports = userRoutes;
