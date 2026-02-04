import fetch from 'node-fetch';

const rootUrl = 'http://localhost:8080';
const log = (...args) => console.log(...args);
const getBody = async response => {
  const body = await response.text();
  log('[Provider]:', response.status, response.statusText, body, '\n');
  return body;
};

const request = async ({ url, method = 'get', body, headers, note = '' }) => {
  log('[Consumer]:', method, url, note && `(${note})`);
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
    note: 'public'
  });

  await request({
    url: '/read-resource',
    note: 'not authenticated'
  });

  const tokenBodyParams = new URLSearchParams();
  tokenBodyParams.append('grant_type', 'client_credentials');
  tokenBodyParams.append('scope', 'read');

  await request({
    url: '/token',
    note: 'bad credentials',
    method: 'post',
    body: tokenBodyParams,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'authorization': 'Basic ' + Buffer.from('wrongId:wrongSecret').toString('base64'),
    }
  });

  const body = await request({
    url: '/token',
    note: 'valid credentials',
    method: 'post',
    body: tokenBodyParams,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'authorization': 'Basic ' + Buffer.from(`${client.id}:${client.secret}`).toString('base64'),
    }
  });


  const token = JSON.parse(body);
  const accessToken = token.access_token;
  const tokenType = token.token_type;

  if (accessToken && tokenType) {
    log('authorization token successfully retrieved!', '\n');
  }

  await request({
    url: '/read-resource',
    note: 'authenticated, resource is not yet defined',
    headers: {
      'authorization': `${tokenType} ${accessToken}`
    }
  });

  await request({
    url: '/write-resource',
    method: 'post',
    note: 'authentication failed',
    body: JSON.stringify({ value: 'foo-bar-moo' }),
    headers: {
      'content-type': 'application/json',
      'authorization': `${tokenType} random-token-foo`
    }
  });

  await request({
    url: '/write-resource',
    method: 'post',
    note: 'Invalid token',
    body: JSON.stringify({ value: 'foo-bar-moo' }),
    headers: {
      'content-type': 'application/json',
      'authorization': `${tokenType} ${accessToken}`
    }
  });


  await request({
    url: '/read-resource',
    note: 'authenticated, resource is now',
    headers: {
      'authorization': `${tokenType} ${accessToken}`
    }
  });
};

run().catch(console.error);
