import { apiClient } from "@/lib/api-client"
import type { WeatherLog, WeatherSummary, WeatherInsights, WeatherLogPoint } from "../types/weather.types"
import { getToken } from "@/lib/storage"


const BASE_LOGS = "/api/weather/logs"
const BASE_EXPORT = "/api/weather/export"
const BASE_INSIGHTS = "/api/weather/insights"

// shape cru vindo do backend
interface RawWeatherSummary {
    _id: string | null
    avgTemp: number
    minTemp: number
    maxTemp: number
    avgHum: number
    minHum: number
    maxHum: number
    count: number
}

// parâmetros de export genéricos
export interface WeatherExportParams {
    cityName: string
    cityQueryKey: string
    start?: string // ISO
    end?: string   // ISO
}

// Lista logs de clima mais recentes.
export async function listWeatherLogs(): Promise<WeatherLog[]> {
    return apiClient.get<WeatherLog[]>(`${BASE_LOGS}/latest`)
}

// Busca resumo agregado de clima.
export async function getWeatherSummary(
    date: string,
    cityQueryKey: string,
): Promise<WeatherSummary> {
    const params = new URLSearchParams({ date, cityQueryKey })
    const raw = await apiClient.get<RawWeatherSummary>(
        `${BASE_LOGS}/summary?${params.toString()}`,
    )

    return {
        totalLogs: raw.count,
        averageTemperature: raw.avgTemp,
        averageHumidity: raw.avgHum,
        minTemperature: raw.minTemp,
        maxTemperature: raw.maxTemp,
    }
}

// Busca insights de clima com IA/regra de negócio.
export async function getWeatherInsights(cityName: string): Promise<WeatherInsights> {
    const params = new URLSearchParams({ cityName })
    const raw = await apiClient.get<any>(`${BASE_INSIGHTS}?${params.toString()}`)

    return {
        averageTemperature: raw.conditions.stats.temperature.avg,
        averageHumidity: raw.conditions.stats.humidity.avg,
        trend: raw.trends.temperatureTrend, // "estável", "subindo", "descendo"
        comfortScore: raw.calculations.qualityScore, // 65
        classification: raw.conditions.humidityBuckets.high > 0 ? "Úmida" : "Seca", // ou lógica melhor
        alerts: raw.conditions.alerts || [],
        summaryText: `${raw.count} registros coletados. Tendência: ${raw.trends.temperatureTrend}. Qualidade: ${raw.calculations.qualityScore}/100`,
        recommendations: raw.recommendations
    }
}

// Busca logs das últimas N horas e formata para gráfico
export async function getWeatherLogsLastHours(hours: number, cityQueryKey: string): Promise<WeatherLogPoint[]> {
    const params = new URLSearchParams({
        hours: hours.toString(),
        cityQueryKey,
    })

    const logs = await apiClient.get<any[]>(`${BASE_LOGS}/last-hours?${params.toString()}`)

    // Formata para exibição no gráfico
    return logs.map(log => ({
        recordedAt: new Date(log.recordedAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        temperature: log.temperature,
        humidity: log.humidity,
        windSpeed: log.windSpeed,
    }))
}

// Faz download do CSV de clima.
export async function downloadWeatherCsv(
    params: WeatherExportParams,
): Promise<void> {
    const searchParams = buildExportSearchParams(params)
    await downloadFile(
        `${BASE_EXPORT}/csv?${searchParams.toString()}`,
        "weather-logs.csv",
    )
}

// Faz download do XLSX de clima.
export async function downloadWeatherXlsx(
    params: WeatherExportParams,
): Promise<void> {
    const searchParams = buildExportSearchParams(params)
    await downloadFile(
        `${BASE_EXPORT}/xlsx?${searchParams.toString()}`,
        "weather-logs.xlsx",
    )
}

// monta query string de export
function buildExportSearchParams(params: WeatherExportParams): URLSearchParams {
    const searchParams = new URLSearchParams({
        cityName: params.cityName,
        cityQueryKey: params.cityQueryKey,
    })

    if (params.start) searchParams.set("start", params.start)
    if (params.end) searchParams.set("end", params.end)

    return searchParams
}

// Baixa um arquivo do backend e dispara download no navegador.
async function downloadFile(path: string, filename: string): Promise<void> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")

    // Usa o helper de storage (TOKEN_KEY = "gdash_access_token")
    const token = getToken()

    const headers: HeadersInit = {}
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        headers,
    })

    if (!response.ok) {
        throw new Error(`Falha ao baixar arquivo (${response.status})`)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}
