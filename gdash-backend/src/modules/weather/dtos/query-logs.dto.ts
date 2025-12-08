import { IsOptional, IsDateString, IsEnum, IsNumber, Min, IsString, MinLength, MaxLength } from 'class-validator';

export enum InsightQueryType {
  RAW = 'raw',            // registros brutos (tabela)
  TIMESERIES = 'timeseries', // dados agregados por intervalo (gráficos)
  SUMMARY = 'summary',       // médias, máximos, mínimos
}

export enum GroupBy {
  NONE = 'none',
  HOUR = 'hour',
  THREE_HOURS = '3h',
  DAY = 'day',
}

export class QueryLogsDto {
  // -------------------------------------------------------------
  // Cidade Requisitada para query
  // -------------------------------------------------------------
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  cityQueryKey: string;

  // -------------------------------------------------------------
  // Intervalo de tempo
  // -------------------------------------------------------------
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  // -------------------------------------------------------------
  // Lookback (últimas X horas/dias)
  // -------------------------------------------------------------
  @IsOptional()
  @IsNumber()
  @Min(1)
  lastHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  lastDays?: number;

  // -------------------------------------------------------------
  // Paginação
  // -------------------------------------------------------------
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  // -------------------------------------------------------------
  // Tipo de consulta (tabela, gráfico, resumo)
  // -------------------------------------------------------------
  @IsOptional()
  @IsEnum(InsightQueryType)
  type?: InsightQueryType;

  // -------------------------------------------------------------
  // Agrupamento para timeseries
  // -------------------------------------------------------------
  @IsOptional()
  @IsEnum(GroupBy)
  groupBy?: GroupBy;
}
