// Dialog reutilizável para criar/editar usuário.
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { User } from "../types/user.types"

interface UserFormDialogProps {
  open: boolean // Controle de abertura do dialog.
  mode: "create" | "edit" // Modo de operação do formulário.
  initialUser?: User | null // Dados iniciais para edição.
  onClose: () => void // Fecha o dialog sem salvar.
  onSubmit: (data: { email: string; password?: string }) => Promise<void> // Envia dados para API.
  isSubmitting: boolean // Flag de loading no submit.
}

export function UserFormDialog({
  open,
  mode,
  initialUser,
  onClose,
  onSubmit,
  isSubmitting,
}: UserFormDialogProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Preenche campos quando entrar em modo edição ou criação.
  useEffect(() => {
    if (mode === "edit" && initialUser) {
      setEmail(initialUser.email)
      setPassword("")
    }

    if (mode === "create") {
      setEmail("")
      setPassword("")
    }
  }, [mode, initialUser])

  // Define título dinamicamente.
  let title = "Editar usuário"
  if (mode === "create") {
    title = "Criar usuário"
  }

  // Define placeholder da senha.
  let passwordPlaceholder = "Nova senha (opcional)"
  if (mode === "create") {
    passwordPlaceholder = "Senha do usuário"
  }

  const isPasswordRequired = mode === "create"

  // Trata o envio do formulário.
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await onSubmit({ email, password: password || undefined })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="user-email">E-mail</Label>
            <Input
              id="user-email"
              type="email"
              autoComplete="email"
              placeholder="usuario@gdash.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">
              Senha{" "}
              {mode === "edit" && (
                <span className="text-xs text-muted-foreground">
                  (deixe em branco para manter)
                </span>
              )}
            </Label>
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              placeholder={passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={isPasswordRequired}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
