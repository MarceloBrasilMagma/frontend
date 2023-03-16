import { Component, DoCheck, OnInit } from '@angular/core';
import {
  PortifolioVm,
  PortifoliosClient,
  StatusProjeto,
  StatusCronograma,
} from 'web-api-client';
import { first } from 'rxjs/operators';
import { QuantidadesStatus } from './models/quantidades-status';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './cronograma.component.html',
  styleUrls: ['./cronograma.component.scss'],
})
export class CronogramaComponent implements OnInit, DoCheck {
  portifolioId: number = +this.route.snapshot.queryParams['id'];
  portifolioIdCheck: number;
  portifolio: PortifolioVm;
  carregando = true;

  // Gráfico Situações
  quantidadesStatus: QuantidadesStatus = {
    quantidadeStatusIniciacaoFutura: 0,
    quantidadeStatusDentroDoPrazo: 0,
    quantidadeStatusAtrasado: 0,
    quantidadeStatusForaDoPrazo: 0,
    quantidadeStatusPausado: 0,
    quantidadeStatusCancelado: 0,
    quantidadeStatusConcluido: 0,
  };
  constructor(
    private route: ActivatedRoute,
    private portifolioClient: PortifoliosClient
  ) {}

  ngOnInit(): void {
    this.obterPortifolio();
  }

  ngDoCheck(): void {
    this.portifolioIdCheck = +this.route.snapshot.queryParams['id'];
    if (this.portifolioIdCheck != this.portifolioId) {
      this.portifolioId = this.portifolioIdCheck;
      this.quantidadesStatus = {
        quantidadeStatusIniciacaoFutura: 0,
        quantidadeStatusDentroDoPrazo: 0,
        quantidadeStatusAtrasado: 0,
        quantidadeStatusForaDoPrazo: 0,
        quantidadeStatusPausado: 0,
        quantidadeStatusCancelado: 0,
        quantidadeStatusConcluido: 0,
      };
      this.obterPortifolio();
    }
  }

  obterPortifolio() {
    if (this.portifolioId) {
      this.carregando = true;
      this.portifolioClient
        .obterPorId(this.portifolioId)
        .pipe(first())
        .subscribe({
          next: (response: PortifolioVm) => {
            this.portifolio = response;
            this.quantidadeStatusProjetos();
          },
          complete: () => (this.carregando = false),
          error: (error) => console.log(error),
        });
    }
  }

  quantidadeStatusProjetos() {
    if (
      this.portifolio.preProjetos.length > 0
    ) {
      for (let i = 0; i < this.portifolio.preProjetos.length; i++) {
        const element = this.portifolio.preProjetos[i];
        if (element.projetoStatus == StatusProjeto.Ativo || element.projetoStatus == null) {
          switch (element.projetoCronogramaStatus) {
            case StatusCronograma.Verde:
              this.quantidadesStatus.quantidadeStatusDentroDoPrazo++;
              break;
            case StatusCronograma.Amarelo:
              this.quantidadesStatus.quantidadeStatusAtrasado++;
              break;
            case StatusCronograma.Vermelho:
              this.quantidadesStatus.quantidadeStatusForaDoPrazo++;
              break;
            default:
              this.quantidadesStatus.quantidadeStatusIniciacaoFutura++;
              break;
          }
        } else if (element.projetoStatus == StatusProjeto.Pausado) {
          this.quantidadesStatus.quantidadeStatusPausado++;
        } else if (element.projetoStatus == StatusProjeto.Cancelado) {
          this.quantidadesStatus.quantidadeStatusCancelado++;
        } else if (element.projetoStatus == StatusProjeto.Concluido) {
          this.quantidadesStatus.quantidadeStatusConcluido++;
        }
      }
    }
    if (
   
      this.portifolio.projetosPlurianuais.length > 0
    ) {
      for (let i = 0; i < this.portifolio.projetosPlurianuais.length; i++) {
        const element = this.portifolio.projetosPlurianuais[i];
        if (element.projetoStatus == StatusProjeto.Ativo || element.projetoStatus == null) {
          switch (element.projetoCronogramaStatus) {
            case StatusCronograma.Verde:
              this.quantidadesStatus.quantidadeStatusDentroDoPrazo++;
              break;
            case StatusCronograma.Amarelo:
              this.quantidadesStatus.quantidadeStatusAtrasado++;
              break;
            case StatusCronograma.Vermelho:
              this.quantidadesStatus.quantidadeStatusForaDoPrazo++;
              break;
            default:
              this.quantidadesStatus.quantidadeStatusIniciacaoFutura++;
              break;
          }
        } else if (element.projetoStatus == StatusProjeto.Pausado) {
          this.quantidadesStatus.quantidadeStatusPausado++;
        } else if (element.projetoStatus == StatusProjeto.Cancelado) {
          this.quantidadesStatus.quantidadeStatusCancelado++;
        } else if (element.projetoStatus == StatusProjeto.Concluido) {
          this.quantidadesStatus.quantidadeStatusConcluido++;
        }
      }
    }
    this.quantidadesStatus = { ...this.quantidadesStatus };
  }

  
}
