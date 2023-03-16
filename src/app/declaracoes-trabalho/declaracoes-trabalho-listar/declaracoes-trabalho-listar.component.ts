import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
  DeclaracaoTrabalhoObterQuery,
  DeclaracaoTrabalhoSituacao,
  DeclaracaoTrabalhoVm,
  DeclaracoesTrabalhoClient,
  DepartamentosClient,
  DepartamentoVm,
  PaginatedListOfDeclaracaoTrabalhoVm,
  PaginatedListOfSearchProjetoDto,
  SearchProjetoDto,
  SearchProjetoQuery,
} from 'web-api-client';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
} from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { EMPTY, of, Subject } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  templateUrl: './declaracoes-trabalho-listar.component.html',
  styleUrls: ['./declaracoes-trabalho-listar.component.scss'],
})
export class DeclaracoesTrabalhoListarComponent implements OnInit {
  pageIndex = 1;
  pageSize = 10;
  declaracoesTrabalho = new PaginatedListOfDeclaracaoTrabalhoVm();
  carregandoDts: boolean;
  filtrosForm: UntypedFormGroup;

  departamentos: DepartamentoVm[];

  private searchProjeto$: Subject<string>;
  buscandoProjeto: boolean;
  projetos: SearchProjetoDto[];

  DeclaracaoTrabalhoSituacao = DeclaracaoTrabalhoSituacao;

  constructor(
    private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient,
    private departamentosClient: DepartamentosClient,
    private permissionsService: NgxPermissionsService,
  ) {}

  ngOnInit(): void {
    this.initFiltrosForm();
    if(!!sessionStorage.getItem('filtroDT')) {
      this.filtrosForm.patchValue(JSON.parse(sessionStorage.getItem('filtroDT')))
      this.carregarDTs(this.pageIndex, this.pageSize)
    }
    this.obterDepartamentos();
    this.initSubjectSearchProjeto();
  }

  private initFiltrosForm() {
    this.filtrosForm = new UntypedFormBuilder().group({
      id: [null],
      projetoNome: [null],
      departamentoId: [null],
      loginResponsavel: [null],
      nomeResponsavel: [null],
      situacao: [null],
    });
  }

  carregarDTs(
    pageIndex: number = this.pageIndex,
    pageSize: number = this.pageSize
  ): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    let filtros = this.filtrosForm.value;

    let req = new DeclaracaoTrabalhoObterQuery({
      pageIndex,
      pageSize,
      ...(filtros as any),
    });

    this.carregandoDts = true;
    this.declaracoesTrabalhoClient
      .obter(req)
      .pipe(finalize(() => (this.carregandoDts = false)))
      .subscribe((r) => {
        this.declaracoesTrabalho = r;
      });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.carregarDTs(pageIndex, pageSize);
  }

  resetForm(): void {
    this.filtrosForm.reset();
    sessionStorage.removeItem('filtroDT')
    this.carregarDTs(1, 10);
  }

  private obterDepartamentos() {
    this.departamentosClient.obter().subscribe((r) => {
      this.departamentos = r;
    });
  }

  private initSubjectSearchProjeto() {
    this.searchProjeto$ = new Subject<string>();
    this.searchProjeto$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) {
            return of(new PaginatedListOfSearchProjetoDto());
          }
          this.buscandoProjeto = true;
          return this.declaracoesTrabalhoClient
            .searchProjeto(<SearchProjetoQuery>{
              nome: value,
              pageIndex: 1,
              pageSize: 100,
            })
            .pipe(
              finalize(() => {
                this.buscandoProjeto = false;
              }),
              catchError((err) => {
                return EMPTY;
              })
            );
        })
      )
      .subscribe((r) => {
        this.projetos = r.items;
      });
  }

  searchProjeto(value: string): void {
    this.searchProjeto$.next(value);
  }

  corTagSituacao(declaracao: DeclaracaoTrabalhoVm) {
    switch(declaracao.situacao){
      case (DeclaracaoTrabalhoSituacao.Elaboracao): return"gray";
      case (DeclaracaoTrabalhoSituacao.AguardandoFornecedor): return"gold";
      case (DeclaracaoTrabalhoSituacao.Respondida): return"blue";
      case (DeclaracaoTrabalhoSituacao.AguardandoClassificacao): return"orange";
      case (DeclaracaoTrabalhoSituacao.ClassificacaoRealizada): return"geekblue";
      case (DeclaracaoTrabalhoSituacao.Finalizada): return"green";
      case (DeclaracaoTrabalhoSituacao.Cancelada): return"red";
      case (DeclaracaoTrabalhoSituacao.AguardandoAjustes): return"gray";
      case (DeclaracaoTrabalhoSituacao.AjustesRealizados): return"gold";
    }
  }

  getEditarToolTip(dt: DeclaracaoTrabalhoVm): string {
    return 'Visualizar DT';
  }

  s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }

  async exportar() {
    this.carregandoDts = true;
    let filtros = this.filtrosForm.value;
    this.declaracoesTrabalhoClient
      .exportar(<DeclaracaoTrabalhoObterQuery>{
        pageIndex: 0,
        pageSize: 0,
        ...(filtros as any),
      })
      .pipe(finalize(() => (this.carregandoDts = false)))
      .subscribe((r) => {
        var blob = new Blob([this.s2ab(atob(r.arquivoBase64))], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,',
        });
        let objectUrl = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.setAttribute('style', 'display: none');
        a.href = objectUrl;
        a.download = r.nomeArquivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(objectUrl);
        a.remove();
      });
  }

  getDataEntregaFornecedor(dt : DeclaracaoTrabalhoVm) : string {
    if(dt.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor)
      return !dt.dataEntregaFornecedor ? "-" : dt.dataEntregaFornecedor?.toLocaleDateString()
    else if(dt.situacao == DeclaracaoTrabalhoSituacao.AguardandoClassificacao)
      return !dt.dataEntregaClassificacaoContabil ? "-" : dt.dataEntregaClassificacaoContabil?.toLocaleDateString()
    else return "-"
  }

  possuiPermissaoEditar(permissoes: string[]): boolean {
   
    var possuiPermissao = false;

    if (permissoes == null) possuiPermissao;

    var permissions = this.permissionsService.getPermissions();

    permissoes.forEach((element) => {
      if (element in permissions) {
        possuiPermissao = true;
        return;
      }
    });

    return possuiPermissao;
  }
}
