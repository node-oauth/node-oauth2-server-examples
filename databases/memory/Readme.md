# Express In-Memory Example

> DO NOT USE THIS EXAMPLE IN PRODUCTION

## How it works

The Model in [model.js](./model.js) implements
the [minimal required model specifications](https://node-oauthoauth2-server.readthedocs.io/en/master/model/spec.html#).
It does only store the credentials in memory, which means that any active session dumped when the express app is
restarted.

The express app is using the model when creating a new OAuthServer in [index.js](./index.js).

## Run the example

This example uses the Password grant, which is very simple to understand.

1. run the app

```shell
node index.js
```

2. Open a new terminal and get a token from the `/token` endpoint

```shell
curl -d "grant_type=password&username=jdoe&password=foobarbaz"  -u "doeclient:foobarbaz" "http://localhost:3000/token"
```

It should return a json response, something like this

```json
{
  "access_token": "abe2eb52cf61d62b28ac503befc1b49405858f265aee0daf0e0f51faf656b03d",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "bc771863a272a89d6efcdd6ba35ff387e0143f4d1c7db527f722221a290b6adc"
}
```

3. access the `/secret` route with the token

```shell
curl -i -H "Authorization: Bearer abe2eb52cf61d62b28ac503befc1b49405858f265aee0daf0e0f51faf656b03d" http://localhost:3000/secret
```

It should return a response like this

```shell
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 11
ETag: W/"b-0OPwxEnRaKDD5DIcpNepVAAxO4E"
Date: Fri, 26 Jul 2024 08:10:23 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Secret area
```

# Dump

You can also dump the contents of the memory store (for debugging) like so:

```js
memorystore.dump();
```
