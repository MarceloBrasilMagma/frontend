import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
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
  GrupoAcessoVm,
  GruposAcessoClient,
  SituacaoUsuario,
  UsuarioAd,
  UsuarioAlterarCommand,
  UsuarioCriarCommand,
  UsuariosClient,
  UsuarioVincularDesvincularGrupoCommand,
  UsuarioVm,
} from 'web-api-client';

@Component({
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.scss'],
})
export class UsuarioFormComponent implements OnInit {
  form: UntypedFormGroup;
  salvandoUsuario: boolean;

  usuarioId;
  usuario: UsuarioVm;
  carregandousuario: boolean;

  SituacaoUsuario = SituacaoUsuario;

  private searchUsuario$: Subject<string>;
  buscandoUsuarioAd: boolean;
  usuariosAd: UsuarioAd[];

  addGrupoAcessoInput: GrupoAcessoVm;
  gruposAcesso: GrupoAcessoVm[];
  vinculandoOuDesvinculandoGrupoAcesso: boolean;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private nzModalService: NzModalService,
    private nzNotificationService: NzNotificationService,
    private adClient: AdClient,
    private usuariosClient: UsuariosClient,
    private gruposAcessoClient: GruposAcessoClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.carregarGruposAcesso();
    this.initSubjectSearchUsuario();

    this.usuarioId = this.route.snapshot.paramMap.get('id');
    if (this.usuarioId) {
      this.carregarUsuario();
    }
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      usuarioAd: [null],
      login: [null, Validators.required],
      nome: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      situacao: [SituacaoUsuario.Ativo, Validators.required],
    });
  }

  private carregarUsuario() {
    this.carregandousuario = true;
    this.usuariosClient
      .obterPorId(this.usuarioId)
      .pipe(
        finalize(() => {
          this.carregandousuario = false;
        })
      )
      .subscribe((r) => {
        this.usuario = r;
        this.form.patchValue(r);

        let usuarioAd = <UsuarioAd>{
          login: r.login,
          nome: r.nome,
          email: r.email,
        };
        this.form.patchValue({ usuarioAd });
        this.usuariosAd = [usuarioAd];
      });
  }

  private carregarGruposAcesso() {
    this.gruposAcessoClient.obter().subscribe((r) => {
      this.gruposAcesso = r;
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
      this.usuarioId ? this.atualizarUsuario() : this.cadastrarUsuario();
    }
  }

  private cadastrarUsuario() {
    const fValue = this.form.value;
    const req = UsuarioCriarCommand.fromJS(fValue);

    this.salvandoUsuario = true;
    this.usuariosClient
      .criar(req)
      .pipe(
        finalize(() => {
          this.salvandoUsuario = false;
        })
      )
      .subscribe((r) => {
        this.nzNotificationService.success(
          'Usuário cadastrado com sucesso!',
          ''
        );
        this.router.navigate(['/usuarios', 'editar', r.id]);
      });
  }

  private atualizarUsuario() {
    const fValue = this.form.value;
    const req = UsuarioAlterarCommand.fromJS(fValue);

    this.salvandoUsuario = true;
    this.usuariosClient
      .alterar(req)
      .pipe(
        finalize(() => {
          this.salvandoUsuario = false;
        })
      )
      .subscribe((r) => {
        this.nzNotificationService.success(
          'Usuário atualizado com sucesso!',
          ''
        );

        this.router.navigate(['/usuarios']);
      });
  }

  searchUsuario(value: string): void {
    this.searchUsuario$.next(value);
  }

  onChangeUsuario(u: UsuarioAd) {
    if (!!u) {
      this.form.patchValue(u);
    }
  }

  vincularGrupoAcesso(g: GrupoAcessoVm) {
    this.vinculandoOuDesvinculandoGrupoAcesso = true;
    this.usuariosClient
      .vincularDesvincularGrupo(
        UsuarioVincularDesvincularGrupoCommand.fromJS({
          vincular: true,
          usuarioId: this.usuarioId,
          grupoAcessoId: g.id,
        })
      )
      .pipe(
        finalize(() => {
          this.vinculandoOuDesvinculandoGrupoAcesso = false;
          this.addGrupoAcessoInput = null;
        })
      )
      .subscribe((r) => {
        this.usuario.grupos = [...this.usuario.grupos, g];
        this.nzNotificationService.success('Grupo vínculado com sucesso!', '');
      });
  }

  desvincularGrupoAcesso(g: GrupoAcessoVm) {
    this.vinculandoOuDesvinculandoGrupoAcesso = true;
    this.usuariosClient
      .vincularDesvincularGrupo(
        UsuarioVincularDesvincularGrupoCommand.fromJS({
          vincular: false,
          usuarioId: this.usuarioId,
          grupoAcessoId: g.id,
        })
      )
      .pipe(
        finalize(() => {
          this.vinculandoOuDesvinculandoGrupoAcesso = false;
          this.addGrupoAcessoInput = null;
        })
      )
      .subscribe((r) => {
        this.usuario.grupos = this.usuario.grupos.filter((gp) => gp != g);
        this.nzNotificationService.success(
          'Grupo desvínculado com sucesso!',
          ''
        );
      });
  }
}
