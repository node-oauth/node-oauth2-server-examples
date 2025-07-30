class DB {
  constructor () {
    this.clients = [];
    this.users = [];
    this.accessTokens = new Map();
    this.refreshTokens = new Map();
    this.authorizationCodes = new Map();
  }

  saveClient (client) {
    this.clients.push(client);
    return client;
  }

  findClient (clientId, clientSecret) {
    return this.clients.find(client => {
      if (clientSecret) {
        return client.id === clientId && client.secret === clientSecret;
      } else {
        return client.id === clientId;
      }
    });
  }

  findClientById (id) {
    return this.clients.find(client => client.id === id);
  }

  saveUser (user) {
    this.users.push(user);
    return user;
  }

  findUser (username, password) {
    return this.users.find(user => 
      user.username === username && user.password === password
    );
  }

  findUserById (id) {
    return this.users.find(user => user.id === id);
  }

  saveAccessToken (accessToken, meta) {
    this.accessTokens.set(accessToken, meta);
  }

  findAccessToken (accessToken) {
    return this.accessTokens.get(accessToken);
  }

  revokeAccessToken (accessToken) {
    return this.accessTokens.delete(accessToken);
  }

  saveRefreshToken (refreshToken, meta) {
    this.refreshTokens.set(refreshToken, meta);
  }

  findRefreshToken (refreshToken) {
    return this.refreshTokens.get(refreshToken);
  }

  revokeRefreshToken (refreshToken) {
    return this.refreshTokens.delete(refreshToken);
  }

  saveAuthorizationCode (authorizationCode, meta) {
    this.authorizationCodes.set(authorizationCode, meta);
  }

  findAuthorizationCode (authorizationCode) {
    return this.authorizationCodes.get(authorizationCode);
  }

  revokeAuthorizationCode (authorizationCode) {
    return this.authorizationCodes.delete(authorizationCode);
  }
}

module.exports = DB;
