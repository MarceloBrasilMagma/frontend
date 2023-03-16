import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ProjetoVm } from 'web-api-client';

@Component({
  selector: 'app-plano-acao-relatorio',
  templateUrl: './plano-acao-relatorio.component.html',
  styleUrls: ['./plano-acao-relatorio.component.scss']
})
export class PlanoAcaoRelatorioComponent implements OnInit, OnChanges {
  @Input() projeto: ProjetoVm;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnInit(): void {

  }

  get realizadoPorcentagem(): string {
    let result = !!this.projeto?.quantidadeTotal ?  this.projeto?.quantidadeRealizado / this.projeto?.quantidadeTotal : 0

    return (result * 100).toFixed(2)
  }

  get canceladoPorcentagem(): string {
    let result = !!this.projeto?.quantidadeTotal ? this.projeto?.quantidadeCancelado / this.projeto?.quantidadeTotal : 0

    return (result * 100).toFixed(2)
  }

  get emAndamentoPorcentagem(): string {
    let result = !!this.projeto?.quantidadeTotal ? this.projeto?.quantidadeEmAndamento / this.projeto?.quantidadeTotal : 0

    return (result * 100).toFixed(2)
  }

  get atrasadoPorcentagem(): string {
    let result = !!this.projeto?.quantidadeTotal ?  this.projeto?.quantidadeAtrasado / this.projeto?.quantidadeTotal : 0

    return (result * 100).toFixed(2)
  }

  eixibirRelatorio() : boolean{
    return !!this.projeto
  }
}
