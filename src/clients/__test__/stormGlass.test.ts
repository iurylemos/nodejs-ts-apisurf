import { StormGlass } from '@src/clients/stormGlass';
import stormGlassWeather3Hours from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalize3Hours from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import * as HTTPUtil from '@src/util/request';

//Mock para limpar o axios
jest.mock('@src/util/request');

describe('StormGlass client', () => {

  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>;

  // Dizendo pro typescript que o mockAxios é um axios por debaixo dos panos
  // Pegando o tipo do axios, e vai adicionar os tipos do jest mock em cima do axios
  // E assim estou criando o mock
  // const mockAxios = axios as jest.Mocked<typeof axios>;
  // Por que não tem o typeof como antes?
  // Por que o HTTPUtil ele é uma instância da classe
  // Ele não é a classe em sí como o axios era..
  // O axios era estático, e o httputil não é
  const MockRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>

  it('should return the normalize forecast from the StormGlass service', async () => {
    const lat = 33.792726;
    const lng = 151.289824;

    // axios.get = jest.fn().mockResolvedValue({ data: stormGlassWeather3Hours });
    //Usando o mock fica assim
    MockRequest.get.mockResolvedValue({ data: stormGlassWeather3Hours } as HTTPUtil.Response);

    const stormGlass = new StormGlass(MockRequest);
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

    MockRequest.get.mockResolvedValue({ data: incompleteResponse } as HTTPUtil.Response);

    const stormGlass = new StormGlass(MockRequest);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  //Tem que ser retornardo um error do StormGlass Service quando tiver problema na request
  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    MockRequest.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(MockRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  //Error de rate limit, pois nessa API só pode 50 requisições por dia
  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    // Fazendo um mock do método estático para que ele retorne true
    // Dizendo que sim, esse é um error de request
    MockedRequestClass.isRequestError.mockReturnValue(true);

    MockRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlass(MockRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});