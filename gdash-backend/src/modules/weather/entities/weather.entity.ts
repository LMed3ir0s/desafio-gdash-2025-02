import { BRASILIA_BUCKETS } from "../config/climate.config";

export class WeatherEntity {
    cityName: string;
    cityQueryKey: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    recordedAt: Date;

    constructor(partial: Partial<WeatherEntity>) {
        Object.assign(this, partial);
    }

    // -------------------------------------------------------------
    // Constantes baseadas em clima do DF:
    // -------------------------------------------------------------
    private static readonly TEMP_COLD = BRASILIA_BUCKETS.TEMP_COLD;
    private static readonly TEMP_WARM_MIN = BRASILIA_BUCKETS.TEMP_WARM_MIN;
    private static readonly TEMP_WARM_MAX = BRASILIA_BUCKETS.TEMP_WARM_MAX;
    private static readonly TEMP_HOT_MIN = BRASILIA_BUCKETS.TEMP_HOT_MIN;
    private static readonly TEMP_HOT_MAX = BRASILIA_BUCKETS.TEMP_HOT_MAX;
    private static readonly HUM_LOW = BRASILIA_BUCKETS.HUM_LOW;
    private static readonly HUM_IDEAL_MIN = BRASILIA_BUCKETS.HUM_IDEAL_MIN;
    private static readonly HUM_IDEAL_MAX = BRASILIA_BUCKETS.HUM_IDEAL_MAX;
    private static readonly WIND_STRONG = BRASILIA_BUCKETS.WIND_STRONG;

    // -------------------------------------------------------------
    // Temperatura
    // -------------------------------------------------------------
    isCold(): boolean {
        return this.temperature < WeatherEntity.TEMP_COLD;
    }

    isWarm(): boolean {
        return (
            this.temperature >= WeatherEntity.TEMP_WARM_MIN &&
            this.temperature <= WeatherEntity.TEMP_WARM_MAX
        );
    }

    isHot(): boolean {
        return (
            this.temperature > WeatherEntity.TEMP_HOT_MIN &&
            this.temperature <= WeatherEntity.TEMP_HOT_MAX
        );
    }

    isVeryHot(): boolean {
        return this.temperature > WeatherEntity.TEMP_HOT_MAX;
    }

    // -------------------------------------------------------------
    // Umidade
    // -------------------------------------------------------------
    isLowHumidity(): boolean {
        return this.humidity < WeatherEntity.HUM_LOW;
    }

    isIdealHumidity(): boolean {
        return (
            this.humidity >= WeatherEntity.HUM_IDEAL_MIN &&
            this.humidity <= WeatherEntity.HUM_IDEAL_MAX
        );
    }

    isHighHumidity(): boolean {
        return this.humidity > WeatherEntity.HUM_IDEAL_MAX;
    }

    // -------------------------------------------------------------
    // Vento
    // -------------------------------------------------------------
    isWindStrong(): boolean {
        return this.windSpeed > WeatherEntity.WIND_STRONG;
    }
}
