import { Component, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { EMPTY, of, Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
  catchError,
} from 'rxjs/operators';
import {
  DiarioBordoVm,
  UsuarioAd,
  AdClient,
  DepartamentosClient,
  DepartamentoVm,
  TipoDiario,
  DiariosBordoClient,
  DiarioBordoCriarCommand,
  DiarioBordoAlterarCommand,
  ProjetoVm,
} from 'web-api-client';

@Component({
  selector: 'app-diario-bordo-form',
  templateUrl: './diario-bordo-form.component.html',
  styleUrls: ['./diario-bordo-form.component.scss'],
})
export class DiarioBordoFormComponent implements OnInit {
  @Input() diario: DiarioBordoVm;
  @Input() projetoId: number;
  @Input() projeto: ProjetoVm;

  form: UntypedFormGroup;
  saving: boolean;

  departamentos: DepartamentoVm[];

  private searchGerenteProjeto$: Subject<string>;
  buscandoGerenteProjetoAd: boolean;
  gerentesProjetoAd: UsuarioAd[];

  tipoDiario = TipoDiario;

  formSubscription: Subscription;

  exibirCamposReuniaoStatus: boolean = false;
  exibirCamposAtraso: boolean = false;

  constructor(
    private adClient: AdClient,
    private departamentosClient: DepartamentosClient,
    private diariosBordoClient: DiariosBordoClient,
    private nzModalRef: NzModalRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.obterDepartamentos();
    this.onChanges();

    this.preencherForm();

    this.initSubjectSearchGerenteProjeto();
  }

  private preencherForm() {
    if (!!this.diario) {
      let usuario = <UsuarioAd>{
        login: this.diario.loginGerenteProjeto,
        nome: this.diario.nomeGerenteProjeto,
      };

      this.gerentesProjetoAd = [usuario];

      this.form.patchValue({
        ...this.diario,
        gerenteProjeto: usuario,
        dataRegistro: moment(this.diario.dataRegistro).format('YYYY-MM-DD'),
      });
    } else {
      let usuario = <UsuarioAd>{
        login: this.projeto.loginGerenteProjeto,
        nome: this.projeto.nomeGerenteProjeto,
      };

      this.gerentesProjetoAd = [usuario];

      this.form.patchValue({
        gerenteProjeto: usuario,
        dataRegistro: moment(new Date(Date.now())).format('YYYY-MM-DD'),
      });
    }
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      gerenteProjeto: [null, Validators.required],
      dataRegistro: [null, Validators.required],
      descricao: [null, Validators.required],
      areaResponsavelAtrasoId: [null],
      motivoAtraso: [null],
      tipo: [null],
      anoReferencia: [null, Validators.required],
    });
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

  searchGerenteProjeto(value: string): void {
    this.searchGerenteProjeto$.next(value);
  }

  protected destroyModal(ok: boolean): void {
    this.nzModalRef.destroy(ok);
  }

  protected ok() {
    this.destroyModal(true);
  }

  protected cancelar() {
    this.destroyModal(false);
  }

  onChanges(): void {
    this.formSubscription = this.form.valueChanges
      .pipe(debounceTime(900))
      .subscribe((val) => {
        let tipo = this.form.value['tipo'];
        this.exibirCamposReuniaoStatus =
          !!tipo && tipo == this.tipoDiario.ReuniaoStatus;
      });
  }

  salvar() {
    if (!this.diario) {
      this.criar();
    } else {
      this.alterar();
    }
  }

  criar() {
    let fValue = this.form.value;

    let req = <DiarioBordoCriarCommand>{
      ...fValue,
    };

    req.loginGerenteProjeto = fValue['gerenteProjeto'].login;
    req.nomeGerenteProjeto = fValue['gerenteProjeto'].nome;

    req.projetoId = this.projetoId;

    this.saving = true;

    this.diariosBordoClient
      .criar(req)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe((r) => {
        this.ok();
      });
  }

  alterar() {
    let fValue = this.form.value;

    let req = <DiarioBordoAlterarCommand>{
      ...fValue,
    };

    req.loginGerenteProjeto = fValue['gerenteProjeto'].login;
    req.nomeGerenteProjeto = fValue['gerenteProjeto'].nome;

    req.id = this.diario.id;
    if (!req.areaResponsavelAtrasoId) {
      req.areaResponsavelAtrasoId = null;
    }

    this.saving = true;
    this.diariosBordoClient
      .alterar(req)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe((r) => {
        this.ok();
      });
  }
}
