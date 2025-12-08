// Página de gerenciamento de usuários (lista + criar/editar/remover).
import { useEffect, useState } from "react"
import { UsersTable } from "../components/UsersTable"
import { UserFormDialog } from "../components/UserFormDialog"
import { listUsers, createUser, updateUser, deleteUser } from "../services/users.service"
import type { User } from "../types/user.types"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)

    const { toast } = useToast()

    // Carrega lista de usuários ao montar a página.
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoadError(null)
                const data = await listUsers(1, 50)
                setUsers(data)
            } catch (error: any) {
                console.error("Erro ao listar usuários:", error)
                setLoadError(error?.message ?? "Falha ao carregar usuários.")
                toast({
                    variant: "destructive",
                    title: "Erro ao carregar usuários",
                    description: error?.message ?? "Tente novamente mais tarde.",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchUsers()
    }, [toast])

    // Abre dialog em modo criação.
    const handleOpenCreate = () => {
        setSelectedUser(null)
        setDialogMode("create")
        setDialogOpen(true)
    }

    // Abre dialog em modo edição.
    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setDialogMode("edit")
        setDialogOpen(true)
    }

    // Pede confirmação e remove usuário.
    const handleDelete = async (user: User) => {
        const confirmed = window.confirm(`Remover usuário ${user.email}?`)
        if (!confirmed) {
            return
        }

        try {
            await deleteUser(user.id)
            setUsers((prev) => prev.filter((u) => u.id !== user.id))
            toast({
                title: "Usuário removido com sucesso.",
            })
        } catch (error: any) {
            console.error("Erro ao remover usuário:", error)
            toast({
                variant: "destructive",
                title: "Erro ao remover usuário",
                description: error?.message ?? "Tente novamente mais tarde.",
            })
        }
    }

    // Envia formulário de criação/edição.
    const handleSubmitForm = async (data: { email: string; password?: string }) => {
        setIsSubmitting(true)

        try {
            if (dialogMode === "create") {
                const created = await createUser({
                    email: data.email,
                    password: data.password ?? "",
                })
                setUsers((prev) => [...prev, created])
                toast({ title: "Usuário criado com sucesso." })
                setDialogOpen(false)
                return
            }

            if (dialogMode === "edit" && selectedUser) {
                const updated = await updateUser(selectedUser.id, {
                    email: data.email,
                    password: data.password,
                })
                setUsers((prev) =>
                    prev.map((u) => (u.id === updated.id ? updated : u)),
                )
                toast({ title: "Usuário atualizado com sucesso." })
                setDialogOpen(false)
            }
        } catch (error: any) {
            console.error("Erro ao salvar usuário:", error)
            toast({
                variant: "destructive",
                title: "Erro ao salvar usuário",
                description: error?.message ?? "Verifique os dados e tente novamente.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <p className="text-sm text-muted-foreground">
                Carregando usuários...
            </p>
        )
    }

    if (loadError) {
        return (
            <div className="space-y-3">
                <p className="text-sm text-destructive">
                    Erro ao carregar usuários: {loadError}
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                >
                    Tentar novamente
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Usuários</h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie contas de acesso ao dashboard.
                    </p>
                </div>
                <Button onClick={handleOpenCreate}>Novo usuário</Button>
            </div>

            <UsersTable users={users} onEdit={handleEdit} onDelete={handleDelete} />

            <UserFormDialog
                open={dialogOpen}
                mode={dialogMode}
                initialUser={selectedUser}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSubmitForm}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
