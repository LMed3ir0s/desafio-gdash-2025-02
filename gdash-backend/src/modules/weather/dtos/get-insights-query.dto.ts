import { IsString, MinLength, MaxLength } from 'class-validator';

export class GetInsightsQueryDto {
  @IsString({ message: 'cityName deve ser uma string.' })
  @MinLength(2, { message: 'cityName deve ter no mínimo 2 caracteres.' })
  @MaxLength(100, { message: 'cityName deve ter no máximo 100 caracteres.' })
  cityName: string;
}