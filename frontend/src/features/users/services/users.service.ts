import { apiClient } from "@/lib/api-client"
import type { User, CreateUserPayload, UpdateUserPayload } from "../types/user.types"

const BASE_PATH = "/api/users"

// Lista usuários paginados (apenas ADMIN)
export async function listUsers(page = 1, limit = 50): Promise<User[]> {
    const query = `?page=${page}&limit=${limit}`
    return apiClient.get<User[]>(`${BASE_PATH}${query}`)
}

// Busca usuário por ID (apenas ADMIN).
export async function getUserById(id: string): Promise<User> {
    return apiClient.get<User>(`${BASE_PATH}/${id}`)
}

// Cria novo usuário (rota pública).
export async function createUser(payload: CreateUserPayload): Promise<User> {
    return apiClient.post<User>(BASE_PATH, payload, { skipAuth: true })
}

// Atualiza usuário parcialmente (apenas ADMIN).
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    return apiClient.patch<User>(`${BASE_PATH}/${id}`, payload)
}

// Remove usuário por ID (apenas ADMIN).
export async function deleteUser(id: string): Promise<void> {
    await apiClient.delete<void>(`${BASE_PATH}/${id}`)
}
