import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RelatorioOrcamentoDto } from '../../../../../../web-api-client';

@Component({
  selector: 'app-orcamento-situacao',
  templateUrl: './orcamento-situacao.component.html',
  styleUrls: ['./orcamento-situacao.component.scss']
})
export class OrcamentoSituacaoComponent implements OnInit, OnChanges {
  @Input() relatorio: RelatorioOrcamentoDto;
  porcentagemDentroOrcamento: number;
  porcentagemForaOrcamento: number;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calcularPorcentagens();
  }

  calcularPorcentagens(){
    let numeroProjetosDentroOrcamento = 0;
    let numeroProjetosForaOrcamento = 0;
    this.relatorio.preProjetos.filter(x => !!x.codigoCentroCusto).forEach(preProjeto => {
      let orcado = this.relatorio.orcamentos?.filter(x => x.codigoCentroCusto === preProjeto.codigoCentroCusto).map(x => x.orcado).reduce((a,b) => a+b, 0);
      let realizado = this.relatorio.orcamentos?.filter(x => x.codigoCentroCusto === preProjeto.codigoCentroCusto).map(x => x.realizado).reduce((a,b) => a+b, 0);
      if(orcado >= realizado){
        numeroProjetosDentroOrcamento++;
      }else{
        numeroProjetosForaOrcamento++;
      }
    });
    this.relatorio.plurianuais.filter(x => !!x.codigoCentroCusto).forEach(plurianual => {
      let orcado = this.relatorio.orcamentos?.filter(x => x.codigoCentroCusto === plurianual.codigoCentroCusto).map(x => x.orcado).reduce((a,b) => a+b, 0);
      let realizado = this.relatorio.orcamentos?.filter(x => x.codigoCentroCusto === plurianual.codigoCentroCusto).map(x => x.realizado).reduce((a,b) => a+b, 0);
      if(orcado >= realizado){
        numeroProjetosDentroOrcamento++;
      }else{
        numeroProjetosForaOrcamento++;
      }
    });
    this.porcentagemDentroOrcamento = (numeroProjetosDentroOrcamento/(numeroProjetosDentroOrcamento + numeroProjetosForaOrcamento))*100;
    this.porcentagemForaOrcamento = 100 - this.porcentagemDentroOrcamento;
  }

}
