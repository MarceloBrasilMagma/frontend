import {
  Component,
  OnInit,
  ViewChild,
  Input,
  AfterViewInit,
} from '@angular/core';
import { Chart } from 'chart.js';
import moment from 'moment';
import {
  LogAlteracaoObterPorEntidadeECampoQuery,
  LogsAlteracoesClient,
  PortifolioVm,
  LogAlteracaoVm,
} from 'web-api-client';

@Component({
  selector: 'app-abrangencia-mes-a-mes',
  templateUrl: './abrangencia-mes-a-mes.component.html',
  styleUrls: ['./abrangencia-mes-a-mes.component.scss'],
})
export class AbrangenciaMesAMesComponent implements OnInit, AfterViewInit {
  @Input() portifolio: PortifolioVm;
  mesesPortifolio: string[] = [];

  // Linha roxa gráfico: total de projetos
  totalProjetos: number;
  listaTotalProjetos: number[] = [];

  logStatusProjetos: LogAlteracaoVm[];
  dataMesesPortifolio: Date[] = [];
  projetosAtivosPorMes: number[] = [];
  projetosAtivosPorMesPorcentagem: number[] = [];

  constructor(private logsAlteracoesClient: LogsAlteracoesClient) {}

  ngOnInit(): void {}

  canvas: any;
  ctx: any;
  @ViewChild('mychart') mychart: any;

  ngAfterViewInit() {
    this.periodoPortifolio();
    this.quantidadeTotalProjetos();
    this.obterLogAlteracoes();
    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');
  }

