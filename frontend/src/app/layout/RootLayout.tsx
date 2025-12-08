import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "@/app/providers/AuthProvider"
import { Button } from "@/components/ui/button"

// Layout com navegação entre Dashboard, Usuários e Explorar.
export function RootLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isAdmin = user?.role === "admin"

  // Verifica se a rota está ativa para estilizar o link.
  const isActivePath = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold">GDash</span>

            {user && (
              <>
                <Button
                  asChild
                  variant={isActivePath("/dashboard") ? "default" : "ghost"}
                  size="sm"
                >
                  <Link to="/dashboard">Dashboard</Link>
                </Button>

                {isAdmin && (
                  <Button
                    asChild
                    variant={isActivePath("/users") ? "default" : "ghost"}
                    size="sm"
                  >
                    <Link to="/users">Usuários</Link>
                  </Button>
                )}

                <Button
                  asChild
                  variant={isActivePath("/explorar") ? "default" : "ghost"}
                  size="sm"
                >
                  <Link to="/explorar">Explorar</Link>
                </Button>
              </>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sair
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
