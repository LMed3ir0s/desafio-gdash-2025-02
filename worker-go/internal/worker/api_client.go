package worker

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "strings"
    "time"
)

// WeatherAPIClient define o contrato para envio de logs climáticos à API.
type WeatherAPIClient interface {
    SendWeatherLog(payload WeatherPayload) error
}

// HTTPWeatherAPIClient é a implementação concreta via HTTP.
type HTTPWeatherAPIClient struct {
    cfg        *Config
    httpClient *http.Client
}

// NewHTTPWeatherAPIClient cria um cliente HTTP com base na Config.
func NewHTTPWeatherAPIClient(cfg *Config) *HTTPWeatherAPIClient {
    return &HTTPWeatherAPIClient{
        cfg: cfg,
        httpClient: &http.Client{
            Timeout: 5 * time.Second, // timeout global da requisição
        },
    }
}

// buildURL monta a URL completa juntando base + endpoint, cuidando das barras.
func (client *HTTPWeatherAPIClient) buildURL() string {
    base := strings.TrimRight(client.cfg.APIBaseURL, "/")
    path := strings.TrimLeft(client.cfg.APIWeatherEndpoint, "/")
    return fmt.Sprintf("%s/%s", base, path)
}

// SendWeatherLog envia o payload climático para a API NestJS.
func (client *HTTPWeatherAPIClient) SendWeatherLog(payload WeatherPayload) error {
    // Serializa o payload em JSON.
    requestBody, err := json.Marshal(payload)
    if err != nil {
        return fmt.Errorf("falha ao serializar payload para JSON: %w", err)
    }

    endpointURL := client.buildURL()

    // Cria requisição POST com body JSON.
    request, err := http.NewRequest(http.MethodPost, endpointURL, bytes.NewBuffer(requestBody))
    if err != nil {
        return fmt.Errorf("falha ao criar requisição HTTP: %w", err)
    }

    // Define cabeçalho indicando JSON.
    request.Header.Set("Content-Type", "application/json")

    // Executa a requisição.
    response, err := client.httpClient.Do(request)
    if err != nil {
        return fmt.Errorf("erro ao chamar API NestJS: %w", err)
    }
    defer response.Body.Close()

    // Considera sucesso apenas status 2xx.
    if response.StatusCode < 200 || response.StatusCode >= 300 {
        return fmt.Errorf("API NestJS retornou status inesperado: %d", response.StatusCode)
    }

    // nil indica que não houve erro (erro == nil).
    return nil
}