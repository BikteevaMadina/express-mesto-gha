const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes/router');

const {
  MONGO_URL = 'mongodb://127.0.0.1:27017/mestodb',
  PORT = 3000,
} = process.env;

const app = express();
app.use(express.json());


app.use((request, response, next) => {
  request.user = {
    _id: '646898eda4b642d9bc6a2f41',
  };
  next();
});

app.use(router);

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
