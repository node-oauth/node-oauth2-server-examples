import fetch from 'node-fetch';
import 'dotenv/config';

const rootUrl = 'http://localhost:8080';
const log = (...args) => console.log('[Consumer]:', ...args);
const getBody = async (response) => {
  const body = await response.text();
  log('=> response:', response.status, response.statusText, body, '\n');
  return body;
};

const request = async ({ url, method = 'get', body, headers, note = '' }) => {
  log(method, url, note && `(${note})`);
  const fullUrl = `${rootUrl}${url}`;
  const options = { method, body, headers };
  const response = await fetch(fullUrl, options);
  return getBody(response);
};

const run = async () => {
  const client = {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
  };

  await request({
    url: '/public',
    note: 'public',
  });

  await request({
    url: '/read-resource',
    note: 'not authenticated',
  });

  const wrongAuthorizationBodyParams = new URLSearchParams();
  wrongAuthorizationBodyParams.append('response_type', 'code');
  wrongAuthorizationBodyParams.append('client_id', 'wrong-id');
  wrongAuthorizationBodyParams.append('scope', 'read');
  wrongAuthorizationBodyParams.append('state', 'test');

  await request({
    url: '/authorize',
    note: 'wrong client id',
    method: 'post',
    body: wrongAuthorizationBodyParams,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const correctAuthorizationBodyParams = new URLSearchParams();
  correctAuthorizationBodyParams.append('response_type', 'code');
  correctAuthorizationBodyParams.append('client_id', client.id);
  correctAuthorizationBodyParams.append('scope', 'read');
  correctAuthorizationBodyParams.append('state', 'test');

  const authCodeBody = await request({
    url: '/authorize',
    note: 'valid credentials',
    method: 'post',
    body: correctAuthorizationBodyParams,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });

  const authorizationCode = JSON.parse(authCodeBody).authorizationCode;

  if (authorizationCode) {
    log('authorization code successfully retrieved!', '\n');
  }

  const tokenBodyParams = new URLSearchParams();
  tokenBodyParams.append('grant_type', 'authorization_code');
  tokenBodyParams.append('code', authorizationCode);
  tokenBodyParams.append('scope', 'read');
  tokenBodyParams.append('redirect_uri', 'http://localhost:8080/token');

  const tokenBody = await request({
    url: '/token',
    note: 'valid credentials',
    method: 'post',
    body: tokenBodyParams,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization:
        'Basic ' +
        Buffer.from(`${client.id}:${client.secret}`).toString('base64'),
    },
  });

  const accessToken = JSON.parse(tokenBody).access_token;
  const tokenType = JSON.parse(tokenBody).token_type;

  if (accessToken) {
    log('authorization token successfully retrieved!', '\n');
  }

  await request({
    url: '/read-resource',
    note: 'authenticated, resource is not yet defined',
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  });

  await request({
    url: '/write-resource',
    method: 'post',
    note: 'authentication failed',
    body: JSON.stringify({ value: 'foo-bar-moo' }),
    headers: {
      'content-type': 'application/json',
      authorization: `${tokenType} random-token-foo`,
    },
  });

  await request({
    url: '/write-resource',
    method: 'post',
    note: 'Invalid token',
    body: JSON.stringify({ value: 'foo-bar-moo' }),
    headers: {
      'content-type': 'application/json',
      authorization: `${tokenType} ${accessToken}`,
    },
  });

  await request({
    url: '/read-resource',
    note: 'authenticated, resource is now',
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  });
};

run().catch(console.error);
