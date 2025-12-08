import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/app/providers/AuthProvider"
import { ProtectedRoute } from "./ProtectedRoute"
import { RootLayout } from "@/app/layout/RootLayout"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { UsersPage } from "@/features/users/pages/UsersPage"
import { DashboardPage } from "@/features/weather/pages/DashboardPage"

// Define as rotas da aplicação (públicas e protegidas).
export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota pública de login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas protegidas com layout principal */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RootLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
          </Route>

          {/* Fallback para qualquer rota desconhecida */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
