import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

//Generics são tipos fluindo entre a aplicação

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface RequestConfig extends AxiosRequestConfig {}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Response<T = any> extends AxiosResponse<T> {}

export class Request {
  constructor(private request = axios) {}

  public get<T>(url: string, config: RequestConfig = {}): Promise<Response<T>> {
    return this.request.get<T, Response<T>>(url, config);
  }

  // Por que o método é estático? Por que ele não usa o this da classe
  // Ou seja ele não acessa a nenhuma propriedade da classe
  // A gente não precisa usar o new para utilizar ele.
  public static isRequestError(error: AxiosError): boolean {
    //Se tiver esses dois campos significa que é um error de request
    return !! (error.response && error.response.status);
  }
}