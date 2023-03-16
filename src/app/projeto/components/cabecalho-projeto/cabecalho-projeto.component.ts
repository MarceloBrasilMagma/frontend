import { Component, Input, OnInit } from '@angular/core';
import { ProjetoVm, SituacaoCentroCusto, SituacaoProjeto, StatusCronograma } from 'web-api-client';

@Component({
  selector: 'app-cabecalho-projeto',
  templateUrl: './cabecalho-projeto.component.html',
  styleUrls: ['./cabecalho-projeto.component.scss']
})
export class CabecalhoProjetoComponent implements OnInit {
  @Input() projeto: ProjetoVm;

  constructor() { }

  ngOnInit(): void {
  }

  get corSituacao(): string {
    switch (this.projeto.situacao) {
      case SituacaoProjeto.ProjetoAberto:
        return "gray";
      case SituacaoProjeto.AguardandoAprovacaoTap:
        return "gold";
      case SituacaoProjeto.TapConcluido:
        return "green";
    }
  }

  get corSituacaoCentroCusto(): string {
    switch (this.projeto.centroCusto?.situacao) {
      case SituacaoCentroCusto.EmElaboracao:
        return "gray";
      case SituacaoCentroCusto.AguardandoCriacao:
        return "gold";
      case SituacaoCentroCusto.CentroCustoCriado:
        return "green";
    }
  }

  get corStatus(): string {
    switch (this.projeto.cronogramaStatus) {
      case StatusCronograma.Vermelho:
        return "red";
      case StatusCronograma.Amarelo:
        return "gold";
      case StatusCronograma.Verde:
        return "green";
      case null:
        return "green";
    }
  }

}
