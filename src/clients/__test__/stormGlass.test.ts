import { StormGlass } from '@src/clients/stormGlass';
import axios from 'axios';
import stormGlassWeather3Hours from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalize3Hours from '@test/fixtures/stormglass_normalized_response_3_hours.json';

//Mock para limpar o axios
jest.mock('axios');

describe('StormGlass client', () => {

  //Dizendo pro typescript que o mockAxios é um axios por debaixo dos panos
  //Pegando o tipo do axios, e vai adicionar os tipos do jest mock em cima do axios
  //E assim estou criando o mock
  const mockAxios = axios as jest.Mocked<typeof axios>;

  it('should return the normalize forecast from the StormGlass service', async () => {
    const lat = 33.792726;
    const lng = 151.289824;

    // axios.get = jest.fn().mockResolvedValue({ data: stormGlassWeather3Hours });
    //Usando o mock fica assim
    mockAxios.get.mockResolvedValue({ data: stormGlassWeather3Hours });

    const stormGlass = new StormGlass(mockAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassNormalize3Hours);
  });
})