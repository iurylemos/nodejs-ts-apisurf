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

  //Dados que não tem todas as chaves, devem ser excluidos
  it('should exclude incomplete data points', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: incompleteResponse });

    const stormGlass = new StormGlass(mockAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  //Tem que ser retornardo um error do StormGlass Service quando tiver problema na request
  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockAxios.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  //Error de rate limit, pois nessa API só pode 50 requisições por dia
  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockAxios.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlass(mockAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});