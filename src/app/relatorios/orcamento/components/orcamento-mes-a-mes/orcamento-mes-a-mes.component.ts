import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Chart, ChartEvent } from 'chart.js';
import { getRelativePosition } from 'chart.js/helpers';
import { map } from 'rxjs/operators';
import { OrcamentoMensalDto } from '../../../../../../web-api-client';

@Component({
  selector: 'app-orcamento-mes-a-mes',
  templateUrl: './orcamento-mes-a-mes.component.html',
  styleUrls: ['./orcamento-mes-a-mes.component.scss'],
})
export class OrcamentoMesAMesComponent implements OnInit, OnChanges {
  @Input() orcamentos: OrcamentoMensalDto[];
  @ViewChild('mychart') mychart: any;
  canvas: any;
  ctx: any;
  chart: any;
  meses: string[];
  realizadoMesAMes: number[] = [];
  orcadoMesAMes: number[] = [];

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.agruparDados();
    this.carregarGrafico();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!!this.ctx) {
      this.agruparDados();
      this.carregarGrafico();
    }
  }

  carregarGrafico() {
    if (!!this.chart) this.chart.destroy();

    this.canvas = this.mychart?.nativeElement;
    this.ctx = this.canvas?.getContext('2d');

    this.chart = new Chart(this.ctx, {
      data: {
        datasets: [
          {
            label: 'Realizado',
            type: 'bar',
            data: this.realizadoMesAMes,
            backgroundColor: '#BACF36',
          },
          {
            type: 'line',
            label: 'Revisado',
            data: this.orcadoMesAMes,
            fill: true,
            backgroundColor: '#7744A1',
          },
        ],
        labels: this.meses,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          y: {
            display: true,
            position: 'right',
            min: 0,
            ticks: {
              callback: function (value, index, ticks) {
                return 'R$' + value;
              },
            },
          },
        },
      },
    });
  }

  agruparDados() {
    this.realizadoMesAMes = [];
    this.orcadoMesAMes = [];
    let dicMeses = {
      1: 'Jan',
      2: 'Fev',
      3: 'Mar',
      4: 'Abr',
      5: 'Mai',
      6: 'Jun',
      7: 'Jul',
      8: 'Ago',
      9: 'Set',
      10: 'Out',
      11: 'Nov',
      12: 'Dez',
    };

    let anos = [...new Set(this.orcamentos.map((x) => x.ano))].sort(
      (a, b) => a - b
    );

    if (anos.length === 2) {
      var mesesAno1 = [
        ...new Set(
          this.orcamentos.filter((x) => x.ano === anos[0]).map((x) => x.mes)
        ),
      ].sort((a, b) => a - b);
      var mesesAno2 = [
        ...new Set(
          this.orcamentos.filter((x) => x.ano === anos[1]).map((x) => x.mes)
        ),
      ].sort((a, b) => a - b);
      mesesAno1.forEach((mes) => {
        this.realizadoMesAMes.push(
          this.orcamentos
            .filter((x) => x.ano === anos[0] && x.mes === mes)
            .map((x) => x.realizado)
            .reduce((a, b) => a + b, 0)
        );
        this.orcadoMesAMes.push(
          this.orcamentos
            .filter((x) => x.ano === anos[0] && x.mes === mes)
            .map((x) => x.orcado)
            .reduce((a, b) => a + b, 0)
        );
      });
      mesesAno2.forEach((mes) => {
        this.realizadoMesAMes.push(
          this.orcamentos
            .filter((x) => x.ano === anos[1] && x.mes === mes)
            .map((x) => x.realizado)
            .reduce((a, b) => a + b, 0)
        );
        this.orcadoMesAMes.push(
          this.orcamentos
            .filter((x) => x.ano === anos[1] && x.mes === mes)
            .map((x) => x.orcado)
            .reduce((a, b) => a + b, 0)
        );
      });

      this.meses = mesesAno1
        .map((x) => dicMeses[x])
        .concat(mesesAno2.map((x) => dicMeses[x]));
    } else {
      var mesesAno = [...new Set(this.orcamentos.map((x) => x.mes))].sort(
        (a, b) => a - b
      );
      mesesAno.forEach((mes) => {
        this.realizadoMesAMes.push(
          this.orcamentos
            .filter((x) => x.mes === mes)
            .map((x) => x.realizado)
            .reduce((a, b) => a + b, 0)
        );
        this.orcadoMesAMes.push(
          this.orcamentos
            .filter((x) => x.mes === mes)
            .map((x) => x.orcado)
            .reduce((a, b) => a + b, 0)
        );
      });

      this.meses = mesesAno.map((x) => dicMeses[x]);
    }
  }
}
