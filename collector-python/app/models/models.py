from dataclasses import dataclass
from datetime import datetime
from .value_objects import City

# Agregado de dados climáticos coletados em um instante específico.
@dataclass
class WeatherReading:
    # Cidade à qual esta leitura de clima pertence.
    city: City
    # Temperatura em graus Celsius.
    temperature: float
    # Umidade relativa do ar em porcentagem.
    humidity: float
    # Velocidade do vento em km/h (ou unidade convertida para o backend).
    wind_speed: float
    # Momento em que o dado foi coletado (timestamp).
    recorded_at: datetime
