import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Chart } from 'chart.js';
import { FollowUp, PlanoAcaoVm } from 'web-api-client';

@Component({
  selector: 'app-plano-acao-situacao',
  templateUrl: './plano-acao-situacao.component.html',
  styleUrls: ['./plano-acao-situacao.component.scss'],
})
export class PlanoAcaoSituacaoComponent implements OnInit {
  @Input() planosAcoesPortifolio: PlanoAcaoVm[];

  planosAcaoCancelados: number;
  planosAcaoEmAndamento: number;
  planosAcaoRealizados: number;
  planosAcaoAtrasados: number;

  constructor() {}

  ngOnInit(): void {}

  canvas: any;
  ctx: any;
  @ViewChild('mychart') mychart: any;

  ngAfterViewInit() {
    this.quantidadePlanosAcoesPorFollowUp();

    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    new Chart(this.ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            label: 'Dataset 1',
            data: [
              this.planosAcaoEmAndamento,
              this.planosAcaoRealizados,
              this.planosAcaoCancelados,
              this.planosAcaoAtrasados,
            ],
            backgroundColor: ['#7744A1', '#BACF36', '#737373', '#CC4123'],
          },
        ],
        labels: ['Em Andamento', 'Realizado', 'Cancelado', 'Atrasado'],
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              boxWidth: 16,
              boxHeight: 16,
              font: {
                size: 16,
              },
            },
          },
        },
      },
    });
  }

  quantidadePlanosAcoesPorFollowUp() {
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
}
