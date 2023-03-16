import { Component, Input, OnInit, ViewChild } from '@angular/core';
import moment from 'moment';
import { PortifolioVm, StatusCronograma } from 'web-api-client';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-cronograma-controle-prazo',
  templateUrl: './cronograma-controle-prazo.component.html',
  styleUrls: ['./cronograma-controle-prazo.component.scss'],
})
export class CronogramaControlePrazoComponent implements OnInit {
  @Input() portifolio: PortifolioVm;

  // Linha roxa gráfico: total de projetos
  totalProjetos: number;
  listaTotalProjetos: number[] = [];

  // Gráfico de barras
  // Número e label dos meses: Intervalo entre início e fim do portfólio
  // Cada barra: Projetos concluídos e dentro do prazo
  mesesPortifolio: string[] = [];
  dataMesesPortifolio: Date[] = [];
  valoresBarrasPortifolio: number[] = [];

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
            label: 'Projetos aprovados',
            data: this.listaTotalProjetos,
            backgroundColor: '#7744A1',
            borderColor: '#7744A1',
            type: 'line',
          },
          {
            label: 'Concluídos ou Dentro do Prazo',
            type: 'bar',
            data: this.valoresBarrasPortifolio,
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
        },
        scales: {
          y: {
            position: 'right',
            min: 0,
            display: true,
          },
        },
      },
    });
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
    this.quantidadeTotalProjetos();
    this.quantidadeProjetosPorMes();
    // Usar mesesPortifolio para o eixo X do gráfico
  }

  // Valores linha roxa
  quantidadeTotalProjetos() {
    this.listaTotalProjetos.length = this.dataMesesPortifolio.length
    this.listaTotalProjetos.fill(0);

    this.portifolio.preProjetos.forEach((preProjeto) => {
      
      if(moment(this.dataMesesPortifolio[0]).diff(preProjeto.dataCriacao) >= 0) {
        for (let i = 0; i < this.dataMesesPortifolio.length; i++) {
          this.listaTotalProjetos[i]++;
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
            this.listaTotalProjetos[i]++;
          }
      }
    })
  })
    this.portifolio.projetosPlurianuais.forEach((projetoPlurianual) => {
      
      if(moment(this.dataMesesPortifolio[0]).diff(projetoPlurianual.dataCriacao) >= 0) {
        for (let i = 0; i < this.dataMesesPortifolio.length; i++) {
          this.listaTotalProjetos[i]++;
        }
      }
      this.dataMesesPortifolio.forEach((mesPortifolio) => {
        // Somar 1 para cada mês subsequente a criação do Projeto
        if (
          projetoPlurianual.dataCriacao.getMonth() == mesPortifolio.getMonth() &&
          projetoPlurianual.dataCriacao.getFullYear() == mesPortifolio.getFullYear()
        ) {
          let indiceCriacao = this.dataMesesPortifolio.indexOf(mesPortifolio);

          for (
            let i = indiceCriacao;
            i < this.dataMesesPortifolio.length;
            i++
          ) {
            this.listaTotalProjetos[i]++;
          }
      }
    })
  })
}
    // Usar listaTotalProjetos para o gráfico
  

  // Valores das barras de quantidade de projetos
  quantidadeProjetosPorMes() {
    this.valoresBarrasPortifolio.length = this.dataMesesPortifolio.length
    this.valoresBarrasPortifolio.fill(0);
    
    if (this.portifolio.preProjetos.length > 0) {
      for (let i = 0; i < this.portifolio.preProjetos.length; i++) {
        if(this.portifolio.preProjetos[i].projetoCronogramaStatus == StatusCronograma.Verde) {
          const dataUltimoCronograma = moment(this.portifolio.preProjetos[i].projetoCronogramaData);
            
          for (let i = 0; i < this.mesesPortifolio.length; i++) {
            const dataMesPortifolio = this.dataMesesPortifolio[i];
            const diferenca = moment(dataMesPortifolio).diff(dataUltimoCronograma);
            
            if (diferenca >= 0) {
              this.valoresBarrasPortifolio[i]++;
            }
          }
        }
      }
    }
    if (this.portifolio.projetosPlurianuais.length > 0) {
      for (let i = 0; i < this.portifolio.projetosPlurianuais.length; i++) {
        if(this.portifolio.projetosPlurianuais[i].projetoCronogramaStatus == StatusCronograma.Verde) {
          const dataUltimoCronograma = moment(this.portifolio.projetosPlurianuais[i].projetoCronogramaData);
            
          for (let i = 0; i < this.mesesPortifolio.length; i++) {
            const dataMesPortifolio = this.dataMesesPortifolio[i];
            const diferenca = moment(dataMesPortifolio).diff(dataUltimoCronograma,);

            if (diferenca >= 0) {
              this.valoresBarrasPortifolio[i]++;
            }
          }
        }
      }
    }
    // this.valoresBarrasPortifolio - dados das barras
  }
}
