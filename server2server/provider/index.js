const bodyParser = require('body-parser');
const express = require('express');
const OAuthServer = require('@node-oauth/express-oauth-server');
const createModel = require('./model');
const DB = require('./db');

const db = new DB();
const app = express();
const oauth = new OAuthServer({
  model: createModel(db)
});

db.saveClient({
  id: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET,
  grants: ['client_credentials']
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// -----------------------
// public area begins here
// -----------------------
app.get('/public', function (req, res) {
  res.send('moo');
});

// ------------------------
// private area begins here
// ------------------------
app.use('/token', oauth.token());

const internal = {
  resource: null
};

app.get('/read-resource', oauth.authenticate(), function (req, res) {
  res.send({ resource: internal.resource });
});

app.post('/write-resource',  oauth.authenticate(), function (req, res) {
  internal.resource = req.body.value;
  res.send({ message: 'resource created' });
});

app.listen(8080);
console.debug('[Provider]: listens to http://localhost:8080');
