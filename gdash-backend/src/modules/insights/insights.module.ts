import { Module } from '@nestjs/common';
import { WeatherModule } from '../weather/weather.module';
import { InsightsController } from './controllers/insights.controller';
import { InsightsService } from './services/insights.service';

@Module({
  imports: [WeatherModule],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}
