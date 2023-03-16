import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { OrcamentoGraficoComponent } from 'src/app/projeto/components/orcamentos/orcamento-grafico/orcamento-grafico.component';
import { ProjetoVm } from 'web-api-client';

@Component({
  selector: 'app-capa',
  templateUrl: './capa.component.html',
  styleUrls: ['./capa.component.scss'],
})
export class CapaComponent implements OnInit {
  @Input() projeto: ProjetoVm;
  projetoId: number;

  @Output() componente = new EventEmitter<CapaComponentes>();
  @Output() recarregarProjeto = new EventEmitter<number>();

  componentes = CapaComponentes;

  constructor(private nzModalService: NzModalService) {}

  ngOnInit(): void {}

  abrirModalOrcamento() {
    const modal = this.nzModalService.create({
      nzContent: OrcamentoGraficoComponent,
      nzTitle: 'Curva S - Orçamento',
      nzComponentParams: {
        acompanhamentoOrcamentario: this.projeto?.acompanhamentoOrcamentario,
      },
      nzClosable: true,
      nzWidth: '75%',
      nzOkText: null,
      nzCancelText: null,
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
      } else {
      }
    });
  }

  alterarComponente(c: CapaComponentes) {
    this.componente.emit(c);
  }
}

export enum CapaComponentes {
  Capa,
  DiarioBordo,
  DadosProjeto,
  PlanoAcao,
  CentroCusto,
  Orcamentos,
  Cronograma,
  CronogramaProject,
  LicoesAprendidas,
}
