# Imagem base
FROM python:3.11

# Configurações padrões do Python dentro do container
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas as dependências
COPY requirements.txt .

# Instala dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação
COPY app ./app

# Comando padrão: executa o coletor
CMD ["python", "-m", "app.main"]
