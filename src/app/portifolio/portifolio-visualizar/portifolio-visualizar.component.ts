import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { PortifoliosClient, PortifolioVm, StatusCronograma, StatusProjeto, TipoPreProjeto } from 'web-api-client';
import { QuantidadesStatus } from '../models/quantidades-status';

@Component({
  selector: 'app-portifolio-visualizar',
  templateUrl: './portifolio-visualizar.component.html',
  styleUrls: ['./portifolio-visualizar.component.scss']
})
export class PortifolioVisualizarComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private portifolioClient: PortifoliosClient,
  ) { }

  // Dados  
  portifolio: PortifolioVm;
  
  form: UntypedFormGroup = <UntypedFormGroup>{};
  portifolioId: any;
  carregando = false;

  // Tipos de Projetos
  totalProjetos: number = 0;
  projetosOperacionais: number = 0;
  projetosEstrategicos: number = 0;
  projetosTaticos: number = 0;

  // Orçamento
  valorRevisadoAcumulado: number = 0;
  valorRealizadoAcumulado: number = 0;
  desvioOrcamento : number = 0;
  barraRevisadoAcumulado: number = 0;
  barraRealizadoAcumulado: number = 0;
  

  // Gráfico Status
  quantidadesStatus: QuantidadesStatus = {
    quantidadeStatusIniciacaoFutura: 0,
    quantidadeStatusDentroDoPrazo: 0,
    quantidadeStatusAtrasado: 0,
    quantidadeStatusForaDoPrazo: 0,
    quantidadeStatusPausado: 0,
    quantidadeStatusCancelado: 0,
    quantidadeStatusConcluido: 0
  };

  ngOnInit(): void {
  this.obterPortifolio();
  }
  
  
  obterPortifolio() {
    this.portifolioId = this.route.snapshot.paramMap.get('id');

    if(this.portifolioId) {
      this.carregando = true;
      this.portifolioClient.obterPorId(this.portifolioId)
        .pipe(first())
        .subscribe({
          next: response => {
            this.carregando = false;
            this.portifolio = response;
            this.valoresOrcamento();
            this.quantidadeTiposProjetos();
            this.quantidadeStatusProjetos();
          },
          complete: () => this.carregando = false
        });
    }
  }

  valoresOrcamento() {
    if(this.portifolio.preProjetos.length > 0) {
      for (let i = 0; i < this.portifolio.preProjetos.length; i++) {
        const element = this.portifolio.preProjetos[i];
        this.valorRevisadoAcumulado += element.valorOrcado;
        this.valorRealizadoAcumulado += element.valorRealizado;
      }
    }
    if(this.portifolio.projetosPlurianuais.length > 0) {
      for (let i = 0; i < this.portifolio.projetosPlurianuais.length; i++) {
        const element = this.portifolio.projetosPlurianuais[i];
        this.valorRevisadoAcumulado += element.valorOrcado;
        this.valorRealizadoAcumulado += element.valorRealizado;
      }
    }
    if(this.valorRevisadoAcumulado == 0 && this.valorRealizadoAcumulado != 0) {
      this.desvioOrcamento = -1
    } else if (this.valorRevisadoAcumulado == 0 && this.valorRealizadoAcumulado == 0) {
      this.desvioOrcamento = 0
    } else {
      this.desvioOrcamento = (this.valorRevisadoAcumulado - this.valorRealizadoAcumulado) / this.valorRevisadoAcumulado;
    }
    
    this.porcentagemBarraOrcamento()
  }

  porcentagemBarraOrcamento() {
    if(this.valorRealizadoAcumulado > this.valorRevisadoAcumulado) {
      this.barraRealizadoAcumulado = 100
      this.barraRevisadoAcumulado = 100 - (- this.desvioOrcamento * 100)
    } else if (this.valorRealizadoAcumulado < this.valorRevisadoAcumulado) {
      this.barraRealizadoAcumulado = 100 - (this.desvioOrcamento * 100)
      this.barraRevisadoAcumulado = 100
    } else if (this.valorRealizadoAcumulado == this.valorRevisadoAcumulado) {
      this.barraRealizadoAcumulado = 100
      this.barraRevisadoAcumulado = 100
    } else {
      this.barraRealizadoAcumulado = 0
      this.barraRevisadoAcumulado = 0
    }
  }

  quantidadeTiposProjetos() {
    if(this.portifolio.preProjetos.length > 0) {
      for (let i = 0; i < this.portifolio.preProjetos.length; i++) {
        const element = this.portifolio.preProjetos[i];
        switch (this.portifolio.preProjetos[i].tipo) {
          case TipoPreProjeto.Estrategico:
            this.projetosEstrategicos++
            break;
          case TipoPreProjeto.Operacional:
            this.projetosOperacionais++
            break;
          case TipoPreProjeto.Tatico:
            this.projetosTaticos++
            break;
        }
        
      }
    }
    if(this.portifolio.projetosPlurianuais.length > 0) {
      for (let i = 0; i < this.portifolio.projetosPlurianuais.length; i++) {
        const element = this.portifolio.projetosPlurianuais[i];
        switch (this.portifolio.projetosPlurianuais[i].tipo) {
          case TipoPreProjeto.Estrategico:
            this.projetosEstrategicos++
            break;
          case TipoPreProjeto.Operacional:
            this.projetosOperacionais++
            break;
          case TipoPreProjeto.Tatico:
            this.projetosTaticos++
            break;
        }
      }
    }
    this.totalProjetos = this.portifolio.preProjetos.length + this.portifolio.projetosPlurianuais.length;
  }

  quantidadeStatusProjetos() {

    if (!!this.portifolio.preProjetos && this.portifolio.preProjetos.length > 0) {
      for (let i = 0; i < this.portifolio.preProjetos.length; i++) {
        const element = this.portifolio.preProjetos[i];
        if (element.projetoStatus == StatusProjeto.Ativo) {
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
    if (!!this.portifolio.projetosPlurianuais && this.portifolio.projetosPlurianuais.length > 0) {
      for (let i = 0; i < this.portifolio.projetosPlurianuais.length; i++) {
        const element = this.portifolio.projetosPlurianuais[i];
        if (element.projetoStatus == StatusProjeto.Ativo) {
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
    this.quantidadesStatus = {...this.quantidadesStatus};
  }


}
