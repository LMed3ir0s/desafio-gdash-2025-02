const TOKEN_KEY = "gdash_access_token"

// Gerencia o token JWT no localStorage.
export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY)
}

// Salva o token JWT no localStorage.
export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token)
}

// Remove o token JWT do localStorage.
export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY)
}
