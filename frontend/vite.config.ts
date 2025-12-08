import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"

// Configuração do Vite com alias '@' apontando para 'src'.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
