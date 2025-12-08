import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/app/providers/AuthProvider"

// Protege rotas que exigem usuário autenticado.
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()

  // Se não tiver token, redireciona para /login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Se autenticado, renderiza as rotas filhas normalmente.
  return <Outlet />
}
