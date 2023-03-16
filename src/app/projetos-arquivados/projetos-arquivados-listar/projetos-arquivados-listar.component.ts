import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { AdClient, DepartamentosClient, DepartamentoVm, PaginatedListOfPreProjetoVm, PreProjetosClient, PreProjetosObterArquivadosQuery, PreProjetoVm, SituacaoPreProjeto, UsuarioAd } from 'web-api-client';

@Component({
  templateUrl: './projetos-arquivados-listar.component.html',
  styleUrls: ['./projetos-arquivados-listar.component.scss']
})
export class ProjetosArquivadosListarComponent implements OnInit {
  preProjetos = new PaginatedListOfPreProjetoVm();

  pageIndex = 1;
  pageSize = 10;
  carregandoProjetos: boolean;
  
  filtrosForm: UntypedFormGroup;

  departamentos: DepartamentoVm[];

  private searchGerenteProjeto$: Subject<string>;
  buscandoGerenteProjetoAd: boolean;
  gerentesProjetoAd: UsuarioAd[];

  private searchGerenteNegocio$: Subject<string>;
  buscandoGerenteNegocioAd: boolean;
  gerentesNegocioAd: UsuarioAd[];

  private searchSponsorProjeto$: Subject<string>;
  buscandoSponsorProjetoAd: boolean;
  sponsorsProjetoAd: UsuarioAd[];

  SituacaoPreProjeto = SituacaoPreProjeto;
  
  constructor(
    private adClient: AdClient,
    private departamentosClient: DepartamentosClient,
    private preProjetosClient: PreProjetosClient,
  ) { }

  ngOnInit(): void {
    this.initFiltrosForm()
    this.obterDepartamentos();
    this.initSubjectSearchGerenteProjeto();
    this.initSubjectSearchGerenteNegocio();
    this.initSubjectSearchSponsorProjeto();
  }

  private initFiltrosForm() {
    this.filtrosForm = new UntypedFormBuilder().group({
      id: [null],
      dataInicio: [null],
      dataFim: [null],
      projetoNome: [null],
      departamentoId: [null],
      loginGerenteProjeto: [null],
      loginGerenteNegocio: [null],
      loginSponsor: [null],
      situacao: [null],
    });
  }

  carregarProjetos(pageIndex: number = this.pageIndex, pageSize: number = this.pageSize): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    let filtros = this.filtrosForm.value;
    filtros.dataInicio = filtros.dataInicio && moment(moment(filtros.dataInicio).format('YYYY-MM-DD'));
    filtros.dataFim = filtros.dataFim && moment(moment(filtros.dataFim).format('YYYY-MM-DD'));

    let req = new PreProjetosObterArquivadosQuery({
      pageIndex,
      pageSize,
      ...(filtros as any),
    });

    this.carregandoProjetos = true;
    this.preProjetosClient
      .obterArquivados(req)
      .pipe(finalize(() => (this.carregandoProjetos = false)))
      .subscribe((r) => {
        this.preProjetos = r;
      });
  }
  
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.carregarProjetos(pageIndex, pageSize);
  }

  resetForm(): void {
    this.filtrosForm.reset();
  }

  private obterDepartamentos() {
    this.departamentosClient.obter().subscribe((r) => {
      this.departamentos = r;
    });
  }

  private initSubjectSearchGerenteProjeto() {
    this.searchGerenteProjeto$ = new Subject<string>();
    this.searchGerenteProjeto$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) { return of([]) }
          this.buscandoGerenteProjetoAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => { this.buscandoGerenteProjetoAd = false }),
            catchError((err) => { return EMPTY })
          );
        })
      )
      .subscribe((r) => {
        this.gerentesProjetoAd = r;
      });
  }

  private initSubjectSearchGerenteNegocio() {
    this.searchGerenteNegocio$ = new Subject<string>();
    this.searchGerenteNegocio$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) { return of([]) }
          this.buscandoGerenteNegocioAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => { this.buscandoGerenteNegocioAd = false }),
            catchError((err) => { return EMPTY })
          );
        })
      )
      .subscribe((r) => {
        this.gerentesNegocioAd = r;
      });
  }

  private initSubjectSearchSponsorProjeto() {
    this.searchSponsorProjeto$ = new Subject<string>();
    this.searchSponsorProjeto$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) {
            return of([]);
          }
          this.buscandoSponsorProjetoAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => {
              this.buscandoSponsorProjetoAd = false;
            }),
            catchError((err) => {
              return EMPTY;
            })
          );
        })
      )
      .subscribe((r) => {
        this.sponsorsProjetoAd = r;
      });
  }

  searchGerenteProjeto(value: string): void {
    this.searchGerenteProjeto$.next(value);
  }

  searchGerenteNegocio(value: string): void {
    this.searchGerenteNegocio$.next(value);
  }

  searchSponsorProjeto(value: string): void {
    this.searchSponsorProjeto$.next(value);
  }

  situacaoDescricaoProjetoTabela(projeto: PreProjetoVm) {
    if(projeto.situacao == SituacaoPreProjeto.ProjetoArquivado) {
      return projeto.projetoSituacoes[projeto.projetoSituacoes.length - 1].situacaoAnteriorDescricao
    } else {
      return projeto.situacaoDescricao
    }
  }

}
