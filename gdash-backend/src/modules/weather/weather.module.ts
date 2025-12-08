import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherController } from './controllers/weather.controller';
import { WeatherExportController } from './controllers/weather-export.controller';
import { WeatherService } from './services/weather.service';
import { WeatherExportService } from './services/weather-export.service';
import { WeatherRepository } from './repositories/weather.repository';
import { Weather, WeatherSchema } from './schemas/weather.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
  ],
  controllers: [
    WeatherController,
    WeatherExportController,
  ],
  providers: [
    WeatherService,
    WeatherExportService,
    WeatherRepository,
  ],
  exports: [
    WeatherService,
    WeatherExportService,
    WeatherRepository,
  ],
})
export class WeatherModule {}

