// Formata temperatura em °C com 1 casa, ou N/A.
export function formatTemperature(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return "N/A"
    return `${value.toFixed(1)}°C`
}

// Formata umidade em % com 1 casa, ou N/A.
export function formatHumidity(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return "N/A"
    return `${value.toFixed(1)}%`
}

// Formata contagem de registros (fallback 0).
export function formatLogCount(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return "0"
    return value.toString()
}
