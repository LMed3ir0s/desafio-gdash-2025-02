import logging
from typing import Literal

# Define os níveis de log aceitos como tipo estático.
LogLevel = Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]


# Configura o logging global da aplicação (nível + formato padrão).
def configure_logging(level: LogLevel = "INFO") -> None:
    # Converte string de nível em constante numérica do módulo logging.
    numeric_level = getattr(logging, level.upper(), logging.INFO)

    # Define nível mínimo e formato de saída dos logs na aplicação inteira.
    logging.basicConfig(
        level=numeric_level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )

# Helper para obter um logger nomeado reutilizável por módulo.
# Exemplo de uso:
#     logger = get_logger(__name__)
#     logger.info("Mensagem de log")
def get_logger(name: str = "collector") -> logging.Logger:
    return logging.getLogger(name)
