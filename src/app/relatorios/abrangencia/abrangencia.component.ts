import { Component, DoCheck, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { PortifoliosClient, PortifolioVm, TipoPreProjeto } from 'web-api-client';

@Component({
  templateUrl: './abrangencia.component.html',
  styleUrls: ['./abrangencia.component.scss']
})
export class AbrangenciaComponent implements OnInit, DoCheck {
  portifolioId: number = +this.route.snapshot.queryParams['id'];
  portifolioIdCheck: number;
  portifolio: PortifolioVm;
  carregando = true;

  constructor(
    private route: ActivatedRoute,
    private portifolioClient: PortifoliosClient
  ) { }

  ngOnInit(): void {
    this.obterPortifolio();
  }

  ngDoCheck(): void {
    this.portifolioIdCheck = +this.route.snapshot.queryParams['id'];
    if (this.portifolioIdCheck != this.portifolioId) {
      this.portifolioId = this.portifolioIdCheck;
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
            this.carregando = false;
            this.portifolio = response;
          },
          complete: () => (this.carregando = false),
        });
    }
  }

  
}
