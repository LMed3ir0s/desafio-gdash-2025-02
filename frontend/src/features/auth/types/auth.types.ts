// Payload enviado no login.
export interface LoginPayload {
  email: string
  password: string
}

// Resposta do backend no login.
export interface LoginResponse {
  access_token: string
}

// Representação opcional de um usuário “seguro” no front.
export interface SafeUser {
  id: string
  email: string
  role: string
  createdAt?: string
  updatedAt?: string
}
