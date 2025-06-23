export function getToken() {
  return localStorage.getItem('token');
}

export function saveToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function getTokenPayload() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Normalize claim-based keys
    payload.role =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    payload.userId =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    payload.email =
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

    return payload;
  } catch (err) {
    console.error('Invalid token:', err);
    return null;
  }
}
