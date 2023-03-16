import { Component, OnInit, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js';
import { PortifolioVm, TipoPreProjeto } from 'web-api-client';

@Component({
  selector: 'app-abrangencia-total',
  templateUrl: './abrangencia-total.component.html',
  styleUrls: ['./abrangencia-total.component.scss'],
})
export class AbrangenciaTotalComponent implements OnInit, AfterViewInit {
  @Input() portifolio: PortifolioVm;

  // Tipos de Projetos
  totalProjetos: number = 0;
  projetosOperacionais: number = 0;
  projetosEstrategicos: number = 0;
  projetosTaticos: number = 0;
  
  constructor() {}

  ngOnInit(): void {}

  canvas: any;
  ctx: any;
  @ViewChild('mychart') mychart: any;

  ngAfterViewInit() {
    this.quantidadeTiposProjetos();
    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    new Chart(this.ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            label: 'Dataset 1',
            data: [this.projetosTaticos, this.projetosEstrategicos],
            backgroundColor: ['#7744A1', '#BACF36'],
          },
        ],
        labels: [
          'Táticos',
          'Estratégicos',
        ],
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
                size: 16
            }
            },
          },
        },
      },
    });
  }

  quantidadeTiposProjetos() {
    if(this.portifolio.preProjetos.length > 0) {
      for (let i = 0; i < this.portifolio.preProjetos.length; i++) {
        const element = this.portifolio.preProjetos[i];
        switch (element.tipo) {
          case TipoPreProjeto.Estrategico:
            this.projetosEstrategicos++
            break;
          case TipoPreProjeto.Operacional:
            this.projetosOperacionais++
            break;
          case TipoPreProjeto.Tatico:
            this.projetosTaticos++
            break;
        }
        
      }
    }
    if(this.portifolio.projetosPlurianuais.length > 0) {
      for (let i = 0; i < this.portifolio.projetosPlurianuais.length; i++) {
        const element = this.portifolio.projetosPlurianuais[i];
        switch (element.tipo) {
          case TipoPreProjeto.Estrategico:
            this.projetosEstrategicos++
            break;
          case TipoPreProjeto.Operacional:
            this.projetosOperacionais++
            break;
          case TipoPreProjeto.Tatico:
            this.projetosTaticos++
            break;
        }
      }
    }
    this.totalProjetos = this.portifolio.preProjetos.length + this.portifolio.projetosPlurianuais.length;
  }
}
