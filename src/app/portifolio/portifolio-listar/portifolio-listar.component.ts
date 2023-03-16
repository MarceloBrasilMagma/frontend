import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { PaginatedListOfPortifolioRasoVm, PortifoliosClient } from 'web-api-client';

@Component({
  selector: 'app-portifolio-listar',
  templateUrl: './portifolio-listar.component.html',
  styleUrls: ['./portifolio-listar.component.scss']
})
export class PortifolioListarComponent implements OnInit {

  constructor(private portifoliosClient: PortifoliosClient) { }

  ngOnInit(): void {
    this.carregarPortifolios(this.pageIndex, this.pageSize);
  }

  pageIndex = 1;
  pageSize = 10;
  carregando = false;
  total = 0;
  portifolios = new PaginatedListOfPortifolioRasoVm();


  carregarPortifolios(pageIndex: number, pageSize: number) : void {
    this.carregando = true;
    this.portifoliosClient.obter(pageSize, pageIndex).subscribe(response => {
      this.carregando = false;
      this.total = response.totalCount;
      this.portifolios = response;
    })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.carregarPortifolios(pageIndex, pageSize);
  }
}
