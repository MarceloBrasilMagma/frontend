import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { DeclaracaoTrabalhoRelatorioDto, DeclaracaoTrabalhoRelatorioQuery, DeclaracoesTrabalhoClient, RelatorioDTDto } from "../../../../web-api-client";

@Component({
  templateUrl: './declaracoes-trabalho-relatorio.component.html',
  styleUrls: ['./declaracoes-trabalho-relatorio.component.scss']
})
export class DeclaracoesTrabalhoRelatorioComponent implements OnInit {
  relatorioDT: RelatorioDTDto;
  carregandoRelatorio: boolean = false;
  temposRetorno: any;

  constructor(private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient) { }

  ngOnInit(): void {
    this.carregandoRelatorio = true;
    this.declaracoesTrabalhoClient.relatorio(<DeclaracaoTrabalhoRelatorioQuery>{}).subscribe({
      next: r => {
        this.relatorioDT = r;
        this.temposRetorno = {
          tempoMedio: r.tempoMedioRetorno,
          maiorPrazo: r.maiorPrazoRetorno,
          menorPrazo: r.menorPrazoRetorno
        };
      },
      error: e => {
        console.log(e);
        //TODO: modal erro
      },
      complete: () => this.carregandoRelatorio = false
    })
  }

  carregarRelatorio(filtro: UntypedFormGroup){
    console.log(filtro); // TEMP
    var req = <DeclaracaoTrabalhoRelatorioQuery>{
      ...filtro.value
    };

    this.declaracoesTrabalhoClient.relatorio(req).subscribe({
      next: r => {
        this.relatorioDT = <DeclaracaoTrabalhoRelatorioDto>{...r};
        this.temposRetorno = {
          tempoMedio: r.tempoMedioRetorno,
          maiorPrazo: r.maiorPrazoRetorno,
          menorPrazo: r.menorPrazoRetorno
        };
      }, error: error => console.log(error)
      
    });
    
  }

}
