/** Same key across shell / auth / engage MFEs so Bearer auth works when embedded in the shell. */
export const AUTH_TOKEN_STORAGE_KEY = 'comp308_group13_auth_jwt';

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
