import { Component, Input, OnInit } from '@angular/core';
import { RelatorioOrcamentoDto } from '../../../../../../web-api-client';

@Component({
  selector: 'app-orcamento-geral',
  templateUrl: './orcamento-geral.component.html',
  styleUrls: ['./orcamento-geral.component.scss']
})
export class OrcamentoGeralComponent implements OnInit {
  @Input() relatorio: RelatorioOrcamentoDto;

  constructor() { }

  ngOnInit(): void {
  }

}
