// Registro de log de clima.
export interface WeatherLog {
    id: string
    city: string
    temperature: number
    humidity: number
    windSpeed: number 
    pressure?: number
    condition?: string
    recordedAt: string
}

// Resumo agregado de clima.
export interface WeatherSummary {
    totalLogs: number
    averageTemperature: number
    averageHumidity: number
    minTemperature?: number
    maxTemperature?: number
}

// Insights de clima gerados pelo backend.
export interface WeatherInsights {
    averageTemperature: number
    averageHumidity: number
    trend: "subindo" | "descendo" | "estável"
    comfortScore: number
    classification: string
    alerts: string[]
    summaryText: string
    recommendations: string[]
}

// Gráfico no Dashborad
export interface WeatherLogPoint {
  recordedAt: string
  temperature: number
  humidity: number
  windSpeed: number
}