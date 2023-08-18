const enabledScopes = ['read', 'write'];
const getUserDoc = () => ({ id: 'system' });

function createModel (db) {
  async function getClient (clientId, clientSecret) {
    return db.findClient(clientId, clientSecret);
  }

  async function validateScope (user, client, scope) {
    if (!user || user.id !== 'system') {
      return false;
    }

    if (!client || !db.findClientById(client.id)) {
      return false;
    }

    if (typeof scope === 'string') {
      return enabledScopes.includes(scope);
    } else {
      return scope.every(s => enabledScopes.includes(s));
    }
  }

  async function getUserFromClient (_client) {
    // In this setup we don't have any users, so
    // we return an object, representing a "system" user
    // and avoid creating any user documents.
    // The user document is nowhere relevant for accessing resources,
    // so we can safely use it like this.
    const client = db.findClient(_client.id, _client.secret);
    return client && getUserDoc();
  }

  async function saveToken (token, client, user) {
    const meta = {
      clientId: client.id,
      userId: user.id,
      scope: token.scope,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt
    };

    token.client = client;
    token.user = user;

    if (token.accessToken) {
      db.saveAccessToken(token.accessToken, meta);
    }

    if (token.refreshToken) {
      db.saveRefreshToken(token.refreshToken, meta);
    }

    return token;
  }

  async function getAccessToken (accessToken) {
    const meta = db.findAccessToken(accessToken);

    if (!meta) {
      return false;
    }

    return {
      accessToken,
      accessTokenExpiresAt: meta.accessTokenExpiresAt,
      user: getUserDoc(),
      client: db.findClientById(meta.clientId),
      scope: meta.scope
    };
  }

  async function getRefreshToken (refreshToken) {
    const meta = db.findRefreshToken(refreshToken);

    if (!meta) {
      return false;
    }

    return {
      refreshToken,
      refreshTokenExpiresAt: meta.refreshTokenExpiresAt,
      user: getUserDoc(),
      client: db.findClientById(meta.clientId),
      scope: meta.scope
    };
  }

  async function revokeToken (token) {
    db.deleteRefreshToken(token.refreshToken);

    return true;
  }

  async function verifyScope (token, scope) {
    if (typeof scope === 'string') {
      return enabledScopes.includes(scope);
    } else {
      return scope.every(s => enabledScopes.includes(s));
    }
  }

  return  {
    getClient,
    saveToken,
    getAccessToken,
    getRefreshToken,
    revokeToken,
    validateScope,
    verifyScope,
    getUserFromClient
  };
}

module.exports = createModel;
