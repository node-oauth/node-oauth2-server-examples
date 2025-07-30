const crypto = require("crypto");

const enabledScopes = ["read", "write"];

function createModel(db) {
  async function getClient(clientId, clientSecret) {
    return db.findClient(clientId, clientSecret);
  }

  async function validateScope(user, client, scope) {
    if (!user) {
      return false;
    }

    if (!client || !db.findClientById(client.id)) {
      return false;
    }

    if (typeof scope === "string") {
      return enabledScopes.includes(scope) ? [scope] : false;
    } else {
      return scope.every((s) => enabledScopes.includes(s)) ? scope : false;
    }
  }

  async function getUser(username, password) {
    return db.findUser(username, password);
  }

  async function getUserFromClient(client) {
    return null;
  }

  async function saveToken(token, client, user) {
    const tokenDoc = {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      scope: token.scope,
      client: client,
      user: user,
    };

    db.saveAccessToken(token.accessToken, tokenDoc);

    if (token.refreshToken) {
      db.saveRefreshToken(token.refreshToken, tokenDoc);
    }

    return tokenDoc;
  }

  async function getAccessToken(accessToken) {
    return db.findAccessToken(accessToken);
  }

  async function getRefreshToken(refreshToken) {
    return db.findRefreshToken(refreshToken);
  }

  async function revokeToken(token) {
    return db.revokeAccessToken(token.accessToken);
  }

  async function saveAuthorizationCode(code, client, user) {
    const codeDoc = {
      authorizationCode: code.authorizationCode,
      expiresAt: code.expiresAt,
      redirectUri: code.redirectUri,
      scope: code.scope,
      client: client,
      user: user,
    };

    db.saveAuthorizationCode(code.authorizationCode, codeDoc);
    return codeDoc;
  }

  async function getAuthorizationCode(authorizationCode) {
    return db.findAuthorizationCode(authorizationCode);
  }

  async function revokeAuthorizationCode(code) {
    return db.revokeAuthorizationCode(code.authorizationCode);
  }

  async function verifyScope(token, scope) {
    if (!token.scope) {
      return false;
    }

    let requiredScopes = scope.split(" ");
    let tokenScopes = token.scope;

    if (typeof tokenScopes === "string") {
      tokenScopes = tokenScopes.split(" ");
    }

    return requiredScopes.every((s) => tokenScopes.includes(s));
  }

  async function generateAccessToken(client, user, scope) {
    return crypto.randomBytes(32).toString("hex");
  }

  async function generateRefreshToken(client, user, scope) {
    return crypto.randomBytes(32).toString("hex");
  }

  async function generateAuthorizationCode(client, user, scope) {
    return crypto.randomBytes(16).toString("hex");
  }

  return {
    getClient,
    validateScope,
    getUser,
    getUserFromClient,
    saveToken,
    getAccessToken,
    getRefreshToken,
    revokeToken,
    saveAuthorizationCode,
    getAuthorizationCode,
    revokeAuthorizationCode,
    verifyScope,
    generateAccessToken,
    generateRefreshToken,
    generateAuthorizationCode,
  };
}

module.exports = createModel;
