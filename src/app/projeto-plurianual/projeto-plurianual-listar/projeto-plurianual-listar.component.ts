import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxPermissionsService } from 'ngx-permissions';
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { ModalConfirmacaoComponent } from 'src/app/shared/components/modal-confirmacao/modal-confirmacao.component';
import { AdClient, DepartamentosClient, DepartamentoVm, PaginatedListOfProjetoPlurianualVm, ProjetoPlurianualObterQuery, ProjetoPlurianualVm, ProjetosPlurianuaisClient, SituacaoProjetoPlurianual, UsuarioAd } from 'web-api-client';

@Component({
  selector: 'app-projeto-plurianual-listar',
  templateUrl: './projeto-plurianual-listar.component.html',
  styleUrls: ['./projeto-plurianual-listar.component.scss']
})
export class ProjetoPlurianualListarComponent implements OnInit {
  pageIndex = 1;
  pageSize = 10;
  projetos = new PaginatedListOfProjetoPlurianualVm();
  carregandoProjetos: boolean;
  filtrosForm: UntypedFormGroup;

  departamentos: DepartamentoVm[];

  private searchResponsavel$: Subject<string>;
  buscandoResponsavelAd: boolean;
  responsavelAd: UsuarioAd[];

  private searchSponsorProjeto$: Subject<string>;
  buscandoSponsorProjetoAd: boolean;
  sponsorsProjetoAd: UsuarioAd[];

  SituacaoProjetoPlurianual = SituacaoProjetoPlurianual;

  constructor(
    private adClient: AdClient,
    private projetosPlurianuaisClient: ProjetosPlurianuaisClient,
    private departamentosClient: DepartamentosClient,
    private nzModalService: NzModalService,
    private permissionsService: NgxPermissionsService,
  ) {}

  ngOnInit(): void {
    this.initFiltrosForm();
    this.obterDepartamentos();
    this.initSubjectSearchResponsavel();
    this.initSubjectSearchSponsorProjeto();
  }

  private initFiltrosForm() {
    this.filtrosForm = new UntypedFormBuilder().group({
      nome: [null],
      loginResponsavel: [null],
      loginSponsor: [null],
      departamentoId: [null],
      situacao: [null],
      dataInicio: [null],
      dataFim: [null],
    });
  }

  carregarProjetos(
    pageIndex: number = this.pageIndex,
    pageSize: number = this.pageSize
  ): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    let filtros = this.filtrosForm.value;

    filtros.dataInicio =
      filtros.dataInicio &&
      moment(moment(filtros.dataInicio).format('YYYY-MM-DD'));

    filtros.dataFim =
      filtros.dataFim && moment(moment(filtros.dataFim).format('YYYY-MM-DD'));

    let req = new ProjetoPlurianualObterQuery({
      pageIndex,
      pageSize,
      ...(filtros as any),
    });

    this.carregandoProjetos = true;
    this.projetosPlurianuaisClient
      .obter(req)
      .pipe(finalize(() => (this.carregandoProjetos = false)))
      .subscribe((r) => {
        this.projetos = r;
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

  private initSubjectSearchResponsavel() {
    this.searchResponsavel$ = new Subject<string>();
    this.searchResponsavel$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) {
            return of([]);
          }
          this.buscandoResponsavelAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => {
              this.buscandoResponsavelAd = false;
            }),
            catchError((err) => {
              return EMPTY;
            })
          );
        })
      )
      .subscribe((r) => {
        this.responsavelAd = r;
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

  searchResponsavel(value: string): void {
    this.searchResponsavel$.next(value);
  }

  searchSponsorProjeto(value: string): void {
    this.searchSponsorProjeto$.next(value);
  }

  excluirProjeto(projetoId: number) {
    const modal = this.nzModalService.create({
      nzContent: ModalConfirmacaoComponent,
      nzTitle: 'Confirmação',
      nzComponentParams: {
        mensagem: 'Deseja excluir o projeto?',
        textoOk: 'Excluir',
        textoCancelar: 'Cancelar',
        corCancelar: '#ff3b3b',
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.carregandoProjetos = true;
        this.projetosPlurianuaisClient
          .excluir(projetoId)
          .pipe(
            finalize(() => {
              this.carregandoProjetos = false;
            })
          )
          .subscribe((r) => {
            this.carregarProjetos(this.pageIndex, this.pageSize);
          });
      }
    });
  }

  get possuiPermissaoExcluir(): boolean {
    return 'Administrador' in this.permissionsService.getPermissions();
  }

  exibirVisualizarProjeto(projeto: ProjetoPlurianualVm) : boolean{
    let permissions = this.permissionsService.getPermissions();

    if("Administrador" in permissions) return false;

    return false;
  }
}
