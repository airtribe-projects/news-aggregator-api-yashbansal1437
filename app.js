const express = require('express');
const usersRouter = require('./routes/usersRoute');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/users', usersRouter);

module.exports = app;
