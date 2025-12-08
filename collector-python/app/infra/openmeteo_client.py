import requests
import pandas as pd
from datetime import datetime
from typing import Any, Dict
from app.models.models import WeatherReading
from app.models.value_objects import City
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


# Cliente HTTP responsável por buscar dados na API Open-Meteo.
class OpenMeteoClient:
    # URL base da API de previsão da Open-Meteo.
    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    def __init__(self, session: requests.Session | None = None) -> None:
         # Cria sessão default.
        self._session = session or requests.Session()

        # Define um User-Agent descritivo para a API externa.
        self._session.headers.update({
            "User-Agent": "gdash-collector-python/"
        })

        # Configura retries básicos para erros transitórios.
        retry = Retry(
            total=3,              # número máx. de tentativas
            backoff_factor=0.5,   # delay exponencial entre tentativas
            status_forcelist=[500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry, pool_maxsize=10)

        # Aplica o adapter a http/https.
        self._session.mount("http://", adapter)
        self._session.mount("https://", adapter)

    # Busca a última leitura horária de clima para uma latitude/longitude.
    def fetch_latest_reading(self, lat: float, lon: float, city: City) -> WeatherReading:
        # Monta os parâmetros da chamada (temperatura, umidade e vento horários).
        params: Dict[str, Any] = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m",
            "windspeed_unit": "kmh",
            "timezone": "auto",
        }

        # Executa requisição GET com timeout curto para não travar o worker.
        resp = self._session.get(self.BASE_URL, params=params, timeout=(3, 5))
        resp.raise_for_status()  # Lança erro HTTP em caso de 4xx/5xx.

        data = resp.json()

        # Extrai o bloco de dados horários retornado pela Open-Meteo.
        hourly = data.get("hourly")
        if not hourly:
            raise RuntimeError("Resposta da Open-Meteo sem bloco 'hourly'.")
        
        # DataFrame com séries horárias.
        df = pd.DataFrame({
            "time": hourly.get("time") or [],
            "temperature": hourly.get("temperature_2m") or [],
            "humidity": hourly.get("relative_humidity_2m") or [],
            "wind_speed": hourly.get("wind_speed_10m") or []
        })

        # Garante que existe ao menos uma linha de dados.
        if df.empty:
            raise RuntimeError("Resposta da Open-Meteor incompleta para o clima horário.")
        
        # Usa a última linha disponível como “leitura mais recente”.
        latest = df.iloc[-1]

        time_str = str(latest["time"])
        temperature = float(latest["temperature"])
        humidity = float(latest["humidity"])
        wind_speed = float(latest["wind_speed"])

        # Converte timestamp ISO da API para datetime Python.
        try:
            recorded_at = datetime.fromisoformat(time_str)
        except ValueError:
            # Fallback simples se o formato vier levemente diferente.
            recorded_at = datetime.utcnow()

        # Retorna um WeatherReading pronto para ser enviado à fila.
        return WeatherReading(
            city=city,
            temperature=temperature,
            humidity=humidity,
            wind_speed=wind_speed,
            recorded_at=recorded_at,
        )
