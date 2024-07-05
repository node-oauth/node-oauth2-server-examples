const InMemoryCache = require('./model.js');
const bodyParser = require('body-parser');
const express = require('express');
const OAuthServer = require('@node-oauth/express-oauth-server');

const PORT = process.env.PORT || 3000
const app = express();

app.oauth = new OAuthServer({
  model: new InMemoryCache()
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/token', app.oauth.token());

app.use('/secret', app.oauth.authorize(), function(req, res) {
  console.debug('secret')
  res.send('Secret area');
});

app.use('*', function(req, res) {
  res.send('public area');
});

app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}`);
});
