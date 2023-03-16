import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { QuantidadesStatus } from '../../models/quantidades-status'

@Component({
  selector: 'app-cronograma-situacao',
  templateUrl: './cronograma-situacao.component.html',
  styleUrls: ['./cronograma-situacao.component.scss']
})
export class CronogramaSituacaoComponent implements OnInit {
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
    responsive: true,
    cutout: '70%',
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
