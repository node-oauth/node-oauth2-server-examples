# Multi-Factor Authentication Example with @node-oauth/oauth2-server

This is a rough example on how to implement multi-factor authentication with @node-oauth/oauth2-server.

**DO NOT use this exact example in production** we are using everything in memory and besides, it's not fully implemented.

## Note!

This does not follow any RFC guidelines per say, maybe it follows [Section 9](https://datatracker.ietf.org/doc/html/rfc6749#section-9)...but either way this should be taken as a custom solution -- this is not a custom extension grant nor a custom middleware -- it is simply a modification of the [authorization_code request RFC 4.1.1](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1) -- we add a custom property called 'two_factor_code' (or whatever you want), and we execute an additional requests after step (B) (we call it step (M) and (M2)). Here is the change to the authorization code grant (keep in mind that this can work for other grant types).

```txt
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
     |         -+----(M)------- Session ---------<|               |
     |          |                                 |               |
     |          |       MFA Code Authenticate     |               |
     |         -+--(M2)------- w/session -------->|               |
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

### How to use this example

This is a backend only, so you will need some type of API development tool (like Postman) to test the endpoints out.

Also keep in mind we are missing the client in this example.

1. Send a POST request to the `/api/login` endpoint
* ```json
    {
	    "email": "daniel@gmail.com",
	    "password": "password"
    }
   ```

2. Send a POST request to the `/api/authorize` endpoint, if successful, this will give us our authorization code.


3. From here, we can use the authorization flow to go to the callback URL and so on to get our access token, but this is as far as the example will go.

