package worker

import (
    "encoding/json"
    "fmt"
    "log"
     amqp "github.com/rabbitmq/amqp091-go"
)

// Abre conexão com RabbitMQ e delega o processamento ao serviço.
func StartConsumer(config *Config, weatherService *WeatherService) error {
    // Conecta ao broker RabbitMQ usando a URL de configuração.
    rabbitMQConnection, err := amqp.Dial(config.RabbitMQURL)
    if err != nil {
        return fmt.Errorf("falha ao conectar no RabbitMQ: %w", err)
    }

    defer rabbitMQConnection.Close()

    // Abre um canal lógico dentro da conexão AMQP.
    rabbitMQChannel, err := rabbitMQConnection.Channel()
    if err != nil {
        return fmt.Errorf("falha ao abrir canal no RabbitMQ: %w", err)
    }

    defer rabbitMQChannel.Close()

    // Garante que a fila exista (idempotente se já existir).
    // Nome da fila, durable, auto-delete, exclusive, no-wait, args
    _, err = rabbitMQChannel.QueueDeclare(
        config.RabbitMQQueue,
        true,
        false,
        false,
        false,
        nil,
    )

    if err != nil {
        return fmt.Errorf("falha ao declarar fila %s: %w", config.RabbitMQQueue, err)
    }

    // Registra o consumidor na fila para começar a receber mensagens.
    // queue, consumer tag, auto-ack (false para ack manual), exclusive, no-local (ignorado), no-wait, args
    messagesFromQueue, err := rabbitMQChannel.Consume(
        config.RabbitMQQueue,
        "",
        false,
        false,
        false,
        false,
        nil,
    )
    if err != nil {
        return fmt.Errorf("falha ao registrar consumer na fila %s: %w", config.RabbitMQQueue, err)
    }

    log.Printf("Worker aguardando mensagens na fila %s...", config.RabbitMQQueue)

    // Loop principal de consumo de mensagens da fila.
    for message := range messagesFromQueue {
        var payload WeatherPayload

        // Converte o JSON da fila (bytes) para struct WeatherPayload.
        if err := json.Unmarshal(message.Body, &payload); err != nil {
            log.Printf("Erro ao desserializar mensagem da fila: %v", err)
            // Mensagem inválida é descartada (sem requeue).
            _ = message.Nack(false, false)
            continue
        }

        // Processa o payload na camada de serviço (validação + chamada HTTP).
        if err := weatherService.ProcessMessage(payload); err != nil {
            log.Printf("Erro ao processar mensagem: %v", err)
            // Em caso de erro de processamento, reenvia para fila (retry simples).
            _ = message.Nack(false, true)
            continue
        }

        // Confirma que a mensagem foi processada com sucesso (remove da fila).
        if err := message.Ack(false); err != nil {
            log.Printf("Erro ao confirmar ack da mensagem: %v", err)
        }
    }

    log.Println("Canal de consumo fechado.")
    return nil
}
