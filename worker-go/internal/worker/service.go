package worker

import (
    "fmt"
)

// Validação e envio do payload à API.
type WeatherService struct {
    apiClient WeatherAPIClient
}

// NewWeatherService cria uma instância de serviço com o cliente HTTP injetado.
func NewWeatherService(apiClient WeatherAPIClient) *WeatherService {
    return &WeatherService{
        apiClient: apiClient,
    }
}

// Valida o payload e o envia para a API Backend.
func (service *WeatherService) ProcessMessage(payload WeatherPayload) error {

    if payload.CityName == "" {
        return fmt.Errorf("cityName vazio no payload")
    }

    if payload.CityQueryKey == "" {
        return fmt.Errorf("cityQueryKey vazio no payload")
    }

    if payload.Temperature < -80 || payload.Temperature > 80 {
        return fmt.Errorf("temperatura fora de faixa plausível: %.2f", payload.Temperature)
    }

    if payload.Humidity < 0 || payload.Humidity > 100 {
        return fmt.Errorf("umidade fora de faixa plausível: %.2f", payload.Humidity)
    }

    if payload.WindSpeed < 0 {
        return fmt.Errorf("velocidade do vento vazia no payload")
    }

    if payload.RecordedAt == "" {
        return fmt.Errorf("recordedAt vazio no payload")
    }

    // Envia o payload validado para a API Backend via cliente HTTP.
    if err := service.apiClient.SendWeatherLog(payload); err != nil {
        return err
    }

    // nil indica que não houve erro na validação nem no envio para a API.
    return nil
}
