type ApiRequestParams = {
  method: string;
  url: string;
  auth?: boolean;
  body?: object;
  token?: string;
  headers?: Record<string, string>;
};

export async function apiRequest({
  method,
  url,
  auth,
  body,
  token,
  headers = {},
}: ApiRequestParams): Promise<Response> {
  const reqHeaders: Record<string, string> = { ...headers };

  if (auth && token) {
    reqHeaders['Authorization'] = `Token ${token}`;
  }

  if (body) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    method,
    headers: reqHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
