import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import {
  CestaExcluirCommand,
  CestasClient,
  PaginatedListOfCestaRasaVm,
} from 'web-api-client';

@Component({
  selector: 'app-cesta-listar',
  templateUrl: './cesta-listar.component.html',
  styleUrls: ['./cesta-listar.component.scss'],
})
export class CestaListarComponent implements OnInit {
  constructor(private cestasClient: CestasClient) {}

  ngOnInit(): void {
    this.carregarCestas(this.pageIndex, this.pageSize);
  }

  pageIndex = 1;
  pageSize = 10;
  carregando = false;
  total = 0;
  cestas = new PaginatedListOfCestaRasaVm();

  carregarCestas(pageIndex: number, pageSize: number): void {
    this.carregando = true;
    this.cestasClient.obter(pageSize, pageIndex).subscribe((response) => {
      this.carregando = false;
      this.total = response.totalCount;
      this.cestas = response;
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.carregarCestas(pageIndex, pageSize);
  }
}
