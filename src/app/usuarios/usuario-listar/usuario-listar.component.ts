import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
  DeclaracaoTrabalhoObterQuery,
  GrupoAcessoVm,
  GruposAcessoClient,
  PaginatedListOfUsuarioVm,
  UsuarioObterQuery,
  UsuariosClient,
} from 'web-api-client';
import {
  finalize,
} from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  templateUrl: './usuario-listar.component.html',
  styleUrls: ['./usuario-listar.component.scss'],
})
export class UsuarioListarComponent implements OnInit {
  pageIndex = 1;
  pageSize = 10;
  usuarios = new PaginatedListOfUsuarioVm();
  carregandoUsuarios: boolean;
  filtrosForm: UntypedFormGroup;

  gruposAcesso: GrupoAcessoVm[];

  constructor(
    private usuariosClient: UsuariosClient,
    private gruposAcessoClient: GruposAcessoClient
  ) { }

  ngOnInit(): void {
    this.initFiltrosForm();
    this.obterGruposUsuario();
  }

  private initFiltrosForm() {
    this.filtrosForm = new UntypedFormBuilder().group({
      login: [null],
      nome: [null],
      email: [null],
      grupoId: [null],
    });
  }

  carregarUsuarios(
    pageIndex: number = this.pageIndex,
    pageSize: number = this.pageSize
  ): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    let filtros = this.filtrosForm.value;

    let req = new UsuarioObterQuery({
      pageIndex,
      pageSize,
      ...(filtros as any),
    });

    this.carregandoUsuarios = true;
    this.usuariosClient
      .obter(req)
      .pipe(finalize(() => (this.carregandoUsuarios = false)))
      .subscribe((r) => {
        this.usuarios = r;
      });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.carregarUsuarios(pageIndex, pageSize);
  }

  resetForm(): void {
    this.filtrosForm.reset();
  }

  private obterGruposUsuario() {
    this.gruposAcessoClient.obter().subscribe((r) => {
      this.gruposAcesso = r;
    });
  }

}
