export interface User {
    id: string
    email: string
    role: "admin" | "user"
    createdAt?: string
    updatedAt?: string
}

// Payload para criar novo usuário.
export interface CreateUserPayload {
    email: string
    password: string
}

// Payload para atualizar usuário existente.
export interface UpdateUserPayload {
    email?: string
    password?: string
}
