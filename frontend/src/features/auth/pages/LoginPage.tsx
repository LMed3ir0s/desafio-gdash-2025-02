import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "../components/LoginForm"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RegisterForm } from "../components/RegisterForm"

export function LoginPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Acessar painel</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Não tem conta?</span>
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="px-0">
                  Criar conta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar conta</DialogTitle>
                </DialogHeader>
                <RegisterForm onSuccess={() => setIsRegisterOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}