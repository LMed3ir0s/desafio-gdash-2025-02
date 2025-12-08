import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // -----------------------------------------
  // Validação global DTOs
  // -----------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // -----------------------------------------
  // Interceptor global de logging (req/res)
  // -----------------------------------------
  app.useGlobalInterceptors(new LoggingInterceptor());

  // -----------------------------------------
  // Libera acesso ao backend
  // -----------------------------------------
  app.enableCors();

  // -----------------------------------------
  // Prefixo global da API
  // -----------------------------------------
  app.setGlobalPrefix('api');

  // -----------------------------------------
  // CONFIGURAÇÃO DO SWAGGER
  // -----------------------------------------
  const config = new DocumentBuilder()
    .setTitle('GDash - weatherAPI')
    .setDescription('Documentação da API Desafio GDash - dashboard do clima')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
