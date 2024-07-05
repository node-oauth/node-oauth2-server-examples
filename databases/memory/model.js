
/**
 * Constructor.
 */

function InMemoryCache() {
  this.clients = [{ clientId : 'doeclient', clientSecret : 'foobarbaz', redirectUris : [''], grants: ['password'] }];
  this.tokens = [];
  this.users = [{ id : '123', username: 'jdoe', password: 'foobarbaz' }];
  this.accessToken = new Map();
  this.refreshToken = new Map();
}

/**
 * Dump the cache.
 */

InMemoryCache.prototype.dump = function() {
  console.log('clients', this.clients);
  console.log('tokens', this.tokens);
  console.log('users', this.users);
};

/*
 * Get access token.
 */

InMemoryCache.prototype.getAccessToken = function(bearerToken) {
  let tokens = this.tokens.filter(function(token) {
    return token.accessToken === bearerToken;
  });

  return tokens.length ? tokens[0] : false;
};

/**
 * Get refresh token.
 */

InMemoryCache.prototype.getRefreshToken = function(bearerToken) {
  let tokens = this.tokens.filter(function(token) {
    return token.refreshToken === bearerToken;
  });

  return tokens.length ? tokens[0] : false;
};

/**
 * Get client.
 */

InMemoryCache.prototype.getClient = function(clientId, clientSecret) {
  let clients = this.clients.filter(function(client) {
    return client.clientId === clientId && client.clientSecret === clientSecret;
  });

  return clients.length ? clients[0] : false;
};

/**
 * Save token.
 */

InMemoryCache.prototype.saveToken = function(token, client, user) {
  if (token.scope && !Array.isArray(token.scope)) {
    throw new Error('Scope should internally be an array');
  }
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
    this.accessToken.set(token.accessToken, meta);
  }

  if (token.refreshToken) {
    this.refreshToken.set(token.refreshToken, meta);
  }

  return token;
};

InMemoryCache.prototype.saveAuthorizationCode = function (code, client, user) {
  this.authCodes.push({ code, client, user });
};

InMemoryCache.prototype.getAuthorizationCode = function (authorizationCode) {
  return this.authCodes.find(doc => doc.code.authorization_code === authorizationCode);
};

/*
 * Get user.
 */

InMemoryCache.prototype.getUser = function(username, password) {
  let users = this.users.filter(function(user) {
    return user.username === username && user.password === password;
  });

  return users.length ? users[0] : false;
};

/**
 * Export constructor.
 */

module.exports = InMemoryCache;
