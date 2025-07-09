# Authorization Code Grant Example

## Architecture

The authorization code workflow is described in
[RFC 6749, section 4.1](https://datatracker.ietf.org/doc/html/rfc6749.html#section-4.1):

```
+----------+
| Resource |
|   Owner  |
|          |
+----------+
     ^
     |
    (B)
+----|-----+          Client Identifier      +---------------+
|         -+----(A)-- & Redirection URI ---->|               |
|  User-   |                                 | Authorization |
|  Agent  -+----(B)-- User authenticates --->|     Server    |
|          |                                 |               |
|         -+----(C)-- Authorization Code ---<|               |
+-|----|---+                                 +---------------+
  |    |                                         ^      v
 (A)  (C)                                        |      |
  |    |                                         |      |
  ^    v                                         |      |
+---------+                                      |      |
|         |>---(D)-- Authorization Code ---------'      |
|  Client |          & Redirection URI                  |
|         |                                             |
|         |<---(E)----- Access Token -------------------'
+---------+       (w/ Optional Refresh Token)
```

### Provider dependencies

- @node-oauth/express-oauth-server (uses @node-oauth/oauth2-server)
- express
- body-parser

### Client dependencies

- express
- ejs

## Installation and usage

Install dependencies in both provider and client directories:

```shell
$ cd provider && npm install
$ cd ../client && npm install
```

Create a `.env` file in the authorization-code/provider directory:

```
CLIENT_ID=testclient
CLIENT_SECRET=testsecret
REDIRECT_URI=http://localhost:3000/callback
USER_ID=user1
USERNAME=demo
PASSWORD=demo
```

Create a `.env` file in the authorization-code/client directory:

```
AUTH_SERVER=http://localhost:8080
CLIENT_ID=testclient
CLIENT_SECRET=testsecret
REDIRECT_URI=http://localhost:3000/callback
```

Start the provider (authorization server + resource server):

```shell
$ cd provider && npm start
```

Start the client application:

```shell
$ cd client && npm start
```

Visit http://localhost:3000 to start the authorization code flow.

## About This Example

This example demonstrates a clear separation between the OAuth2 provider (authorization server + resource server) and the client application. Unlike other examples that might combine both roles in a single application, this example shows:

- **Provider** (port 8080): Acts as both authorization server and resource server
- **Client** (port 3000): A separate web application that consumes OAuth2 services

This separation makes it easier to understand what the framework supports and what it doesn't.

## Flow

1. User visits the client application at http://localhost:3000
2. User clicks "Login" to start the authorization flow
3. User is redirected to the provider's authorization page
4. User enters credentials and grants authorization
5. User is redirected back to the client with an authorization code
6. Client exchanges the code for an access token
7. Client can now access protected resources using the access token
