import { Component, Input, OnInit } from '@angular/core';
import {
  FollowUp,
  PlanoAcaoVm,
  PortifolioVm,
  PreProjetoVm,
  ProjetoPlurianualVm,
} from 'web-api-client';

@Component({
  selector: 'app-plano-acao-acoes',
  templateUrl: './plano-acao-acoes.component.html',
  styleUrls: ['./plano-acao-acoes.component.scss'],
})
export class PlanoAcaoAcoesComponent implements OnInit {
  @Input() planosAcoesPortifolio: PlanoAcaoVm[];
  @Input() portifolio: PortifolioVm;

  totalPlanoAcoes: number;
  planosAcaoCancelados: number;
  planosAcaoEmAndamento: number;
  planosAcaoRealizados: number;
  planosAcaoAtrasados: number;
  FollowUp = FollowUp

  constructor() {}

  ngOnInit(): void {
    this.quantidadePlanosAcoes();
  }

  quantidadePlanosAcoes() {
    this.totalPlanoAcoes = this.planosAcoesPortifolio.length;
    this.planosAcaoAtrasados = this.planosAcoesPortifolio.filter(
      (pa) => pa.followUp == FollowUp.Atrasado
    ).length;
    this.planosAcaoCancelados = this.planosAcoesPortifolio.filter(
      (pa) => pa.followUp == FollowUp.Cancelado
    ).length;
    this.planosAcaoEmAndamento = this.planosAcoesPortifolio.filter(
      (pa) => pa.followUp == FollowUp.EmAndamento
    ).length;
    this.planosAcaoRealizados = this.planosAcoesPortifolio.filter(
      (pa) => pa.followUp == FollowUp.Realizado
    ).length;
  }

  obterQtdPlanoAcaoPorFollowUp(
    followUp: FollowUp,
    projeto: PreProjetoVm | ProjetoPlurianualVm
  ) {
    if (followUp == FollowUp.Atrasado) {
      return projeto.planosAcoes.filter(
        (pa) => pa.followUp == FollowUp.Atrasado
      ).length;
    } else if (followUp == FollowUp.Cancelado) {
      return projeto.planosAcoes.filter(
        (pa) => pa.followUp == FollowUp.Cancelado
      ).length;
    } else if (followUp == FollowUp.EmAndamento) {
      return projeto.planosAcoes.filter(
        (pa) => pa.followUp == FollowUp.EmAndamento
      ).length;
    } else {
      return projeto.planosAcoes.filter(
        (pa) => pa.followUp == FollowUp.Realizado
      ).length;
    }
  }

  obterPorcentagemPlanoAcaoPorFollowUp(
    followUp: FollowUp,
    projeto: PreProjetoVm | ProjetoPlurianualVm
  ) {
    let totalPlanoAcoes = projeto.planosAcoes.length;
    if (followUp == FollowUp.Atrasado) {
      return projeto.planosAcoes.filter(
        (pa) => pa.followUp == FollowUp.Atrasado
      ).length > 0
        ? projeto.planosAcoes.filter((pa) => pa.followUp == FollowUp.Atrasado)
            .length / totalPlanoAcoes
        : 0;
    } else if (followUp == FollowUp.Cancelado) {
      return projeto.planosAcoes.filter(
        (pa) => pa.followUp == FollowUp.Cancelado
      ).length > 0
        ? projeto.planosAcoes.filter((pa) => pa.followUp == FollowUp.Cancelado)
            .length / totalPlanoAcoes
        : 0;
    } else if (followUp == FollowUp.EmAndamento) {
      return projeto.planosAcoes.filter(
        (pa) => pa.followUp == FollowUp.EmAndamento
      ).length
        ? projeto.planosAcoes.filter(
            (pa) => pa.followUp == FollowUp.EmAndamento
          ).length / totalPlanoAcoes
        : 0;
    } else {
      return projeto.planosAcoes.filter(
        (pa) => pa.followUp == FollowUp.Realizado
      ).length
        ? projeto.planosAcoes.filter((pa) => pa.followUp == FollowUp.Realizado)
            .length / totalPlanoAcoes
        : 0;
    }
  }
}
