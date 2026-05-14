const FB_BASE = 'https://graph.facebook.com/v19.0';

export async function callFbApi({ path, method = 'GET', token, body, params = {} }) {
  const url = new URL(`${FB_BASE}${path}`);
  url.searchParams.set('access_token', token);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  const options = {
    method,
    cache: 'no-store',
  };

  if (body && method !== 'GET') {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url.toString(), options);
  const json = await res.json();

  if (json.error) {
    const err = new Error(json.error.message);
    err.code = json.error.code;
    err.type = json.error.type;
    throw err;
  }

  return json;
}

export function getTokenFromRequest(request) {
  const token = request.headers.get('x-fb-token');
  return token;
}
