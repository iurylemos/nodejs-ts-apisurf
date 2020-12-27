export class InternalError extends Error {
  constructor(public message: string, protected code: number = 500, protected description?: string) {
    super(message);
    // Se alguém desbugar essa classe, vai ver o nome certo!!
    this.name = this.constructor.name;
    // Boa prática para remover que essa classe apareça
    // A gente joga isso fora e a gente mostra a partir de onde que o error foi jogado
    // Fica melhor de ver o error no final
    Error.captureStackTrace(this, this.constructor);
  }
}