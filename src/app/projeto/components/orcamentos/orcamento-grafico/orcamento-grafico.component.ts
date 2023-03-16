import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AcompanhamentoOrcamentarioVm } from 'web-api-client';

@Component({
  selector: 'app-orcamento-grafico',
  templateUrl: './orcamento-grafico.component.html',
  styleUrls: ['./orcamento-grafico.component.scss'],
})
export class OrcamentoGraficoComponent implements OnChanges {
  @Input() acompanhamentoOrcamentario: AcompanhamentoOrcamentarioVm[];

  valoresOrcamentoRevisado: number[] = [];
  valoresOrcamentoRealizado: number[] = [];
  mesesGrafico: string[] = [];

  lineChartData: Array<any>;
  lineChartLabels: Array<any>;

  meses: string[] = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  constructor() {}

  ngOnChanges() {
    if (
      !!this.acompanhamentoOrcamentario &&
      this.acompanhamentoOrcamentario.length
    ) {
      this.obterValoresGrafico();
    }
  }

  obterValoresGrafico() {
    for (let i = 1; i < 13; i++) {
      let vMeses = this.acompanhamentoOrcamentario.filter((x) => {
        return x.mes === i;
      });

      if (vMeses.length > 0) {
        let acumuladoRevisado = 0;
        let acumuladoRealizado = 0;

        for (let v of vMeses) {
          acumuladoRevisado += v?.orcado;
          acumuladoRealizado += v?.realizado;
        }

        this.valoresOrcamentoRevisado.push(acumuladoRevisado);
        this.valoresOrcamentoRealizado.push(acumuladoRealizado);
        this.mesesGrafico.push(this.meses[vMeses[0].mes - 1]);
      }
    }
    this.montarGrafico();
  }

  montarGrafico() {
    this.lineChartData = [
      {
        label: 'Revisado',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: this.valoresOrcamentoRevisado,
      },
      {
        label: 'Realizado',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: this.valoresOrcamentoRealizado,
      },
    ];

    this.lineChartLabels = this.mesesGrafico;
  }

  lineChartOptions: any = {
    responsive: false,
    annotation: {
      annotations: [
        {
          drawTime: 'afterDraw',
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: 70,
          borderColor: '#000000',
          borderWidth: 2,
          label: {
            backgroundColor: 'red',
            content: 'global plugin',
            enabled: true,
            position: 'center',
          },
        },
      ],
    },
  };

  lineChartLegend = true;
  lineChartType = 'line';
  inlinePlugin: any;
  textPlugin: any;
}
