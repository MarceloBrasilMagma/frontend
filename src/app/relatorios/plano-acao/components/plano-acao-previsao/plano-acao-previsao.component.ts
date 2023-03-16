import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import moment from 'moment';
import { FollowUp, PlanoAcaoVm, PortifolioVm } from 'web-api-client';

@Component({
  selector: 'app-plano-acao-previsao',
  templateUrl: './plano-acao-previsao.component.html',
  styleUrls: ['./plano-acao-previsao.component.scss'],
})
export class PlanoAcaoPrevisaoComponent implements OnInit {
  @Input() portifolio: PortifolioVm;
  @Input() planosAcoesPortifolio: PlanoAcaoVm[];

  mesesPortifolio: string[] = [];
  dataMesesPortifolio: Date[] = [];
  quantidadePlanosAcaoPrevistosPorMes: number[] = [];
  quantidadePlanosAcaoRealizadosPorMes: number[] = [];

  constructor() {}

  ngOnInit(): void {
    this.periodoPortifolio();
  }

  canvas: any;
  ctx: any;
  @ViewChild('mychart') mychart: any;

  ngAfterViewInit() {
    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    new Chart(this.ctx, {
      data: {
        datasets: [
          {
            type: 'line',
            label: 'Realizado',
            data: this.quantidadePlanosAcaoRealizadosPorMes,
            fill: false,
            borderColor: '#BACF36',
            backgroundColor: '#BACF36',
          },
          {
            type: 'line',
            label: 'Previsto',
            data: this.quantidadePlanosAcaoPrevistosPorMes,
            fill: false,
            borderColor: '#7744A1',
            backgroundColor: '#7744A1',
          },
        ],
        labels: this.mesesPortifolio,
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
            min: 0,
            position: 'right',
          },
        },
      },
    });
  }

  periodoPortifolio() {
    let diferenca = moment(this.portifolio.dataTermino).diff(
      this.portifolio.dataInicio
    );

    let diferencaMeses = Math.ceil(moment.duration(diferenca).asMonths());

    let dataInicialPortifolio = moment(this.portifolio.dataInicio);
    dataInicialPortifolio.locale('pt-br');

    for (let i = 0; i < diferencaMeses; i++) {
      this.mesesPortifolio.push(dataInicialPortifolio.format('MMM/yyyy'));
      this.dataMesesPortifolio.push(dataInicialPortifolio.toDate());
      dataInicialPortifolio.add(1, 'month');
    }

    // Usar mesesPortifolio para o eixo X do gráfico
    this.obterPlanosAcaoPrevistosPorMes();
    this.obterPlanosAcaoRealizadosPorMes();
  }

  obterPlanosAcaoPrevistosPorMes() {
    let planosAcaoSemCancelados: PlanoAcaoVm[] =
      this.planosAcoesPortifolio.filter(
        (pa) => pa.followUp != FollowUp.Cancelado
      );
    this.quantidadePlanosAcaoPrevistosPorMes.length =
      this.dataMesesPortifolio.length;
    this.quantidadePlanosAcaoPrevistosPorMes.fill(0);

    if (planosAcaoSemCancelados.length > 0) {
      for (let i = 0; i < planosAcaoSemCancelados.length; i++) {
        const dataPlanoAcao = planosAcaoSemCancelados[i].data;
        for (let i = 0; i < this.dataMesesPortifolio.length; i++) {
          const dataMesPortifolio = this.dataMesesPortifolio[i];
          const diferenca = moment(dataMesPortifolio).diff(dataPlanoAcao);

          if (diferenca >= 0) {
            this.quantidadePlanosAcaoPrevistosPorMes[i]++;
          }
        }
      }
    }
  }

  obterPlanosAcaoRealizadosPorMes() {
    let planosAcaoRealizados: PlanoAcaoVm[] = this.planosAcoesPortifolio.filter(
      (pa) => pa.followUp == FollowUp.Realizado
    );
    this.quantidadePlanosAcaoRealizadosPorMes.length =
      this.dataMesesPortifolio.length;
    this.quantidadePlanosAcaoRealizadosPorMes.fill(0);

    if (planosAcaoRealizados.length > 0) {
      for (let i = 0; i < planosAcaoRealizados.length; i++) {
        const dataPlanoAcao = planosAcaoRealizados[i].data;
        for (let i = 0; i < this.dataMesesPortifolio.length; i++) {
          const dataMesPortifolio = this.dataMesesPortifolio[i];
          const diferenca = moment(dataMesPortifolio).diff(dataPlanoAcao);

          if (diferenca >= 0) {
            this.quantidadePlanosAcaoRealizadosPorMes[i]++;
          }
        }
      }
    }
  }
}
