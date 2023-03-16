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
  PaginatedListOfPermissaoAcessoDeclaracaoTrabalhoVm,
  PermissaoAcessoDeclaracaoTrabalhoTipo,
  PermissaoAcessoDeclaracaoTrabalhoVm,
  DeclaracaoTrabalhoAdicionarPermissaoAcessoCommand,
  DeclaracaoTrabalhoAlterarPermissaoAcessoCommand,
  DeclaracaoTrabalhoObterPermissoesAcessoQuery,
  DeclaracoesTrabalhoClient,
  UsuarioAd,
} from 'web-api-client';

@Component({
  selector: 'app-permissao-declaracao-trabalho-modal',
  templateUrl: './permissao-declaracao-trabalho-modal.component.html',
  styleUrls: ['./permissao-declaracao-trabalho-modal.component.scss']
})
export class PermissaoDeclaracaoTrabalhoModalComponent implements OnInit {
  @Input() declaracaotrabalhoId: number;

  PermissaoAcessoDeclaracaoTrabalhoTipo = PermissaoAcessoDeclaracaoTrabalhoTipo;
  permissoes = new PaginatedListOfPermissaoAcessoDeclaracaoTrabalhoVm();

  pageIndex = 1;
  pageSize = 5;

  form: UntypedFormGroup;
  salvando: boolean;

  editar: boolean = false;

  private searchUsuario$: Subject<string>;
  buscandoUsuarioAd: boolean;
  usuariosAd: UsuarioAd[];

  constructor(
    private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient,
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

    this.declaracoesTrabalhoClient
      .obterPermissoesAcesso(
        new DeclaracaoTrabalhoObterPermissoesAcessoQuery({
          declaracaoTrabalhoId: this.declaracaotrabalhoId,
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

    let req = new DeclaracaoTrabalhoAdicionarPermissaoAcessoCommand({
      login: (<UsuarioAd>fValue['usuario']).login,
      nome: (<UsuarioAd>fValue['usuario']).nome,
      permissao: fValue['permissao'],
      declaracaoTrabalhoId: this.declaracaotrabalhoId,
    });

    this.declaracoesTrabalhoClient.adicionarPermissaoAcesso(req).subscribe((r) => {
      this.obterPermissoes(1, this.pageSize);
      this.editar = false;
      this.form.reset();
    });
  }

  alterarPermissao() {
    let fValue = this.form.value;

    let req = new DeclaracaoTrabalhoAlterarPermissaoAcessoCommand({
      permissao: fValue['permissao'],
      id: fValue['id'],
    });

    this.declaracoesTrabalhoClient.alterarPermissaoAcesso(req).subscribe((r) => {
      this.obterPermissoes(1, this.pageSize);
      this.editar = false;
      this.form.reset();
    });
  }

  cancelar() {
    this.editar = false;
    this.form.reset();
  }

  editarPermissao(permissao: PermissaoAcessoDeclaracaoTrabalhoVm) {
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

  excluirPermissao(permissao: PermissaoAcessoDeclaracaoTrabalhoVm) {
    this.declaracoesTrabalhoClient.removerPermissaoAcesso(permissao.id).subscribe((r) => {
      this.obterPermissoes(this.pageIndex, this.pageSize);
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.obterPermissoes(pageIndex, pageSize);
  }
}
