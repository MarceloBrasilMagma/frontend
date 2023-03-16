import { ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import {
  PortifolioVm,
  StatusCronograma,
  StatusProjeto,
  ProjetoPlurianualVm,
  PreProjetoVm,
} from 'web-api-client';

@Component({
  selector: 'app-cronograma-projetos',
  templateUrl: './cronograma-projetos.component.html',
  styleUrls: ['./cronograma-projetos.component.scss'],
})
export class CronogramaProjetosComponent implements OnInit {
  @Input() portifolio: PortifolioVm;

  constructor() {}

  projetos: any[] = [];
  statusProjeto = StatusProjeto;

  active: string = 'focus:bg-[#99AD20] focus:text-white';

  totalIniciacaoFutura: any = [];
  totalDentroDoPrazo: any = [];
  totalForaDoPrazo: any = [];
  totalAtrasado: any = [];
  totalPausado: any = [];
  totalCancelado: any = [];
  totalConcluido: any = [];

  ngOnInit(): void {
    this.obterTotalProjetos();
  }

  corIndicador(projetoCronogramaStatus: StatusCronograma): string {
    switch (projetoCronogramaStatus) {
      case StatusCronograma.Vermelho:
        return 'color: red; background-color: rgba(128, 0, 0, 0.182);';
      case StatusCronograma.Amarelo:
        return 'color: rgb(121, 121, 0); background-color: rgba(255, 255, 0, 0.581);';
      case StatusCronograma.Verde:
        return 'color: green; background-color: rgba(0, 128, 0, 0.182);';
      case null:
        return 'color: green; background-color: rgba(0, 128, 0, 0.182);';
    }
  }

  iconeCarinha(projetoCronogramaStatus: StatusCronograma): string {
    switch (projetoCronogramaStatus) {
      case StatusCronograma.Vermelho:
        return 'frown';
      case StatusCronograma.Amarelo:
        return 'meh';
      case StatusCronograma.Verde:
        return 'smile';
      case null:
        return 'smile';
    }
  }

  obterTotalProjetos() {
    this.projetos = [
      ...this.portifolio.preProjetos,
      ...this.portifolio.projetosPlurianuais,
    ];
  }

  obterProjetosVazio() {
    this.projetos = [];
  }

  obterProjetosIniciacaoFutura() {
    this.obterTotalProjetos();
    this.totalIniciacaoFutura = this.projetos.filter((x) => {
      return (
        x.projetoStatus == StatusProjeto.Ativo &&
        x.projetoCronogramaStatus == null
      );
    });
    if (this.totalIniciacaoFutura.length > 0) {
      this.projetos = this.totalIniciacaoFutura;
    } else {
      this.obterProjetosVazio();
    }
  }

  obterProjetosAtrasado() {
    this.obterTotalProjetos();
    this.totalAtrasado = this.projetos.filter((x) => {
      return (
        x.projetoStatus == StatusProjeto.Ativo &&
        x.projetoCronogramaStatus == StatusCronograma.Amarelo
      );
    });
    if (this.totalAtrasado.length > 0) {
      this.projetos = this.totalAtrasado;
    } else {
      this.obterProjetosVazio();
    }
  }

  obterProjetosDentroDoPrazo() {
    this.obterTotalProjetos();
    this.totalDentroDoPrazo = this.projetos.filter((x) => {
      return (
        x.projetoStatus == StatusProjeto.Ativo &&
        x.projetoCronogramaStatus == StatusCronograma.Verde
      );
    });
    if (this.totalDentroDoPrazo.length > 0) {
      this.projetos = this.totalDentroDoPrazo;
    } else {
      this.obterProjetosVazio();
    }
  }

  obterProjetosForaDoPrazo() {
    this.obterTotalProjetos();
    this.totalForaDoPrazo = this.projetos.filter((x) => {
      return (
        x.projetoStatus == StatusProjeto.Ativo &&
        x.projetoCronogramaStatus == StatusCronograma.Vermelho
      );
    });
    if (this.totalForaDoPrazo.length > 0) {
      this.projetos = this.totalForaDoPrazo;
    } else {
      this.obterProjetosVazio();
    }
  }

  obterProjetosPausados() {
    this.obterTotalProjetos();
    this.totalPausado = this.projetos.filter((x) => {
      return x.projetoStatus == StatusProjeto.Pausado;
    });
    if (this.totalPausado.length > 0) {
      this.projetos = this.totalPausado;
    } else {
      this.obterProjetosVazio();
    }
  }

  obterProjetosCancelados() {
    this.obterTotalProjetos();
    this.totalCancelado = this.projetos.filter((x) => {
      return x.projetoStatus == StatusProjeto.Cancelado;
    });
    if (this.totalCancelado.length > 0) {
      this.projetos = this.totalCancelado;
    } else {
      this.obterProjetosVazio();
    }
  }

  obterProjetosConcluidos() {
    this.obterTotalProjetos();
    this.totalConcluido = this.projetos.filter((x) => {
      return x.projetoStatus == StatusProjeto.Concluido;
    });
    if (this.totalConcluido.length > 0) {
      this.projetos = this.totalConcluido;
    } else {
      this.obterProjetosVazio();
    }
  }

  tipoProjetoId(projeto: any) {
    if (projeto instanceof PreProjetoVm) {
      return projeto.projetoId;
    } else if (projeto instanceof ProjetoPlurianualVm) {
      return projeto.id;
    }
  }

  statusIniciacaoFutura(projeto: any) {
    return (
      (projeto.projetoStatus == null &&
        projeto.projetoCronogramaStatus == null) ||
      (projeto.projetoStatus == StatusProjeto.Ativo &&
        projeto.projetoCronogramaStatus == null)
    );
  }
}
