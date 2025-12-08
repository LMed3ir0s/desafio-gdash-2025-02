import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import databaseConfig from './config/database.config';
import { validationSchema } from './config/env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './modules/weather/weather.module';
import { InsightsModule } from './modules/insights/insights.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, databaseConfig], 
      validationSchema, // valida .env com Joi
    }),

    // inicializa o Mongo usando o ConfigService
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
      }),
    }),
    WeatherModule,
    InsightsModule,
    UsersModule,
    AuthModule,
    HealthModule
  ],
})
export class AppModule {}
