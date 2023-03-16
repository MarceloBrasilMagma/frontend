import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart } from 'chart.js';
import {
  DeclaracaoTrabalhoRelatorioDto,
  DeclaracaoTrabalhoSituacao,
} from '../../../../../../web-api-client';

@Component({
  selector: 'app-dt-relatorios-situacao',
  templateUrl: './dt-relatorios-situacao.component.html',
  styleUrls: ['./dt-relatorios-situacao.component.scss'],
})
export class DtRelatoriosSituacaoComponent implements OnInit, OnChanges {
  @Input() dts: DeclaracaoTrabalhoRelatorioDto[];
  @ViewChild('mychart') mychart: any;
  canvas: any;
  ctx: any;
  chart: any;
  situacoes: DeclaracaoTrabalhoSituacao[];
  situacoesDescricao: string[];
  qtdSituacoes: number[] = [];
  coresSituacoes: string[] = [];

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.agruparDados();
    this.carregarGrafico();
  }

  ngAfterViewInit() {
    this.agruparDados();
    this.carregarGrafico();
  }

  carregarGrafico() {
    if (!!this.chart) this.chart.destroy();

    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    this.chart = new Chart(this.ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            label: 'Dataset 1',
            data: this.qtdSituacoes,
            backgroundColor: this.coresSituacoes
          },
        ],
        labels: this.situacoesDescricao,
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              boxWidth: 14,
              boxHeight: 14,
              font: {
                size: 14,
              },
            },
          },
        },
      },
    });
  }

  agruparDados() {
    this.situacoes = [...new Set(this.dts.map((x) => x.situacao))];
    this.situacoesDescricao = [
      ...new Set(this.dts.map((x) => x.situacaoDescricao)),
    ];

    this.qtdSituacoes = [];

    this.situacoes.forEach((situacao) => {
      let situacaoAtual = this.dts.filter((x) => x.situacao === situacao);
      this.qtdSituacoes.push(situacaoAtual.length);
    });

    for (let i = 0; i < this.situacoes.length; i++) {
      const element = this.situacoes[i];
      switch (element) {
        case DeclaracaoTrabalhoSituacao.Elaboracao:
          this.coresSituacoes.push('#ede379');
          break;
        case DeclaracaoTrabalhoSituacao.AguardandoFornecedor:
          this.coresSituacoes.push('#eda479');
          break;
        case DeclaracaoTrabalhoSituacao.AguardandoClassificacao:
          this.coresSituacoes.push('#73c5e6');
          break;
        case DeclaracaoTrabalhoSituacao.ClassificacaoRealizada:
          this.coresSituacoes.push('#315b6b');
          break;
        case DeclaracaoTrabalhoSituacao.AguardandoAjustes:
          this.coresSituacoes.push('#87734d');
          break;
        case DeclaracaoTrabalhoSituacao.AjustesRealizados:
          this.coresSituacoes.push('#0744A1');
          break;
        case DeclaracaoTrabalhoSituacao.Respondida:
          this.coresSituacoes.push('#38803f');
          break;
        case DeclaracaoTrabalhoSituacao.Finalizada:
          this.coresSituacoes.push('#BACF36');
          break;
        case DeclaracaoTrabalhoSituacao.Cancelada:
          this.coresSituacoes.push('#CC4123');
          break;
    }
      
    }
  }
}
