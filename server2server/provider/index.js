const bodyParser = require('body-parser');
const express = require('express');
const OAuthServer = require('@node-oauth/oauth2-server');
const createModel = require('./model');
const jwt = require('jsonwebtoken');
const DB = require('./db');

const db = new DB();
const app = express();
const oauth = new OAuthServer({
  model: createModel(db),
  continueMiddleware: true,
  authenticateHandler: {
    handle() {
      return { id: 'system', foo: 'bar' };
    },
  },
  debug: true,
});

db.saveClient({
  id: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET,
  redirectUris: ['http://localhost:8080/token'],
  grants: ['authorization_code'],
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
app.use('/authorize', async (req, res) => {
  try {
    const authorizationCode = await oauth.authorize(
      new OAuthServer.Request(req),
      new OAuthServer.Response(res),
    );

    return res.json(authorizationCode);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.name, message: err.message });
  }
});

app.post('/token', async (req, res) => {
  try {
    const token = await oauth.token(
      new OAuthServer.Request(req),
      new OAuthServer.Response(res),
    );
    console.log({ token });
    const jwtToken = generateJWTToken(token);
    res.json({
      access_token: jwtToken,
      token_type: 'Bearer',
      expires_in: jwtToken.accessTokenExpiresAt,
    });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.name, message: err.message });
  }
});

const authenticate = async (req, res, next) => {
  try {
    const rawToken = req.headers.authorization.replace('Bearer ', '');
    jwt.verify(rawToken, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    const data = jwt.decode(rawToken, process.env.JWT_SECRET);
    req.user = { id: data.userId };
    next();
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.name, message: err.message });
  }
};

function generateJWTToken(tokenData) {
  const payload = {
    userId: tokenData.user.id, // Assuming user ID is stored in the tokenData
    // Add additional payload data if needed
  };

  // Sign the JWT token
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: 3600,
    algorithm: 'HS256',
  });
}

const internal = {
  resource: null,
};

app.get('/read-resource', authenticate, function (req, res) {
  res.send({ resource: internal.resource });
});

app.post('/write-resource', authenticate, function (req, res) {
  internal.resource = {
    value: req.body.value,
    authorId: req.user.id,
    createdAt: new Date(),
  };
  res.send({ message: 'resource created' });
});

app.listen(8080);
console.debug('[Provider]: listens to http://localhost:8080');
