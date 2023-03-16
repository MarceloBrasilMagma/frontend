import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import {
  AdClient,
  GrupoAcessoVm,
  GrupoAcessoAlterarCommand,
  GrupoAcessoCriarCommand,
  GruposAcessoClient,
  GrupoAcessoVincularDesvincularPermissaoCommand,
  PermissaoAcessoVm,
  PermissoesAcessoClient,
  UsuarioAd,
  UsuariosClient,
  UsuarioVincularDesvincularGrupoCommand,
  UsuarioVm,
  GrupoAcessoObterTodosUsuariosQuery,
  PaginatedListOfUsuarioVm,
} from 'web-api-client';

@Component({
  templateUrl: './grupo-acesso-form.component.html',
  styleUrls: ['./grupo-acesso-form.component.scss'],
})
export class GrupoAcessoFormComponent implements OnInit {
  form: UntypedFormGroup;
  salvandoGrupoAcesso: boolean;

  grupoAcessoId;
  grupoAcesso: GrupoAcessoVm;
  carregandoGrupoAcesso: boolean;

  addPermissaoInput: GrupoAcessoVm;
  permissoesAcesso: PermissaoAcessoVm[];
  vinculandoOuDesvinculandoPermissao: boolean;

  searchUsuario$: Subject<string>;
  buscandoUsuarioAd: boolean;
  usuariosAd: UsuarioAd[];

  addUsuarioInput: UsuarioAd;
  vinculandoOuDesvinculandoUsuario = false;

  usuariosGrupo = new PaginatedListOfUsuarioVm();
  usuariosPageIndex = 1;
  usuariosPageSize = 10;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private nzModalService: NzModalService,
    private nzNotificationService: NzNotificationService,
    private gruposAcessoClient: GruposAcessoClient,
    private permissoesAcessoClient: PermissoesAcessoClient,
    private adClient: AdClient,
    private usuariosClient: UsuariosClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.carregarPermissoes();

    this.grupoAcessoId = this.route.snapshot.paramMap.get('id');
    if (this.grupoAcessoId) {
      this.carregarGrupoAcesso();
    }
    this.initSubjectSearchUsuario();
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      nome: [null, Validators.required],
      administrador: [false, Validators.required],
    });
  }

  private carregarGrupoAcesso() {
    this.carregandoGrupoAcesso = true;
    this.gruposAcessoClient
      .obterPorId(this.grupoAcessoId)
      .pipe(
        finalize(() => {
          this.carregandoGrupoAcesso = false;
        })
      )
      .subscribe((r) => {
        this.grupoAcesso = r;
        this.form.patchValue(r);
      });
  }

  private carregarUsuariosGrupo(pageIndex: number, pageSize: number){
    this.usuariosPageIndex = pageIndex;
    this.usuariosPageSize = pageSize;

    this.vinculandoOuDesvinculandoUsuario = true;

    this.gruposAcessoClient.obterTodosUsuariosGrupo(new GrupoAcessoObterTodosUsuariosQuery({
      grupoAcessoId: this.grupoAcessoId,
      pageIndex: this.usuariosPageIndex,
      pageSize: this.usuariosPageSize
    })).pipe(
      finalize(() => {
        this.vinculandoOuDesvinculandoUsuario = false;
      })
    ).subscribe(r => {
      this.usuariosGrupo = r;
    })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.carregarUsuariosGrupo(pageIndex, pageSize);
  }

  private carregarPermissoes() {
    this.permissoesAcessoClient.obter().subscribe((r) => {
      this.permissoesAcesso = r;
    });
  }

  salvar() {
    if (this.form.invalid) {
      for (const key in this.form.controls) {
        this.form.controls[key].markAsDirty();
        this.form.controls[key].updateValueAndValidity();
      }
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente os campos obrigatórios!',
      });
    } else {
      this.grupoAcessoId
        ? this.atualizarGrupoAcesso()
        : this.cadastrarGrupoAcesso();
    }
  }

  private cadastrarGrupoAcesso() {
    const fValue = this.form.value;
    const req = GrupoAcessoCriarCommand.fromJS(fValue);

    this.salvandoGrupoAcesso = true;
    this.gruposAcessoClient
      .criar(req)
      .pipe(
        finalize(() => {
          this.salvandoGrupoAcesso = false;
        })
      )
      .subscribe((r) => {
        this.nzNotificationService.success(
          'Grupo de Acesso cadastrado com sucesso!',
          ''
        );
        this.router.navigate(['/grupos-acesso', 'editar', r.id]);
      });
  }

  private atualizarGrupoAcesso() {
    const fValue = this.form.value;
    const req = GrupoAcessoAlterarCommand.fromJS(fValue);

    this.salvandoGrupoAcesso = true;
    this.gruposAcessoClient
      .alterar(req)
      .pipe(
        finalize(() => {
          this.salvandoGrupoAcesso = false;
        })
      )
      .subscribe((r) => {
        this.nzNotificationService.success(
          'Grupo de Acesso atualizado com sucesso!',
          ''
        );

        this.router.navigate(['/grupos-acesso']);
      });
  }

  vincularPermissao(p: PermissaoAcessoVm) {
    this.vinculandoOuDesvinculandoPermissao = true;
    this.gruposAcessoClient
      .vincularDesvincularPermissao(
        GrupoAcessoVincularDesvincularPermissaoCommand.fromJS({
          vincular: true,
          grupoAcessoId: this.grupoAcessoId,
          permissaoAcessoId: p.id,
        })
      )
      .pipe(
        finalize(() => {
          this.vinculandoOuDesvinculandoPermissao = false;
          this.addPermissaoInput = null;
        })
      )
      .subscribe((r) => {
        this.grupoAcesso.permissoesAcesso = [
          ...this.grupoAcesso.permissoesAcesso,
          p,
        ];
        this.nzNotificationService.success(
          'Permissão vínculada com sucesso!',
          ''
        );
      });
  }

  desvincularPermissao(p: PermissaoAcessoVm) {
    this.vinculandoOuDesvinculandoPermissao = true;
    this.gruposAcessoClient
      .vincularDesvincularPermissao(
        GrupoAcessoVincularDesvincularPermissaoCommand.fromJS({
          vincular: false,
          grupoAcessoId: this.grupoAcessoId,
          permissaoAcessoId: p.id,
        })
      )
      .pipe(
        finalize(() => {
          this.vinculandoOuDesvinculandoPermissao = false;
          this.addPermissaoInput = null;
        })
      )
      .subscribe((r) => {
        this.grupoAcesso.permissoesAcesso =
          this.grupoAcesso.permissoesAcesso.filter((pc) => pc != p);
        this.nzNotificationService.success(
          'Permissão desvínculada com sucesso!',
          ''
        );
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

  vincularOuDesvincularUsuario(u: UsuarioAd, vincular: boolean) {
    this.vinculandoOuDesvinculandoUsuario = true;

    this.usuariosClient
      .vincularDesvincularGrupo(
        new UsuarioVincularDesvincularGrupoCommand({
          grupoAcessoId: this.grupoAcessoId,
          usuarioLogin: u.login,
          vincular: vincular,
        })
      )
      .pipe(
        finalize(() => {
          this.vinculandoOuDesvinculandoUsuario = false;
          this.addUsuarioInput = null;
        })
      )
      .subscribe(() => {
        this.carregarUsuariosGrupo(this.usuariosPageIndex, this.usuariosPageSize);
      });
  }
}
