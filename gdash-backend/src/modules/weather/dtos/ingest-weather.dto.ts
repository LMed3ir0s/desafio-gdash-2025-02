import { IsNotEmpty, IsNumber, IsString, Min, Max, MinLength, MaxLength, IsDateString, IsOptional } from 'class-validator';

export class IngestWeatherDto {

  // -------------------------------------------------------------
  // Cidade onde foi coletada
  // -------------------------------------------------------------
  @IsString()
  @IsNotEmpty({ message: 'A cidade não pode ficar vazia' })
  @MinLength(2)
  @MaxLength(100)
  cityName: string;

  // Cidade Requisitada para query
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  cityQueryKey: string;

  // -------------------------------------------------------------
  // Temperatura em °C
  // -------------------------------------------------------------
  @IsNumber()
  @IsNotEmpty({ message: 'A temperatura não pode estar vazia' })
  @Min(-50, { message: 'Temperatura muito baixa' })
  @Max(60, { message: 'Temperatura muito alta' })
  temperature: number;

  // -------------------------------------------------------------
  // Umidade relativa (%)
  // -------------------------------------------------------------
  @IsNumber()
  @IsNotEmpty({ message: 'A umidade não pode estar vazia' })
  @Min(0, { message: 'A umidade não pode ser negativa' })
  @Max(100, { message: 'A umidade não pode exceder 100%.' })
  humidity: number;

  // -------------------------------------------------------------
  // Velocidade do vento (km/h)
  // -------------------------------------------------------------
  @IsNumber()
  @IsNotEmpty({ message: 'A velocidade do vento não pode estar vazia' })
  @Min(0, { message: 'A velocidade do vento não pode ser negativa' })
  windSpeed: number;

  // -------------------------------------------------------------
  // Data/hora da coleta (opcional)
  // -------------------------------------------------------------
  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}
