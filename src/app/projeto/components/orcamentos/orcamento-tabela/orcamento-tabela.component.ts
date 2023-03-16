import { Component, Input, OnInit } from '@angular/core';
import { AcompanhamentoOrcamentarioVm } from 'web-api-client';

@Component({
  selector: 'app-orcamento-tabela',
  templateUrl: './orcamento-tabela.component.html',
  styleUrls: ['./orcamento-tabela.component.scss'],
})
export class OrcamentoTabelaComponent implements OnInit {
  @Input() acompanhamentoOrcamentario: AcompanhamentoOrcamentarioVm[];

  totalRevisado: number = 0;
  totalRealizado: number = 0;
  saldoTotal: number = 0;

  constructor() {}
  ngOnInit(): void {
    this.somaTotais();
  }

  somaTotais() {
    this.acompanhamentoOrcamentario.forEach((orcamentoMes) => {
      this.totalRevisado += orcamentoMes.orcado;
      this.totalRealizado += orcamentoMes.realizado;
      this.saldoTotal += orcamentoMes.orcado - orcamentoMes.realizado;
    });
  }
}
