import { ExceptionResponseModel } from "./exception-response-model";

export class ExceptionService {
  static obterMensagens(e: any): string[] {
    const json = <ExceptionResponseModel>JSON.parse(e.response);
    let mensagens: string[] = [];

    Object.keys(json.errors).forEach(function (val) {
      const valor = json.errors[val];
      if (Array.isArray(valor)) {
        Object.keys(valor).forEach(function (val) {
          mensagens.push(valor[val]);
        });
      }
      else {
        mensagens.push(json.errors[val]);
      }
    });

    return mensagens;
  }

  static obterMensagensFormatada(e: any): string {
    const mensagens = this.obterMensagens(e);
    return `<br><ul>${mensagens.map(m => `<li>${m}</li>`).join('<br>')}</ul>`
  }
}