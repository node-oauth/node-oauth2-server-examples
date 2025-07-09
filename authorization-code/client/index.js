require("dotenv").config({ path: "../.env" });
const express = require("express");
const crypto = require("crypto");

const app = express();
const states = new Map();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

const authServer = process.env.AUTH_SERVER;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

function generateState() {
  return crypto.randomBytes(16).toString("hex");
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index", {
    authServer: authServer,
  });
});

app.get("/login", (req, res) => {
  const state = generateState();
  states.set(state, { created: Date.now() });

  res.render("authorize", {
    client: { id: clientId },
    redirectUri: redirectUri,
    scope: "read write",
    state: state,
    authServer: authServer,
  });
});

app.get("/callback", (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.render("error", {
      message: `Authorization Error: ${error}`,
    });
  }

  if (!states.has(state)) {
    return res.render("error", {
      message: "Invalid State: State parameter mismatch",
    });
  }

  states.delete(state);

  res.render("callback", {
    code: code,
    state: state,
    authServer: authServer,
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri,
  });
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});

app.listen(3000);
console.debug("[Client]: listens to http://localhost:3000");
