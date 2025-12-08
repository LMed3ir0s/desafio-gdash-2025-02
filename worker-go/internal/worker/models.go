package worker

// WeatherPayload representa o JSON recebido da fila (produzido pelo collector).
type WeatherPayload struct {
	CityName string `json:"cityName"`
	CityQueryKey string `json:"cityQueryKey"`
    Temperature float64 `json:"temperature"`
    Humidity float64 `json:"humidity"`
    WindSpeed float64 `json:"windSpeed"`
    RecordedAt string
}