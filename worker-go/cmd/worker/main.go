package main

import (
	"log"
 	"gdash-worker/internal/worker"
)

func main() {
	// Carrega configuração das variáveis de ambiente.
	config, err := worker.LoadConfig()

	if err != nil {
		log.Fatalf("falha ao carregar as configurações: %v", err)
	}

	// Injeta cliente HTTP para chamar a API NestJS.
	apiClient := worker.NewHTTPWeatherAPIClient(config)

	// Injeta Service para validar payload
	weatherService := worker.NewWeatherService(apiClient)

	// Inicia consumo da fila
	if err := worker.StartConsumer(config, weatherService); err != nil {
		log.Fatalf("falha ao iniciar consumer: %v", err)
	}
}