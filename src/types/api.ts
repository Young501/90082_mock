export type ApiEndpoint = {
  method: string;
  url: string;
};

export type ApiRequestParams = {
  endpoint: ApiEndpoint;
  body?: object | FormData;
  token?: string;
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
};
