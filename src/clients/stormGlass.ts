import { AxiosStatic } from "axios";

export interface StormGlassPointSource {
  [key: string]: number;
}

export interface StormGlassPoint {
  readonly time: string;
  readonly waveHeight: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export interface ForeCastPoint {
  time: string;
  waveHeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windSpeed: number;
  windDirection: number;
}

export class StormGlass {

  readonly stormGlassAPIParams = `swellDirection,swellHeight,waveDirection,waveHeight,windDirection,windSpeed`;

  readonly stormGlassAPISource = 'noaa';

  constructor(protected request: AxiosStatic) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForeCastPoint[]> {
    const response = await this.request.get<StormGlassForecastResponse>(
      `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}`
    );

    return this.normalizeResponse(response.data);
  }

  private normalizeResponse(points: StormGlassForecastResponse): ForeCastPoint[] {
    return points.hours
      .filter(this.isValidPoint.bind(this))
      .map(point => ({ 
        swellDirection: point.swellDirection[this.stormGlassAPISource],
        swellHeight: point.swellHeight[this.stormGlassAPISource],
        swellPeriod: point.swellPeriod[this.stormGlassAPISource],
        time: point.time,
        waveDirection: point.waveDirection[this.stormGlassAPISource],
        waveHeight: point.waveHeight[this.stormGlassAPISource],
        windSpeed: point.windSpeed[this.stormGlassAPISource],
        windDirection: point.windDirection[this.stormGlassAPISource]
      }))
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {

    //Partial ele faz com que as propriedades vierem OPCIONAIS
    //Ou undefined, então isso força a gente a checkar todas as chaves
    //Exclamação duas vezes eu forço que o retorno seja boolean

    return !! (
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}