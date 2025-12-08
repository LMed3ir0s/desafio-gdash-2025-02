import { useEffect, useState } from "react"
import { listWeatherLogs } from "../services/weather.service"
import type { WeatherLog, WeatherLogPoint } from "../types/weather.types"

// hook que busca logs da API
export function useWeatherData() {
  const [logs, setLogs] = useState<WeatherLogPoint[]>([]) // guarda registros
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: WeatherLog[] = await listWeatherLogs()

        const mapped: WeatherLogPoint[] = response.map(log => ({
          recordedAt: log.recordedAt,
          temperature: log.temperature,
          humidity: log.humidity,
          windSpeed: log.windSpeed,
        }))

        setLogs(mapped)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { logs, loading }
}