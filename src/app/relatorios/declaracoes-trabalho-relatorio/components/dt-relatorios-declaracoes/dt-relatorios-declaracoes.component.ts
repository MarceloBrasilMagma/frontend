import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { DeclaracaoTrabalhoRelatorioDto, DeclaracaoTrabalhoSituacao } from '../../../../../../web-api-client';

@Component({
  selector: 'app-dt-relatorios-declaracoes',
  templateUrl: './dt-relatorios-declaracoes.component.html',
  styleUrls: ['./dt-relatorios-declaracoes.component.scss']
})
export class DtRelatoriosDeclaracoesComponent implements OnInit, OnChanges {
  @Input() dts: DeclaracaoTrabalhoRelatorioDto[];
  @ViewChild('mychart') mychart: any;
  canvas: any;
  ctx: any;
  chart: any;
  qtdElaboracao: number[] = [];
  qtdAguardandoFornecedor: number[] = [];
  qtdRespondida: number[] = [];
  qtdAguardandoClassificacao: number[] = [];
  qtdClassificacaoRealizada: number[] = [];
  qtdFinalizada: number[] = [];
  qtdCancelada: number[] = [];
  qtdAguardandoAjustes: number[] = [];
  qtdAjustesRealizados: number[] = [];
  situacoes: DeclaracaoTrabalhoSituacao[];
  declaracaoTrabalhoSituacao = DeclaracaoTrabalhoSituacao;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.agruparDados();
    this.carregarGrafico();
  }

  ngAfterViewInit() {
    this.agruparDados();
    this.carregarGrafico();
  }

  carregarGrafico(){
    if(!!this.chart) this.chart.destroy();

    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    this.chart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        datasets: [
          {
            label: 'Em Elaboração',
            data: this.qtdElaboracao,
            backgroundColor: '#ede379',
          },
          {
            label: 'Aguardando Fornecedor',
            data: this.qtdAguardandoFornecedor,
            backgroundColor: '#eda479',
          },
          {
            label: 'Respondida',
            data: this.qtdRespondida,
            backgroundColor: '#38803f',
          },
          {
            label: 'Aguardando Classificação',
            data: this.qtdAguardandoClassificacao,
            backgroundColor: '#73c5e6',
          },
          {
            label: 'Classificação Realizada',
            data: this.qtdClassificacaoRealizada,
            backgroundColor: '#315b6b',
          },
          {
            label: 'Finalizados',
            data: this.qtdFinalizada,
            backgroundColor: '#BACF36',
          },
          {
            label: 'Cancelados',
            data: this.qtdCancelada,
            backgroundColor: '#CC4123',
          },
          {
            label: 'Aguardando Ajustes',
            data: this.qtdAguardandoAjustes,
            backgroundColor: '#87734d',
          },
          {
            label: 'Ajustes Realizados',
            data: this.qtdAjustesRealizados,
            backgroundColor: '#0744A1',
          },
        ],
        labels: [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez',
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            position: 'right',
            min: 0
          },
        },
      },
    });

  }

  agruparDados() {
    
    this.qtdElaboracao = [];
    this.qtdAguardandoFornecedor = [];
    this.qtdRespondida = [];
    this.qtdAguardandoClassificacao = [];
    this.qtdClassificacaoRealizada = [];
    this.qtdFinalizada = [];
    this.qtdCancelada = [];
    this.qtdAguardandoAjustes = [];
    this.qtdAjustesRealizados = [];

    for (let i = 1; i < 13; i++) {
      this.qtdElaboracao.push(this.dts.filter(x => x.mesCriacao === i && x.situacao === DeclaracaoTrabalhoSituacao.Elaboracao).length);
      this.qtdAguardandoFornecedor.push(this.dts.filter(x => x.mesCriacao === i && x.situacao === DeclaracaoTrabalhoSituacao.AguardandoFornecedor).length);
      this.qtdRespondida.push(this.dts.filter(x => x.mesCriacao === i && x.situacao === DeclaracaoTrabalhoSituacao.Respondida).length);
      this.qtdAguardandoClassificacao.push(this.dts.filter(x => x.mesCriacao === i && x.situacao === DeclaracaoTrabalhoSituacao.AguardandoClassificacao).length);
      this.qtdClassificacaoRealizada.push(this.dts.filter(x => x.mesCriacao === i && x.situacao === DeclaracaoTrabalhoSituacao.ClassificacaoRealizada).length);
      this.qtdFinalizada.push(this.dts.filter(x => x.mesCriacao === i && x.situacao === DeclaracaoTrabalhoSituacao.Finalizada).length);
      this.qtdCancelada.push(this.dts.filter(x => x.mesCriacao === i && x.situacao === DeclaracaoTrabalhoSituacao.Cancelada).length);
      this.qtdAguardandoAjustes.push(this.dts.filter(x => x.mesCriacao === i && x.situacao === DeclaracaoTrabalhoSituacao.AguardandoAjustes).length);
      this.qtdAjustesRealizados.push(this.dts.filter(x => x.mesCriacao === i && x.situacao === DeclaracaoTrabalhoSituacao.AjustesRealizados).length);
    }
  }

  situacoesDts(situacao: DeclaracaoTrabalhoSituacao) {
    this.situacoes = [...new Set(this.dts.map((x) => x.situacao))];

    return this.situacoes.filter(s => s == situacao).length > 0
  }
}
