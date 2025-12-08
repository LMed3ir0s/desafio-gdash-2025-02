from pathlib import Path
from dotenv import load_dotenv

# Carrega variáveis de ambiente a partir de um arquivo .env.
# Se nenhum caminho for informado, usa .env na raiz do projeto.
def load_environment(dotenv_path: str | None = None) -> None:
    # Calcula o caminho padrão do .env na raiz
    if dotenv_path is None:
        project_root = Path(__file__).resolve().parents[2]
        dotenv_path = project_root / ".env"

    # Carrega chaves/valores do .env sem sobrescrever variáveis já definidas.
    load_dotenv(dotenv_path=dotenv_path, override=False)
