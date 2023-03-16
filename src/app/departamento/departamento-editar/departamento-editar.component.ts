import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { AdClient, DepartamentoAlterarCommand, DepartamentoCriarCommand, DepartamentosClient, DepartamentoVm, SituacaoDepartamento, TipoDepartamento, UsuarioAd } from 'web-api-client';

@Component({
  selector: 'app-departamento-editar',
  templateUrl: './departamento-editar.component.html',
  styleUrls: ['./departamento-editar.component.scss']
})
export class DepartamentoEditarComponent implements OnInit {

  departamentoId;

  dpt: DepartamentoVm
  departamentos = <DepartamentoVm[]> []

  form: UntypedFormGroup;
  salvandoDepartamento: boolean

  SituacaoDepartamento = SituacaoDepartamento;
  tipoDepartamento = TipoDepartamento;

  private searchUsuario$: Subject<string>;
  buscandoUsuarioAd: boolean;
  usuariosAd: UsuarioAd[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departamentoClient: DepartamentosClient,
    private adClient: AdClient,
    private nzNotificationService: NzNotificationService,
    private nzModalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.carregarDepartamentos();
    this.initSubjectSearchUsuario();
    this.initForm();
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      gestorUsuario:  [null, Validators.required],
      departamentoSuperiorId: [null],
      sigla: [null, Validators.required],
      nome: [null, Validators.required],
      situacao: [SituacaoDepartamento.Ativo, Validators.required],
      tipo: [null, Validators.required],
    });
  }

  carregarDepartamentos(){
    this.departamentoId = this.route.snapshot.paramMap.get('id');

    this.departamentoClient.obter().subscribe( r => {
      this.departamentos = r;
      this.dpt = this.departamentos.find(x => { return x.id == <number>this.departamentoId})

      if(!!this.departamentoId){
        let gestorUsuario = <UsuarioAd>{
          login: this.dpt.loginGestor,
          nome: this.dpt.nomeGestor,
        };
        this.usuariosAd = [gestorUsuario];

        this.form.patchValue({
          ...this.dpt,
          departamentoSuperiorId: this.dpt.departamentoSuperiorVm?.id,
          gestorUsuario: gestorUsuario,
        });
      }
    })
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

  onChangeUsuario(u: UsuarioAd) {
    // if (!!u) {
    //   this.form.patchValue(u);
    // }
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
      this.departamentoId ? this.atualizarDepartamento() : this.cadastrarDepartamento();
    }
  }

  private cadastrarDepartamento() {
    let fValue = this.form.value;
    let req = DepartamentoCriarCommand.fromJS(fValue);
    req.loginGestor = (<UsuarioAd>fValue["gestorUsuario"]).login
    req.nomeGestor = (<UsuarioAd>fValue["gestorUsuario"]).nome

    this.departamentoClient
      .criar(req)
      .pipe(
            finalize(() => {
              this.salvandoDepartamento = false;
            })
          )
      .subscribe(
        r => {
          this.nzNotificationService.success(
            'Departamento cadastrado com sucesso!',
            ''
          );
          this.router.navigate(['/departamentos']);
        }
      )
  }

  private atualizarDepartamento() {
    let fValue = this.form.value;
    let req = DepartamentoAlterarCommand.fromJS(fValue);
    req.loginGestor = (<UsuarioAd>fValue["gestorUsuario"]).login
    req.nomeGestor = (<UsuarioAd>fValue["gestorUsuario"]).nome

    this.departamentoClient
      .alterar(req)
      .pipe(
            finalize(() => {
              this.salvandoDepartamento = false;
            })
          )
      .subscribe(
        r => {
          this.nzNotificationService.success(
            'Departamento alterado com sucesso!',
            ''
          );
          this.router.navigate(['/departamentos']);
        }
      )
  }
}
