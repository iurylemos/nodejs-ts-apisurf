import { AxiosStatic } from "axios";

export class StormGlass {

  readonly stormGlassAPIParams = `swellDirection,swellHeight,waveDirection,waveHeight,windDirection,windSpeed`;

  readonly stormGlassAPISource = 'noaaa';

  constructor(protected request: AxiosStatic) {}

  public async fetchPoints(lat: number, lng: number): Promise<any> {
    return this.request.get(`https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}`)
  }
}