import { type User } from "../types/user.types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UsersTableProps {
    users: User[] // Lista de usuários para exibição.
    onEdit: (user: User) => void // Callback para editar usuário.
    onDelete: (user: User) => void // Callback para remover usuário.
}

// Tabela simples de usuários com ações de editar/remover.
export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  const hasUsers = users.length > 0

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>E-mail</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="w-[160px] text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {hasUsers &&
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "outline"}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : "-"}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(user)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(user)}
                >
                  Remover
                </Button>
              </TableCell>
            </TableRow>
          ))}

        {!hasUsers && (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
              Nenhum usuário cadastrado. Clique em “Novo usuário” para criar o primeiro.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
