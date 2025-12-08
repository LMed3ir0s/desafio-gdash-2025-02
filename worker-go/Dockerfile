# ---------- Stage 1: Build ----------
FROM golang:1.25-alpine AS build

# Workdir dentro da imagem de build
WORKDIR /app

# Copia arquivos de módulo primeiro (cache de dependências)
COPY go.mod go.sum ./
RUN go mod download

# Copia o restante do código
COPY . .

# Compila o binário do worker
RUN go build -o worker ./cmd/worker

# ---------- Stage 2: Run ----------
FROM alpine:3.20

# Diretório de trabalho na imagem final
WORKDIR /app

# Copia apenas o binário compilado
COPY --from=build /app/worker .

# Define variável de ambiente padrão (opcional, só para exemplo)
ENV GIN_MODE=release

# Comando padrão: executa o worker
CMD ["./worker"]
