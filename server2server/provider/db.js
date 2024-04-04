class DB {
  constructor() {
    this.clients = [];
    this.accessTokens = new Map();
    this.authorizationCodes = new Map();
    this.refreshTokens = new Map();
  }

  saveClient(client) {
    this.clients.push(client);

    return client;
  }

  findClient(clientId, clientSecret) {
    return this.clients.find((client) => {
      if (clientSecret) {
        return client.id === clientId && client.secret === clientSecret;
      } else {
        return client.id === clientId;
      }
    });
  }

  findClientById(id) {
    return this.clients.find((client) => client.id === id);
  }

  saveAccessToken(accessToken, meta) {
    this.accessTokens.set(accessToken, meta);
  }

  findAccessToken(accessToken) {
    return this.accessTokens.get(accessToken);
  }

  deleteAccessToken(accessToken) {
    this.accessTokens.delete(accessToken);
  }

  saveRefreshToken(refreshToken, meta) {
    this.refreshTokens.set(refreshToken, meta);
  }

  findRefreshToken(refreshToken) {
    return this.refreshTokens.get(refreshToken);
  }

  deleteRefreshToken(refreshToken) {
    this.refreshTokens.delete(refreshToken);
  }

  saveAuthorizationCode(authorizationCode) {
    this.authorizationCodes.set(
      authorizationCode.authorizationCode,
      authorizationCode
    );
  }

  findAuthorizationCode(authorizationCode) {
    return this.authorizationCodes.get(authorizationCode);
  }

  deleteAuthorizationCode(authorizationCode) {
    this.authorizationCodes.delete(authorizationCode);
  }
}

module.exports = DB;
