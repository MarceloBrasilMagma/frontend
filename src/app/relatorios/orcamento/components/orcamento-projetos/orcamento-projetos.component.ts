import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RelatorioOrcamentoDto } from "../../../../../../web-api-client";

@Component({
  selector: 'app-orcamento-projetos',
  templateUrl: './orcamento-projetos.component.html',
  styleUrls: ['./orcamento-projetos.component.scss']
})
export class OrcamentoProjetosComponent implements OnInit, OnChanges {
  @Input() relatorio: RelatorioOrcamentoDto;
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // debugger
  }

  obterRevisado(codigoCentroCusto: string): number{
    return +this.relatorio.orcamentos.filter(x => x.codigoCentroCusto === codigoCentroCusto).map(x => x.orcado).reduce((a,b) => a+b, 0).toFixed(2)
  }
  obterRealizado(codigoCentroCusto: string): number{
    return +this.relatorio.orcamentos.filter(x => x.codigoCentroCusto === codigoCentroCusto).map(x => x.realizado).reduce((a,b) => a+b, 0).toFixed(2)
  }

  obterSaldo(codigoCentroCusto: string): number{
    return +(this.obterRevisado(codigoCentroCusto) - this.obterRealizado(codigoCentroCusto)).toFixed(2);
  }
}
