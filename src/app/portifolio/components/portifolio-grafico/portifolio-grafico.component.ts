import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { QuantidadesStatus } from '../../models/quantidades-status'

@Component({
selector: 'app-portifolio-grafico',
templateUrl: './portifolio-grafico.component.html',
styleUrls: ['./portifolio-grafico.component.scss']
})
export class PortifolioGraficoComponent implements OnInit, OnChanges {
  @Input() quantidadesStatus: QuantidadesStatus; 

  constructor() { }

  doughnutChartData: number[];
  doughnutChartColors: Array<any> = [
    {
      backgroundColor: [
        '#7744A1',
        '#008000',
        '#ffff0094',
        '#CC4123',
        '#ffa500',
        '#737373',
        '#0000ff'
      ],
      pointBackgroundColor: [
        '#7744A1',
        '#008000',
        '#ffff0094',
        '#CC4123',
        '#ffa500',
        '#737373',
        '#0000ff '
      ],
    },
  ];
  doughnutChartType: string = 'doughnut';
  doughnutChartLabels: string[] = [
    'Iniciação Futura',
    'Dentro do Prazo',
    'Atrasado',
    'Fora do Prazo',
    'Pausado',
    'Cancelado',
    'Concluído',
  ];
  doughnutChartOptions: {}= {
    maintainAspectRatio: false,
    cutout: 60,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
        },
      },
    },
  };

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void{
    if (!!this.quantidadesStatus) {
      this.exibirGrafico();
    }
  }

  exibirGrafico() {
    this.doughnutChartData = [
      this.quantidadesStatus.quantidadeStatusIniciacaoFutura,
      this.quantidadesStatus.quantidadeStatusDentroDoPrazo,
      this.quantidadesStatus.quantidadeStatusAtrasado,
      this.quantidadesStatus.quantidadeStatusForaDoPrazo,
      this.quantidadesStatus.quantidadeStatusPausado,
      this.quantidadesStatus.quantidadeStatusCancelado,
      this.quantidadesStatus.quantidadeStatusConcluido,
    ];
  }
}



