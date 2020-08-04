const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sslRedirect = require('heroku-ssl-redirect');
const routes = require('./routes/routes.js');

const app = express();
app.use(express.static('public'));
app.use(cors())
  .use(cookieParser())
  .use(sslRedirect())
  .use('/', routes);

const { PORT } = process.env || 8000;
console.log(`Listening on ${PORT}`);
app.listen(PORT);
