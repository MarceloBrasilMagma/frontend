import { Component, Input, OnInit } from '@angular/core';
import { ProjetoVm, StatusCronograma } from 'web-api-client';

@Component({
  selector: 'app-conograma-indicadores',
  templateUrl: './conograma-indicadores.component.html',
  styleUrls: ['./conograma-indicadores.component.scss'],
})
export class ConogramaIndicadoresComponent implements OnInit {
  @Input() projeto: ProjetoVm;

  constructor() {}

  ngOnInit(): void {}

  get corStatus(): string {
    switch (this.projeto.cronogramaStatus) {
      case StatusCronograma.Vermelho:
        return 'red';
      case StatusCronograma.Amarelo:
        return 'gold';
      case StatusCronograma.Verde:
        return 'green';
      case null:
        return 'green';
    }
  }

  get porcentagemRevisado() {
    if (this.projeto.planejado === null) {
      return '-';
    } else {
      return Math.trunc(this.projeto.planejado) + '%';
    }
  }
  get porcentagemRealizado() {
    if (this.projeto.real === null) {
      return '-';
    } else {
      return Math.trunc(this.projeto.real) + '%';
    }
  }
}
