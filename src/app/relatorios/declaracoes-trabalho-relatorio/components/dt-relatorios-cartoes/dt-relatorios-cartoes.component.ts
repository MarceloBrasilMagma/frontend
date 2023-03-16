import { Component, Input, OnInit } from '@angular/core';
import { DeclaracaoTrabalhoRelatorioDto } from '../../../../../../web-api-client';

@Component({
  selector: 'app-dt-relatorios-cartoes',
  templateUrl: './dt-relatorios-cartoes.component.html',
  styleUrls: ['./dt-relatorios-cartoes.component.scss']
})
export class DtRelatoriosCartoesComponent implements OnInit {
  @Input() temposRetorno: any;

  constructor() { }

  ngOnInit(): void {
  }

}
