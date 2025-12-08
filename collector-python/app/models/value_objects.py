from dataclasses import dataclass

# Representa uma cidade para coleta
@dataclass(frozen=True)
class City:
    # Nome da cidade (dashboard/backend).
    name: str
    # Chave usada nas queries e no banco
    query_key: str
