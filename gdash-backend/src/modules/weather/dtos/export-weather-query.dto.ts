import { IsOptional, IsDateString, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class ExportWeatherQueryDto {
  // -------------------------------------------------------------
  // Cidade para exibição
  // -------------------------------------------------------------
  @IsString()
  @IsNotEmpty({ message: 'A cidade não pode ficar vazia' })
  @MinLength(2)
  @MaxLength(100)
  cityName: string;

  // -------------------------------------------------------------
  // Cidade Requisitada para query
  // -------------------------------------------------------------
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  cityQueryKey: string;
  
  // -------------------------------------------------------------
  // Data/hora inicial do intervalo
  // -------------------------------------------------------------
  @IsOptional()
  @IsDateString()
  start?: string;

  // -------------------------------------------------------------
  // Data/hora final do intervalo
  // -------------------------------------------------------------
  @IsOptional()
  @IsDateString()
  end?: string;
}
