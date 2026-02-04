# Server 2 server with Client Credentials Grant

## Architecture

The client credentials workflow is described in
[RFC 6749, section 4.4](https://datatracker.ietf.org/doc/html/rfc6749.html#section-4.4):

```
+---------+                                  +---------------+
|         |                                  |               |
|         |>--(A)- Client Authentication --->| Authorization |
| Client  |                                  |     Server    |
|         |<--(B)---- Access Token ---------<|               |
|         |                                  |               |
+---------+                                  +---------------+
```

In this setup the authorization server does also contain the consumable **resources**.
Therefore, the setup looks something like this:

```
+----------+                                  +--------------+
|          |                                  |              |
| Consumer |>--(A)- Client Authentication --->|   Provider   |
|          |                                  |              |
|          |<--(B)---- Access Token ---------<|              |
|          |                                  |              |
|          |>--(C)---- Access resource ---------> [Resource] |
|          |                                  |       |      |
|          |<--(D)----Resource response -----<--------<      |
+----------+                                  +--------------+
```

### Provider dependencies
- @node-oauth/express-oauth-server (uses @node-oauth/oauth2-server)
- express
- body-parser
- dotenv

### Consumer dependencies

- node-fetch
- dotenv

## Installation and usage

If you haven't already cloned this repository, then clone it via

```shell
$ git clone https://github.com/node-oauth/node-oauth2-server-examples.git
$ cd server2server
```

### Install and run the provider

Since we have two servers you need to install dependencies in both.
First, start with the provider:

```shell
$ cd provider
$ npm install
$ npm run start
```

The provider runs on `http://localhost:8080`


### Install and run the consumer

```shell
$ cd ../consumer
$ npm install
$ npm run start
```

The consumer will now make several requests. Note, that some of them are expected to fail.
The overall output should look like so:

```shell
[Consumer]: get /public (public)
[Provider]: 200 OK moo 

[Consumer]: get /read-resource (not authenticated)
[Provider]: 401 Unauthorized  

[Consumer]: post /token (bad credentials)
[Provider]: 401 Unauthorized {"error":"invalid_client","error_description":"Invalid client: client is invalid"} 

[Consumer]: post /token (valid credentials)
[Provider]: 200 OK {"access_token":"2e16cec83a2525355dfbebed69d28ac2e6265f0e787d8daf2c7114351e6477fa","token_type":"Bearer","expires_in":3600,"scope":"read"} 

authorization token successfully retrieved! 

[Consumer]: get /read-resource (authenticated, resource is not yet defined)
[Provider]: 200 OK {"resource":"foo-bar-moo"} 

[Consumer]: post /write-resource (authentication failed)
[Provider]: 401 Unauthorized {"error":"invalid_token","error_description":"Invalid token: access token is invalid"} 

[Consumer]: post /write-resource (Invalid token)
[Provider]: 200 OK {"message":"resource created"} 

[Consumer]: get /read-resource (authenticated, resource is now)
[Provider]: 200 OK {"resource":"foo-bar-moo"} 
```

## How routes are protected

If you take a look at the `provider/index.js` file, you will see a mix of public and private routes.

```js
app.get('/protected-route', oauth.authenticate(), function (req, res) {
  res.send({ resource: internal.resource });
})
```

If the authenticated middleware fails, there will be no `next()` call into your provided handler function. 
The authentication will fail, if no **access token** is provided.

In order to receive an access token, the client needs to make a call to the **public** `/token` endpoint, first:

```js
const tokenBodyParams = new URLSearchParams();
tokenBodyParams.append('grant_type', 'client_credentials');
tokenBodyParams.append('scope', 'read'); 

const response = await fetch('http://localhost:8080/token', {
  method: 'post',
  body: tokenBodyParams,
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'authorization': 'Basic ' + Buffer.from(`${client.id}:${client.secret}`).toString('base64'),
  }
})
const token = await response.json()
const accessToken = token.access_token
const tokenType = token.token_type
```

With this token, the client can make authenticated requests to the protected endpoints:

```js
const response = await fetch('http://localhost:8080/read-resource', {
  method: 'get',
  headers: {
    'authorization': `${tokenType} ${accessToken}`
  }
})
const resource = await response.json()
```

Since there are no refresh token involved, the requests may fail, due to expired token.
It's up to the client to re-request a new token.
