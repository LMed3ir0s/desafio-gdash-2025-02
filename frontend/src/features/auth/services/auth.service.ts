import { apiClient } from "@/lib/api-client"
import type { LoginPayload, LoginResponse } from "../types/auth.types"

// Encapsula chamadas HTTP de auth.
export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  // Chama POST /auth/login e retorna o access_token.
  return apiClient.post<LoginResponse>("api/auth/login", payload, { skipAuth: true })
}
