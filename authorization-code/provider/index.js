require("dotenv").config({ path: "../.env" });
const bodyParser = require("body-parser");
const express = require("express");
const OAuthServer = require("@node-oauth/express-oauth-server");
const createModel = require("./model");
const DB = require("./db");

const db = new DB();
const app = express();
const oauth = new OAuthServer({
  model: createModel(db),
});

app.set("view engine", "ejs");
app.set("views", "./views");

db.saveClient({
  id: process.env.CLIENT_ID || "testclient",
  secret: process.env.CLIENT_SECRET || "testsecret",
  grants: ["authorization_code", "refresh_token"],
  redirectUris: [process.env.REDIRECT_URI || "http://localhost:3000/callback"],
});

db.saveUser({
  id: process.env.USER_ID || "user1",
  username: process.env.USERNAME || "demo",
  password: process.env.PASSWORD || "demo",
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get("/oauth/authorize", function (req, res) {
  res.render("authorize", {
    client: { id: req.query.client_id },
    redirectUri: req.query.redirect_uri,
    responseType: req.query.response_type,
    scope: req.query.scope,
    state: req.query.state,
  });
});

app.post(
  "/oauth/authorize",
  function (req, res, next) {
    if (req.body.allow !== "true") {
      const error = new Error("Access denied");
      error.status = 403;
      return next(error);
    }

    const user = db.findUser(req.body.username, req.body.password);
    if (!user) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      return next(error);
    }

    req.body.user = user;
    next();
  },
  oauth.authorize({
    authenticateHandler: {
      handle: function (req) {
        return req.body.user;
      },
    },
  })
);

app.post("/oauth/token", oauth.token());

app.get("/protected", oauth.authenticate(), function (req, res) {
  const token = res.locals.oauth.token;
  res.json({
    message: "Protected resource accessed",
    accessedBy: token && token.user ? token.user.id : "unknown",
  });
});

app.get("/public", function (req, res) {
  res.json({ message: "This is a public resource" });
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.listen(8080);
console.debug("[Provider]: listens to http://localhost:8080");
