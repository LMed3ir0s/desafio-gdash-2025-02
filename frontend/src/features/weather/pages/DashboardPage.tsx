import { useEffect, useState } from "react"
import { getWeatherSummary, getWeatherInsights, downloadWeatherCsv, downloadWeatherXlsx, getWeatherLogsLastHours } from "../services/weather.service"
import type { WeatherSummary, WeatherInsights, WeatherLogPoint } from "../types/weather.types"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { formatHumidity, formatLogCount, formatTemperature } from "@/lib/formatters"
import { Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import { Cloud, Droplets, Wind, Thermometer, TrendingUp, AlertCircle, Download } from 'lucide-react'

// Página principal do dashboard de clima (logs + resumo + insights + export + gráficos).
export function DashboardPage() {
  const [summary, setSummary] = useState<WeatherSummary | null>(null)
  const [insights, setInsights] = useState<WeatherInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false)
  const [isDownloadingXlsx, setIsDownloadingXlsx] = useState(false)
  const [chartData, setChartData] = useState<WeatherLogPoint[]>([])
  const [selectedRange, setSelectedRange] = useState<24 | 48 | 168>(24)

  const { toast } = useToast()

  // Valores fixos iniciais (pode virar filtro depois)
  const today = new Date().toISOString().slice(0, 10)
  const cityQueryKey = "brasilia_df"
  const cityName = "Brasilia-DF"

  // Helpers para montar intervalo diário em ISO
  const startOfDayIso = `${today}T00:00:00.000Z`
  const endOfDayIso = `${today}T23:59:59.999Z`

  // Função que busca dados do range selecionado
  async function updateChart(hours: 24 | 48 | 168) {
    try {
      setSelectedRange(hours)
      const data = await getWeatherLogsLastHours(hours, "brasilia_df")
      setChartData(data)
    } catch (error: any) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados do gráfico",
        description: error?.message ?? "Tente novamente."
      })
    }
  }

  // Carrega resumo, insights e dados para gráficos ao montar a página
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [summaryData, insightsData, chartsData] = await Promise.all([
          getWeatherSummary(today, cityQueryKey),
          getWeatherInsights(cityName),
          getWeatherLogsLastHours(168, cityQueryKey),
        ])

        setSummary(summaryData)
        setInsights(insightsData)
        setChartData(chartsData)
      } catch (error: any) {
        console.error("Erro ao carregar dados de clima:", error)
        toast({
          variant: "destructive",
          title: "Erro ao carregar dashboard",
          description: error?.message ?? "Tente novamente mais tarde.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Dispara download de CSV
  const handleDownloadCsv = async () => {
    setIsDownloadingCsv(true)
    try {
      await downloadWeatherCsv({
        cityName,
        cityQueryKey,
        start: startOfDayIso,
        end: endOfDayIso,
      })
      toast({ title: "CSV de clima baixado com sucesso." })
    } catch (error: any) {
      console.error("Erro ao baixar CSV:", error)
      toast({
        variant: "destructive",
        title: "Erro ao baixar CSV",
        description: error?.message ?? "Tente novamente mais tarde.",
      })
    } finally {
      setIsDownloadingCsv(false)
    }
  }

  // Dispara download de XLSX
  const handleDownloadXlsx = async () => {
    setIsDownloadingXlsx(true)
    try {
      await downloadWeatherXlsx({
        cityName,
        cityQueryKey,
        start: startOfDayIso,
        end: endOfDayIso,
      })
      toast({ title: "XLSX de clima baixado com sucesso." })
    } catch (error: any) {
      console.error("Erro ao baixar XLSX:", error)
      toast({
        variant: "destructive",
        title: "Erro ao baixar XLSX",
        description: error?.message ?? "Tente novamente mais tarde.",
      })
    } finally {
      setIsDownloadingXlsx(false)
    }
  }

  // Métrica card reutilizável
  const MetricCard = ({
    title,
    value,
    unit,
    icon: Icon,
    color,
    description
  }: {
    title: string
    value: string | number
    unit: string
    icon: any
    color: string
    description?: string
  }) => (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-10 rounded-full -mr-10 -mt-10`}></div>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}<span className="text-lg ml-1">{unit}</span></p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={`${color} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground mt-4">Carregando dados de clima...</p>
        </div>
      </div>
    )
  }

  // Render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Clima</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {cityName} • {new Date(today).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCsv}
            disabled={isDownloadingCsv}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {isDownloadingCsv ? "CSV..." : "CSV"}
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadXlsx}
            disabled={isDownloadingXlsx}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {isDownloadingXlsx ? "XLSX..." : "XLSX"}
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Registros"
            value={formatLogCount(summary.totalLogs)}
            unit="logs"
            icon={Cloud}
            color="bg-blue-500"
            description="Dados coletados"
          />
          <MetricCard
            title="Temperatura Atual"
            value={formatTemperature(summary.averageTemperature)}
            unit="°C"
            icon={Thermometer}
            color="bg-orange-500"
            description="Média do dia"
          />
          <MetricCard
            title="Mínima"
            value={formatTemperature(summary.minTemperature)}
            unit="°C"
            icon={TrendingUp}
            color="bg-blue-400"
            description={`Máxima: ${formatTemperature(summary.maxTemperature)}°C`}
          />
          <MetricCard
            title="Umidade"
            value={formatHumidity(summary.averageHumidity)}
            unit="%"
            icon={Droplets}
            color="bg-cyan-500"
            description="Média"
          />
          <MetricCard
            title="Registros"
            value={summary.totalLogs}
            unit="pts"
            icon={Wind}
            color="bg-green-500"
            description="Pontos de dados"
          />
        </div>
      )}

      {/* Gráficos */}
      {chartData.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Gráfico de Temperatura e Umidade */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5" />
                  Temperatura & Umidade ({selectedRange}h)
                </CardTitle>

                <div className="flex gap-2">
                  <Button
                    variant={selectedRange === 24 ? "default" : "outline"}
                    onClick={() => updateChart(24)}
                  >
                    24h
                  </Button>

                  <Button
                    variant={selectedRange === 48 ? "default" : "outline"}
                    onClick={() => updateChart(48)}
                  >
                    48h
                  </Button>

                  <Button
                    variant={selectedRange === 168 ? "default" : "outline"}
                    onClick={() => updateChart(168)}
                  >
                    7 dias
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="recordedAt"
                    stroke="#9ca3af"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#fff'
                    }}
                    formatter={(value) => [`${value}`, '']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorTemp)"
                    name="Temperatura (°C)"
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Umidade (%)"
                    yAxisId="right"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Velocidade do Vento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-5 h-5" />
                Velocidade do Vento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="recordedAt"
                    stroke="#9ca3af"
                    minTickGap={25}
                    tickFormatter={(value) => {
                      const d = new Date(value)

                      // Se o range é 24h → mostra só hora
                      if (selectedRange === 24) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

                      // Range 48h → mostra dia+hora
                      if (selectedRange === 48) return d.toLocaleString('pt-BR', { weekday: 'short', hour: '2-digit' })

                      // Range 168h (7 dias) → mostra só dia e data
                      return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })
                    }}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }} />
                  <Area
                    type="monotone"
                    dataKey="windSpeed"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorWind)"
                    name="Vento (m/s)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights Card */}
          {insights && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Insights de IA
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Trend + Conforto */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground">Tendência</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {insights.trend}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground">Conforto</p>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {insights.comfortScore}/100
                    </p>
                  </div>
                </div>

                {/* Recommendations = LISTA */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recomendações</p>
                  {insights.recommendations.length > 0 ? (
                    <ul className="list-disc pl-5 text-muted-foreground text-sm">
                      {insights.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhuma recomendação disponível.</p>
                  )}
                </div>

                {/* Resumo Inteligente */}
                <div className="space-y-1">
                  <p className="text-sm font-medium mt-2">Resumo Inteligente</p>
                  <p className="text-muted-foreground text-sm">{insights.summaryText}</p>
                </div>

                {/* Alerts = LISTA */}
                {insights.alerts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium mt-3">Alertas</p>
                    <ul className="list-disc pl-5 text-red-500 text-sm">
                      {insights.alerts.map((alert, idx) => (
                        <li key={idx}>{alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}