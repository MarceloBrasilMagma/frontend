import { Component, Input, OnInit } from '@angular/core';
import moment from 'moment';
import { CronogramaVm } from 'web-api-client';

@Component({
  selector: 'app-cronograma-grafico',
  templateUrl: './cronograma-grafico.component.html',
  styleUrls: ['./cronograma-grafico.component.scss'],
})
export class CronogramaGraficoComponent implements OnInit {
  data: any;
  options: any;

  @Input() cronograma: CronogramaVm[];
  constructor() {}

  ngOnInit(): void {
    if (!!this.cronograma) this.init();
  }

  ngOnChanges() {
    if (!!this.cronograma) {
      this.init();
    }
  }

  init() {
    this.cronograma.sort((x, y) => {
      if (this.dataStatusCheck(x.dataStatus)) {
        if (this.dataStatusCheck(y.dataStatus)) {
          return x.dataStatus > y.dataStatus
            ? 1
            : x.dataStatus < y.dataStatus
            ? -1
            : 0;
        } else {
          return x.dataStatus > y.data ? 1 : x.dataStatus < y.data ? -1 : 0;
        }
      } else {
        if (this.dataStatusCheck(y.dataStatus)) {
          return x.data > y.dataStatus ? 1 : x.data < y.dataStatus ? -1 : 0;
        } else {
          return x.data > y.data ? 1 : x.data < y.data ? -1 : 0;
        }
      }
    });

    let revisado = this.cronograma.map((c) => c.revisado);

    let realizado = this.cronograma.map((c) => c.realizado);

    let labels = this.cronograma.map((c) => {
      if (this.dataStatusCheck(c.dataStatus)) {
        return moment(c.dataStatus).format('L');
      } else {
        return moment(c.data).format('L');
      }
    });

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
        data: revisado,
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
        data: realizado,
      },
    ];

    this.lineChartLabels = labels;
  }
  lineChartData: Array<any>;
  lineChartLabels: Array<any>;

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

  dataStatusCheck(dataStatus: Date) {
    if (dataStatus.getFullYear() > 10 && !!dataStatus) {
      return true;
    } else {
      false;
    }
  }
}
