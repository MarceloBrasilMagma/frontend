import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { EMPTY, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
} from 'rxjs/operators';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import {
  AdClient,
  PaginatedListOfProjetoVm,
  ProjetosClient,
  ProjetoVm,
  SituacaoProjeto,
  SituacaoProjetoPlurianual,
  UsuarioAd,
} from 'web-api-client';

@Component({
  selector: 'app-projeto-listar',
  templateUrl: './projeto-listar.component.html',
  styleUrls: ['./projeto-listar.component.scss'],
})
export class ProjetoListarComponent implements OnInit {
  constructor(
    private projetosClient: ProjetosClient,
    private adClient: AdClient,
    private router: Router,
    private ano: YearReferenceService
  ) {}

  ngOnInit(): void {
    this.initFiltrosForm();
    this.carregarProjetos(this.pageIndex, this.pageSize);
    this.initSubjectSearchGerenteProjeto();
    this.initSubjectSearchGerenteNegocio();
    this.initSubjectSearchSponsorProjeto();
  }

  pageIndex = 1;
  pageSize = 10;
  carregando = true;
  total = 0;
  projetos = new PaginatedListOfProjetoVm();
  evitarChamadaDuplicada = true;

  filtrosForm: UntypedFormGroup;
  situacaoProjeto = SituacaoProjeto;
  private searchGerenteProjeto$: Subject<string>;
  buscandoGerenteProjetoAd: boolean;
  gerentesProjetoAd: UsuarioAd[];

  private searchGerenteNegocio$: Subject<string>;
  buscandoGerenteNegocioAd: boolean;
  gerentesNegocioAd: UsuarioAd[];

  private searchSponsorProjeto$: Subject<string>;
  buscandoSponsorProjetoAd: boolean;
  sponsorsProjetoAd: UsuarioAd[];

  carregarProjetos(pageIndex: number, pageSize: number): void {
    if (this.evitarChamadaDuplicada) {
      this.evitarChamadaDuplicada = false;
      return;
    }

    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    let filtros = this.filtrosForm.value;

    filtros.dataInicio =
      filtros.dataInicio &&
      moment(moment(filtros.dataInicio).format('YYYY-MM-DD'));

    filtros.dataFim =
      filtros.dataFim && moment(moment(filtros.dataFim).format('YYYY-MM-DD'));

    let req = {
      pageIndex,
      pageSize,
      ...(filtros as any),
    };

    this.projetosClient
      .obter(
        req.projetoNome,
        req.situacao,
        req.loginGerenteProjeto,
        req.loginGerenteNegocio,
        req.loginSponsor,
        req.dataInicio,
        req.dataFim,
        req.pageSize,
        req.pageIndex
      )
      .subscribe(
        (response) => {
          this.carregando = false;
          this.total = response.totalCount;
          this.projetos = response;
        },
        (error) => console.log(error)
      );
  }

  editar(projeto: ProjetoVm) {
    if (projeto.possuiPlurianualPendente) {
      let plurianualPendente = projeto.projetosPlurianuais.filter(
        (x) => x.id == projeto.plurianualPendenteId
      );
      this.router.navigate(
        ['projetos-plurianuais/editar', projeto.plurianualPendenteId],
        { queryParams: { ano: plurianualPendente[0].anoReferencia } }
      );
    } else {
      this.router.navigate(['projetos/editar', projeto.id], {
        queryParams: { ano: new Date().getFullYear() },
      });
    }
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.carregarProjetos(pageIndex, pageSize);
  }

  private initFiltrosForm() {
    this.filtrosForm = new UntypedFormBuilder().group({
      projetoNome: [null],
      dataInicio: [null],
      dataFim: [null],
      loginGerenteProjeto: [null],
      loginGerenteNegocio: [null],
      loginSponsor: [null],
      situacao: [null],
    });
  }

  resetForm(): void {
    this.filtrosForm.reset();
  }

  private initSubjectSearchGerenteProjeto() {
    this.searchGerenteProjeto$ = new Subject<string>();
    this.searchGerenteProjeto$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) {
            return of([]);
          }
          this.buscandoGerenteProjetoAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => {
              this.buscandoGerenteProjetoAd = false;
            }),
            catchError((err) => {
              return EMPTY;
            })
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
          if (!value || value.length < 4) {
            return of([]);
          }
          this.buscandoGerenteNegocioAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => {
              this.buscandoGerenteNegocioAd = false;
            }),
            catchError((err) => {
              return EMPTY;
            })
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

  obterGerente(projeto: ProjetoVm) {
    if (projeto.projetosPlurianuais.length === 0) {
      return projeto.preProjeto?.nomeGerenteProjeto;
    }

    let plurianuaisAprovados = projeto.projetosPlurianuais
      .filter(
        (x) =>
          x.situacao === SituacaoProjetoPlurianual.ProjetoPlurianualValidado ||
          x.situacao ===
            SituacaoProjetoPlurianual.ProjetoPlurianualValidadoRessalvas
      )
      .sort((a, b) => b.anoReferencia - a.anoReferencia);

    if (plurianuaisAprovados.length === 0) {
      return projeto.preProjeto?.nomeGerenteProjeto;
    }

    return plurianuaisAprovados[0].nomeResponsavel;
  }

  obterSponsor(projeto: ProjetoVm) {
    if (projeto.projetosPlurianuais.length === 0) {
      return projeto.preProjeto?.nomeSponsor;
    }

    let plurianuaisAprovados = projeto.projetosPlurianuais
      .filter(
        (x) =>
          x.situacao === SituacaoProjetoPlurianual.ProjetoPlurianualValidado ||
          x.situacao ===
            SituacaoProjetoPlurianual.ProjetoPlurianualValidadoRessalvas
      )
      .sort((a, b) => b.anoReferencia - a.anoReferencia);

    if (plurianuaisAprovados.length === 0) {
      return projeto.preProjeto?.nomeSponsor;
    }

    return plurianuaisAprovados[0].nomeSponsor;
  }
}