  // Labels do gráfico
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
  }

  // Valores linha roxa
  quantidadeTotalProjetos() {
    this.totalProjetos = 100;
    for (let i = 0; i < this.mesesPortifolio.length; i++) {
      this.listaTotalProjetos.push(this.totalProjetos);
    }
  }

  obterLogAlteracoes() {
    let req = new LogAlteracaoObterPorEntidadeECampoQuery({
      entidade: 'Projeto',
      dataInicial: this.portifolio.dataInicio,
      dataFinal: this.portifolio.dataTermino,
      campo: 'Status',
    });
    this.logsAlteracoesClient.obterPorEntidadeECampo(req).subscribe({
      next: (response) => {
        this.logStatusProjetos = response;
        this.obterStatusProjetosMesAMes();
      },
      complete: () => this.montarGrafico(),
    });
  }

  obterStatusProjetosMesAMes() {
    this.projetosAtivosPorMes.length = this.dataMesesPortifolio.length;
    this.projetosAtivosPorMes.fill(0);

    this.portifolio.preProjetos.forEach((preProjeto) => {
      let statusProjeto = this.logStatusProjetos.filter(
        (l) => Number(l.entidadeId) == preProjeto.projetoId
      );

      if (moment(this.portifolio.dataInicio).diff(preProjeto.dataCriacao) > 0) {
        for (let i = 0; i < this.dataMesesPortifolio.length; i++) {
          this.projetosAtivosPorMes[i]++;
        }
      }

      this.dataMesesPortifolio.forEach((mesPortifolio) => {
        // Somar 1 para cada mês subsequente a criação do Projeto
        if (
          preProjeto.dataCriacao.getMonth() == mesPortifolio.getMonth() &&
          preProjeto.dataCriacao.getFullYear() == mesPortifolio.getFullYear()
        ) {
          let indiceCriacao = this.dataMesesPortifolio.indexOf(mesPortifolio);

          for (
            let i = indiceCriacao;
            i < this.dataMesesPortifolio.length;
            i++
          ) {
            this.projetosAtivosPorMes[i]++;
          }
        }

        // Remove 1 para o último valor de log do mês diferente de Ativo
        let mesLogAlteracaoProjeto = statusProjeto.filter(
          (s) =>
            s.dataAlteracao.getMonth() == mesPortifolio.getMonth() &&
            s.dataAlteracao.getFullYear() == mesPortifolio.getFullYear()
        );

        if (mesLogAlteracaoProjeto.length > 0) {
          if (
            mesLogAlteracaoProjeto[mesLogAlteracaoProjeto.length - 1]
              .valorAtual != 'Ativo'
          ) {
            this.projetosAtivosPorMes[
              this.dataMesesPortifolio.indexOf(mesPortifolio)
            ]--;
          }
        }
      });
    });

    this.portifolio.projetosPlurianuais.forEach((projetoPlurianual) => {
      let statusProjeto = this.logStatusProjetos.filter(
        (l) => Number(l.entidadeId) == projetoPlurianual.projetoId
      );

      if (moment(this.portifolio.dataInicio).diff(projetoPlurianual.dataCriacao) > 0) {
        for (let i = 0; i < this.dataMesesPortifolio.length; i++) {
          this.projetosAtivosPorMes[i]++;
        }
      }

      this.dataMesesPortifolio.forEach((mesPortifolio) => {
        // Somar 1 para cada mês subsequente a criação do Projeto
        if (
          projetoPlurianual.dataCriacao.getMonth() ==
            mesPortifolio.getMonth() &&
          projetoPlurianual.dataCriacao.getFullYear() ==
            mesPortifolio.getFullYear()
        ) {
          let indiceCriacao = this.dataMesesPortifolio.indexOf(mesPortifolio);

          for (
            let i = indiceCriacao;
            i < this.dataMesesPortifolio.length;
            i++
          ) {
            this.projetosAtivosPorMes[i]++;
          }
        }
        // Remove 1 para o último valor de log do mês diferente de Ativo
        let mesLogAlteracaoProjeto = statusProjeto.filter(
          (s) =>
            s.dataAlteracao.getMonth() == mesPortifolio.getMonth() &&
            s.dataAlteracao.getFullYear() == mesPortifolio.getFullYear()
        );

        if (mesLogAlteracaoProjeto.length > 0) {
          if (
            mesLogAlteracaoProjeto[mesLogAlteracaoProjeto.length - 1]
              .valorAtual != 'Ativo'
          ) {
            this.projetosAtivosPorMes[
              this.dataMesesPortifolio.indexOf(mesPortifolio)
            ]--;
          }
        }
      });
    });
    // Preenchimento de array vazio para os dados do gráfico
    this.projetosAtivosPorMesPorcentagem.length =
      this.dataMesesPortifolio.length;
    this.projetosAtivosPorMesPorcentagem.fill(0);

    let somaProjetos =
      this.portifolio.preProjetos.length +
      this.portifolio.projetosPlurianuais.length;
    // Cálculo de porcentagem para cada item do array
    this.projetosAtivosPorMesPorcentagem = this.projetosAtivosPorMes.map(
      (projetoAtivo) => {
        if (projetoAtivo > 0) {
          return Number(((projetoAtivo / somaProjetos) * 100).toFixed(2));
        } else {
          return 0;
        }
      }
    );
  }

  montarGrafico() {
    new Chart(this.ctx, {
      data: {
        datasets: [
          {
            label: 'Projetos Aprovados',
            data: this.listaTotalProjetos,
            backgroundColor: '#7744A1',
            borderColor: '#7744A1',
            type: 'line',
          },
          {
            label: 'Projetos Ativos',
            type: 'bar',
            data: this.projetosAtivosPorMesPorcentagem,
            backgroundColor: '#BACF36',
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
          tooltip: {
            xAlign: 'center',
            yAlign: 'center',
            bodyAlign: 'center',
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';

                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('pt-BR', {
                    style: 'percent',
                  }).format(context.parsed.y / 100);
                }
                return label;
              },
            },
          },
        },
        scales: {
          y: {
            display: true,
            position: 'right',
            min: 0,
            ticks: {
              callback: function (value, index, ticks) {
                return value + '%';
              },
              
            },
            offset: true,
          },
        },
      },
    });
  }
}
