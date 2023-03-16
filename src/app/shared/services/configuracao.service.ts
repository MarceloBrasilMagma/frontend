import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ConfiguracaoService {

    constructor() { }

    getPrazoMaximoAssumirAtendimento(): number {
        var prazoMaximoAssumirAtendimento = Number(localStorage.getItem("prazoMaximoAssumirAtendimento"));

        if (prazoMaximoAssumirAtendimento)
            return prazoMaximoAssumirAtendimento;

        return 30;
    }

}
