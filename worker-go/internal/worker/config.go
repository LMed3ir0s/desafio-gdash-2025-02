package worker

import (
	"fmt"
	"os"
)

// Configurações para o worker.
type Config struct {
	RabbitMQURL string
	RabbitMQQueue string
	APIBaseURL string
	APIWeatherEndpoint string
}

// Lê variáveis de ambiente e valida valores obrigatórios.
func LoadConfig() (*Config, error) {
	cfg := &Config{
		RabbitMQURL: os.Getenv("RABBITMQ_URL"),
		RabbitMQQueue: os.Getenv("RABBITMQ_QUEUE"),
        APIBaseURL: os.Getenv("API_BASE_URL"),
        APIWeatherEndpoint: os.Getenv("API_WEATHER_ENDPOINT"),
	}

	if cfg.RabbitMQURL == "" {
		return nil, fmt.Errorf("RABBITMQ_URL não configurada")
	}

	if cfg.RabbitMQQueue == "" {
		return nil, fmt.Errorf("RABBITMQ_QUEUE não configurada")
    }

    if cfg.APIBaseURL == "" {
        return nil, fmt.Errorf("API_BASE_URL não configurada")
    }

    if cfg.APIWeatherEndpoint == "" {
        return nil, fmt.Errorf("API_WEATHER_ENDPOINT não configurada")
    }

    return cfg, nil
}
