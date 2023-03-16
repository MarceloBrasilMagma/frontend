import { Component, OnInit } from '@angular/core';
import { GrupoAcessoVm, GruposAcessoClient } from 'web-api-client';
import { finalize } from 'rxjs/operators';

@Component({
  templateUrl: './grupo-acesso-listar.component.html',
  styleUrls: ['./grupo-acesso-listar.component.scss'],
})
export class GrupoAcessoListarComponent implements OnInit {
  pageIndex = 1;
  pageSize = 10;
  gruposAcesso: GrupoAcessoVm[];
  carregandoGruposAcesso: boolean;

  constructor(private gruposAcessoClient: GruposAcessoClient) {}

  ngOnInit(): void {
    this.carregarGruposAcesso();
  }

  private carregarGruposAcesso() {
    this.carregandoGruposAcesso = true;
    this.gruposAcessoClient
      .obter()
      .pipe(finalize(() => (this.carregandoGruposAcesso = false)))
      .subscribe((r) => {
        this.gruposAcesso = r;
      });
  }
}
