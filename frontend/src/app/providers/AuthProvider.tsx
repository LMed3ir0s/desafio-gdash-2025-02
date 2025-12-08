import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getToken, setToken, clearToken } from "@/lib/storage"
import { loginRequest } from "@/features/auth/services/auth.service"
import type { LoginPayload } from "@/features/auth/types/auth.types"

// Representa o usuário autenticado no frontend.
interface AuthUser {
    id: string
    email: string
    role: string
}

// Interface de valores expostos pelo contexto de auth.
interface AuthContextValue {
    token: string | null
    isAuthenticated: boolean
    user: AuthUser | null
    login: (payload: LoginPayload) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

// Decodifica o payload do JWT para extrair id/email/role.
function decodeToken(token: string): AuthUser | null {
    try {
        const [, payloadPart] = token.split(".")
        if (!payloadPart) {
            return null
        }

        const json = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"))
        const payload = JSON.parse(json) as { sub?: string; email?: string; role?: string }

        if (!payload.sub || !payload.email || !payload.role) {
            return null
        }

        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        }
    } catch {
        return null
    }
}

// Fornece contexto de autenticação (token, usuário, login, logout) para toda a app.
export function AuthProvider({ children }: AuthProviderProps) {
    // Armazena o token atual em memória.
    const [token, setTokenState] = useState<string | null>(null)
    // Armazena dados decodificados do usuário autenticado.
    const [user, setUser] = useState<AuthUser | null>(null)

    // Na inicialização, lê token salvo no localStorage.
    useEffect(() => {
        const stored = getToken()
        if (!stored) {
            return
        }

        setTokenState(stored)
        const decoded = decodeToken(stored)
        setUser(decoded)
    }, [])

    // Realiza login chamando a API e salvando o token.
    const login = async (payload: LoginPayload) => {
        const { access_token } = await loginRequest(payload)
        setToken(access_token)
        setTokenState(access_token)
        const decoded = decodeToken(access_token)
        setUser(decoded)
    }

    // Faz logout limpando token e usuário do estado e do storage.
    const logout = () => {
        clearToken()
        setTokenState(null)
        setUser(null)
    }

    const value: AuthContextValue = {
        token,
        isAuthenticated: Boolean(token),
        user,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook de conveniência para consumir o contexto de auth.
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error("O useAuth deve ser usado dentro de um AuthProvider.")
    }
    return ctx
}
