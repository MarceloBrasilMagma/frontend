import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { EMPTY, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
} from 'rxjs/operators';
import {
  AdClient,
  PaginatedListOfPermissaoAcessoPreProjetoVm,
  PermissaoAcessoPreProjetoTipo,
  PermissaoAcessoPreProjetoVm,
  PreProjetoAdicionarPermissaoAcessoCommand,
  PreProjetoAlterarPermissaoAcessoCommand,
  PreProjetoObterPermissoesAcessoQuery,
  PreProjetosClient,
  UsuarioAd,
} from 'web-api-client';

@Component({
  selector: 'app-permissao-projeto-modal',
  templateUrl: './permissao-projeto-modal.component.html',
  styleUrls: ['./permissao-projeto-modal.component.scss'],
})
export class PermissaoProjetoModalComponent implements OnInit {
  @Input() preProjetoId: number;

  PermissaoAcessoPreProjetoTipo = PermissaoAcessoPreProjetoTipo;
  permissoes = new PaginatedListOfPermissaoAcessoPreProjetoVm();

  pageIndex = 1;
  pageSize = 5;

  form: UntypedFormGroup;
  salvando: boolean;

  editar: boolean = false;

  private searchUsuario$: Subject<string>;
  buscandoUsuarioAd: boolean;
  usuariosAd: UsuarioAd[];

  constructor(
    private PreProjetosClient: PreProjetosClient,
    private adClient: AdClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.obterPermissoes(this.pageIndex, this.pageSize);
    this.initSubjectSearchUsuario();
  }

  initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      usuario: [null, Validators.required],
      permissao: [null, Validators.required],
    });
  }

  obterPermissoes(pageIndex: number, pageSize: number) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    this.PreProjetosClient
      .obterPermissoesAcesso(
        new PreProjetoObterPermissoesAcessoQuery({
          projetoId: this.preProjetoId,
          pageIndex: pageIndex,
          pageSize: pageSize,
        })
      )
      .subscribe((r) => {
        this.permissoes = r;
      });
  }

  private initSubjectSearchUsuario() {
    this.searchUsuario$ = new Subject<string>();
    this.searchUsuario$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) {
            return of([]);
          }
          this.buscandoUsuarioAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => {
              this.buscandoUsuarioAd = false;
            }),
            catchError((err) => {
              return EMPTY;
            })
          );
        })
      )
      .subscribe((r) => {
        this.usuariosAd = r;
      });
  }

  searchUsuario(value: string): void {
    this.searchUsuario$.next(value);
  }

  salvar() {
    !this.form.value['id'] ? this.criarPermissao() : this.alterarPermissao()
  }

  criarPermissao() {
    let fValue = this.form.value;

    let req = new PreProjetoAdicionarPermissaoAcessoCommand({
      login: (<UsuarioAd>fValue['usuario']).login,
      nome: (<UsuarioAd>fValue['usuario']).nome,
      permissao: fValue['permissao'],
      preProjetoId: this.preProjetoId,
    });

    this.PreProjetosClient.adicionarPermissaoAcesso(req).subscribe((r) => {
      this.obterPermissoes(1, this.pageSize);
      this.editar = false;
      this.form.reset();
    });
  }

  alterarPermissao() {
    let fValue = this.form.value;

    let req = new PreProjetoAlterarPermissaoAcessoCommand({
      permissao: fValue['permissao'],
      id: fValue['id'],
    });

    this.PreProjetosClient.alterarPermissaoAcesso(req).subscribe((r) => {
      this.obterPermissoes(1, this.pageSize);
      this.editar = false;
      this.form.reset();
    });
  }

  cancelar() {
    this.editar = false;
    this.form.reset();
  }

  editarPermissao(permissao: PermissaoAcessoPreProjetoVm) {
    let usuario = new UsuarioAd({
      login: permissao.login,
      nome: permissao.nome,
    });

    this.usuariosAd = [usuario];

    this.form.patchValue({
      id: permissao.id,
      permissao: permissao.permissao,
      usuario: usuario,
    });

    this.editar = true;
  }

  excluirPermissao(permissao: PermissaoAcessoPreProjetoVm) {
    this.PreProjetosClient.removerPermissaoAcesso(permissao.id).subscribe((r) => {
      this.obterPermissoes(this.pageIndex, this.pageSize);
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.obterPermissoes(pageIndex, pageSize);
  }
}
