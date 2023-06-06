const express = require('express');

const mongoose = require('mongoose');

const { errors } = require('celebrate');

const router = require('./routes/routers');

const {
  createUserValidation,
  loginValidation,
} = require('./middlewares/validation');

const auth = require('./middlewares/auth');

const { createUser, login } = require('./controllers/authorization');

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/mestodb',
  PORT = 3000,
} = process.env;

const app = express();

app.use(express.json());
app.post('/signin', loginValidation, login);
app.post('/signup', createUserValidation, createUser);
app.use(auth);
app.use(router);
app.use(errors());
app.use((error, request, response, next) => {
  const {
    status = 500,
    message,
  } = error;
  response.status(status)
    .send({
      message: status === 500
        ? 'Произошла ошибка на сервере'
        : message,
    });
  next();
});

async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    await app.listen(PORT);
  } catch (err) {
    console.log(err);
  }
}

start()
  .then(() => console.log(`App started on port \n${MONGO_URL}\nPort: ${PORT}`));
