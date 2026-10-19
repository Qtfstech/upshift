import {BACKEND_URL} from '../config';

const TOKEN_KEY = 'upshift-dashboard:token';

export function sessionToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setToken(token: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage blocked: signed in for this page load only */
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Call the backend with the admin's sign-in token. Throws ApiError with the server's message. */
export async function api<T = unknown>(path: string, init: RequestInit & {json?: unknown} = {}): Promise<T> {
  const {json, ...rest} = init;
  const token = sessionToken();
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL.replace(/\/+$/, '')}/api${path}`, {
      ...rest,
      headers: {
        ...(json !== undefined ? {'Content-Type': 'application/json'} : {}),
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
        ...rest.headers,
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError(0, "Couldn't reach the dashboard server. Check the internet connection and that the backend is running.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? `The server returned an error (${res.status}).`);
  return body as T;
}
