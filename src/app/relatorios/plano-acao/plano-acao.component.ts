import { Component, DoCheck, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { PlanoAcaoVm, PortifoliosClient, PortifolioVm } from 'web-api-client';

@Component({
  templateUrl: './plano-acao.component.html',
  styleUrls: ['./plano-acao.component.scss']
})
export class PlanoDeAcaoComponent implements OnInit, DoCheck {
  portifolioId: number = +this.route.snapshot.queryParams['id'];
  portifolioIdCheck: number;
  portifolio: PortifolioVm;
  carregando = true;
  planosAcoesPortifolio: PlanoAcaoVm[] = []

  constructor(private route: ActivatedRoute, private portifolioClient: PortifoliosClient) { }

  ngOnInit(): void {
    this.obterPortifolio();
  }

  ngDoCheck(): void {
    this.portifolioIdCheck = +this.route.snapshot.queryParams['id'];
    if (this.portifolioIdCheck != this.portifolioId) {
      this.portifolioId = this.portifolioIdCheck;
      this.planosAcoesPortifolio = []
      this.obterPortifolio();
    }
  }

  obterPortifolio() {
    if (this.portifolioId) {
      this.carregando = true;
      this.portifolioClient
        .obterPorId(this.portifolioId)
        .pipe(first())
        .subscribe({
          next: (response: PortifolioVm) => {
            this.portifolio = response;
            this.obterPlanosAcoesPortifolio()
            
          },
          complete: () => (this.carregando = false),
        });
    }
  }

  obterPlanosAcoesPortifolio() {
    for (let i = 0; i < this.portifolio.preProjetos.length; i++) {
      const element = this.portifolio.preProjetos[i].planosAcoes;
      this.planosAcoesPortifolio = this.planosAcoesPortifolio.concat(element)
    }
    for (let i = 0; i < this.portifolio.projetosPlurianuais.length; i++) {
      const element = this.portifolio.projetosPlurianuais[i].planosAcoes;
      this.planosAcoesPortifolio = this.planosAcoesPortifolio.concat(element)
    }
  }

}
