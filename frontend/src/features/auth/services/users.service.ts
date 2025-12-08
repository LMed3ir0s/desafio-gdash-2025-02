import { apiClient } from "@/lib/api-client"

export interface CreateUserPayload {
    name: string
    email: string
    password: string
}

export async function createUserRequest(payload: CreateUserPayload) {
    // Rota pública: POST /api/users
    return apiClient.post("/api/users", payload, { skipAuth: true })
}
