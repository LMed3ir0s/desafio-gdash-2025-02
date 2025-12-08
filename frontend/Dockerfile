# Etapa de dependências e dev server
FROM node:20-alpine

# Define diretório de trabalho dentro do container.
WORKDIR /app

# Copia package.json e package-lock.json/yarn.lock para instalar deps.
COPY package*.json ./

# Instala dependências do frontend.
RUN npm install

# Copia o restante do código fonte.
COPY . .

# Expõe a porta padrão do Vite (dev server).
EXPOSE 5173

# Comando para rodar o Vite em modo dev acessível externamente.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
