import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherDocument = Weather & Document;

@Schema({ timestamps: true })
export class Weather {
  @Prop({ required: true, index: true })
  cityName: string;

  @Prop({ required: true, index: true })
  cityQueryKey: string;

  @Prop({ required: true, min: -50, max: 60 })
  temperature: number;
  
  @Prop({ required: true, min: 0, max: 100 })
  humidity: number;

  @Prop({ required: true, min: 0 })
  windSpeed: number;


  @Prop({ default: Date.now, index: true })
  recordedAt: Date;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
