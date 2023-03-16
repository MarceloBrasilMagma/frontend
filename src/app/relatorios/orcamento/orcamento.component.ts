import { Component, DoCheck, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { PortifolioObterRelatorioOrcamentoQuery, PortifoliosClient, RelatorioOrcamentoDto } from '../../../../web-api-client';

@Component({
  templateUrl: './orcamento.component.html',
  styleUrls: ['./orcamento.component.scss']
})
export class OrcamentoComponent implements OnInit, DoCheck {
  relatorio: RelatorioOrcamentoDto;
  portifolioId: number;
  filtro: any;

  constructor(
    private portifoliosClient: PortifoliosClient,
    private route: ActivatedRoute
  ) { 

  }

  ngOnInit(): void {
  
  }

  ngDoCheck(): void {
    let portifolioIdCheck = +this.route.snapshot.queryParams['id'];
    if (portifolioIdCheck != this.portifolioId) {
        this.portifolioId = portifolioIdCheck;
      if(!!this.filtro) {
          this.carregarRelatorio(this.filtro)
      };
    }
    
  }
  
  carregarRelatorio(filtro){
    if(filtro) this.filtro = filtro;
    var req = <PortifolioObterRelatorioOrcamentoQuery>{
      portifolioId: isNaN(this.portifolioId) ? this.filtro.portifolioId : this.portifolioId,
      dataInicio: this.filtro.periodo[0],
      dataFim: this.filtro.periodo[1] 
    }
      this.portifoliosClient.obterRelatorioOrcamento(req).subscribe({
        next: (r: RelatorioOrcamentoDto) => {
            this.relatorio = {...r} as RelatorioOrcamentoDto;
        }, error: (error) => 
          console.log(error)
      })
    }

}
