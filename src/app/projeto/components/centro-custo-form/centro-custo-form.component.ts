import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
  CentroCustoAlterarCommand,
  CentroCustoCriarCommand,
  CentroCustoIncluirRespostaCommand,
  CentroCustoResponderCommand,
  CentroCustoVm,
  CentrosCustoClient,
  DepartamentosClient,
  DepartamentoVm,
  OrigemRecursos,
  PermissaoAcessoPreProjetoTipo,
  SituacaoCentroCusto,
  SituacaoProjeto,
  SituacaoSolicitacaoCentroCusto,
  StatusProjeto,
  TipoDepartamento,
  UsuarioAd,
} from 'web-api-client';

@Component({
  selector: 'app-centro-custo-form',
  templateUrl: './centro-custo-form.component.html',
  styleUrls: ['./centro-custo-form.component.scss'],
})
export class CentroCustoFormComponent implements OnInit, OnChanges {
  @Input() centroCusto: CentroCustoVm;
  @Input() projetoId: number;
  @Input() situacaoProjeto: SituacaoProjeto;
  @Input() statusProjeto: StatusProjeto;
  @Input() salvarEvent: Subject<SituacaoCentroCusto>;
  @Input() possuiPermissaoEditar: boolean;

  @Output() centroChanged = new EventEmitter<CentroCustoVm>();

  departamentos: DepartamentoVm[];
  gerencias: DepartamentoVm[];
  coordenacoes: DepartamentoVm[];
  superintendencias: DepartamentoVm[];
  diretorias: DepartamentoVm[];

  centroCustoForm: UntypedFormGroup;
  respostaForm: UntypedFormGroup;
  respostaIncluirForm: UntypedFormGroup;

  private searchSolicitante$: Subject<string>;
  buscandoSolicitanteAd: boolean;
  solicitantesAd: UsuarioAd[];

  origemRecursos = OrigemRecursos;
  situacaoSolicitacaoCentroCusto = SituacaoSolicitacaoCentroCusto;

  origem: OrigemRecursos;
  situacaoCopec: SituacaoSolicitacaoCentroCusto;
  situacaoCocup: SituacaoSolicitacaoCentroCusto;

  carregando: boolean = false;

  constructor(
    private departamentosClient: DepartamentosClient,
    private adClient: AdClient,
    private centroCustoClient: CentrosCustoClient,
    private nzNotificationService: NzNotificationService,
    private nzModalService: NzModalService
  ) {}

  ngOnInit(): void {
    if (!this.respostaIncluirForm) this.initFormrespostaIncluirForm();
    this.initSubjectSearchSolicitante();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initFormCentroCusto();
    this.initFormrespostaForm();
    this.obterDepartamentos();
    if (!!this.centroCusto) {
      this.preencherForm();
    } else {
      if (this.statusProjeto !== StatusProjeto.Ativo) {
        this.toggleForm(false);
      } else {
        this.toggleForm(true);
      }
    }
  }

  private initFormCentroCusto() {
    this.centroCustoForm = new UntypedFormBuilder().group({
      departamentoSolicianteId: [null, Validators.required],
      origemRecursos: [null, Validators.required],
      gestorSolicitante: [null, Validators.required],
      nomeSolicitacaoCentroCusto: [null, Validators.required],
      siglaSolicitacaoCentroCusto: [null, Validators.required],
      motivoSolicitacao: [null, Validators.required],
      mudancaOrganizacionalCoordenacaoId: [null],
      mudancaOrganizacionalGerenciaId: [null],
      mudancaOrganizacionalDiretoriaId: [null],
      mudancaOrganizacionalSuperintendenciaId: [null],
    });
  }

  private initFormrespostaForm() {
    this.respostaForm = new UntypedFormBuilder().group({
      situacaoCopec: [null],
      situacaoCocup: [null],
    });
  }

  private initFormrespostaIncluirForm() {
    this.respostaIncluirForm = new UntypedFormBuilder().group({
      nomeReduzido: [null, Validators.required],
      descricao: [null, Validators.required],
    });
  }

  preencherForm() {
    let solicitante = <UsuarioAd>{
      nome: this.centroCusto.nomeGestorSolicitante,
      login: this.centroCusto.loginGestorSolicitante,
    };

    this.solicitantesAd = [solicitante];

    this.origem = this.centroCusto?.origemRecursos;

    this.centroCustoForm.patchValue({
      departamentoSolicianteId: this.centroCusto.departamentoSolicianteId,
      origemRecursos: this.centroCusto?.origemRecursos,
      gestorSolicitante: solicitante,
      nomeSolicitacaoCentroCusto: this.centroCusto.nomeSolicitacaoCentroCusto,
      siglaSolicitacaoCentroCusto: this.centroCusto.siglaSolicitacaoCentroCusto,
      motivoSolicitacao: this.centroCusto.motivoSolicitacao,
      mudancaOrganizacionalGerenciaId:
        this.centroCusto.mudancaOrganizacionalGerenciaId,
      mudancaOrganizacionalDiretoriaId:
        this.centroCusto.mudancaOrganizacionalDiretoriaId,
      mudancaOrganizacionalCoordenacaoId:
        this.centroCusto.mudancaOrganizacionalCoordenacaoId,
      mudancaOrganizacionalSuperintendenciaId:
        this.centroCusto.mudancaOrganizacionalSuperintendenciaId,
    });

    this.situacaoCocup = this.centroCusto.situacaoCocup;
    this.situacaoCopec = this.centroCusto.situacaoCopec;

    this.respostaForm.patchValue({
      situacaoCopec: this.centroCusto.situacaoCopec,
      situacaoCocup: this.centroCusto.situacaoCocup,
    });

    if (this.statusProjeto !== StatusProjeto.Ativo) {
      this.toggleForm(false);
    } else {
      this.toggleForm(true);
    }
  }

  private initSubjectSearchSolicitante() {
    this.searchSolicitante$ = new Subject<string>();
    this.searchSolicitante$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) {
            return of([]);
          }
          this.buscandoSolicitanteAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => {
              this.buscandoSolicitanteAd = false;
            }),
            catchError((err) => {
              return EMPTY;
            })
          );
        })
      )
      .subscribe((r) => {
        this.solicitantesAd = r;
      });
  }

  searchSolicitante(value: string): void {
    this.searchSolicitante$.next(value);
  }

  private obterDepartamentos() {
    this.departamentosClient.obter().subscribe((r) => {
      this.departamentos = r;
      this.obterDepartamentosPorTipo();
    });
  }

  obterDepartamentosPorTipo() {
    this.gerencias = this.departamentos.filter(
      (d) => d.tipo == TipoDepartamento.Gerencia
    );
    this.coordenacoes = this.departamentos.filter(
      (d) => d.tipo == TipoDepartamento.Coordenacao
    );
    this.diretorias = this.departamentos.filter(
      (d) => d.tipo == TipoDepartamento.Diretoria
    );
    this.superintendencias = this.departamentos.filter(
      (d) => d.tipo == TipoDepartamento.Superintendencia
    );
  }

  salvar(situacao: SituacaoCentroCusto) {
    if (this.centroCustoForm.invalid) {
      this.nzNotificationService.error(
        'Erro ao salvar Centro de Custo',
        'Preencha todos os dados necessários na aba centro de custo'
      );
      return;
    }

    if (!this.centroCusto) {
      if (!situacao) this.criar(false);
      else if (situacao === SituacaoCentroCusto.AguardandoCriacao) {
        this.criar(true);
      }
    } else {
      if (!situacao) {
        if (this.centroCusto.situacao === SituacaoCentroCusto.EmElaboracao)
          this.alterar(false);

        if (
          this.centroCusto.situacao === SituacaoCentroCusto.AguardandoCriacao
        ) {
          if (this.respostaForm.invalid) {
            this.centroCusto = null;
            return;
          }
          this.responder(false);
        }
      } else if (situacao === SituacaoCentroCusto.AguardandoCriacao) {
        this.alterar(true);
      } else if (situacao === SituacaoCentroCusto.CentroCustoCriado) {
        if (this.respostaForm.invalid) {
          this.centroCusto = null;
          return;
        }
        this.responder(true);
      }
    }
  }

  criar(enviar: boolean) {
    let fValue = this.centroCustoForm.value;

    if (
      this.centroCustoForm.controls.mudancaOrganizacionalGerenciaId.value == 0
    ) {
      fValue.mudancaOrganizacionalGerenciaId = null;
    }
    if (
      this.centroCustoForm.controls.mudancaOrganizacionalSuperintendenciaId
        .value == 0
    ) {
      fValue.mudancaOrganizacionalSuperintendenciaId = null;
    }
    if (
      this.centroCustoForm.controls.mudancaOrganizacionalCoordenacaoId.value ==
      0
    ) {
      fValue.mudancaOrganizacionalCoordenacaoId = null;
    }
    if (
      this.centroCustoForm.controls.mudancaOrganizacionalDiretoriaId.value == 0
    ) {
      fValue.mudancaOrganizacionalDiretoriaId = null;
    }

    let req = CentroCustoCriarCommand.fromJS({
      ...fValue,
      loginGestorSolicitante: fValue['gestorSolicitante'].login,
      nomeGestorSolicitante: fValue['gestorSolicitante'].nome,

      projetoId: this.projetoId,
      enviarSolicitacao: enviar,
    });

    this.centroCustoClient.criar(req).subscribe(
      (r) => {
        this.nzNotificationService.success(
          'Solicitação criada com sucesso',
          ''
        );
        this.centroCusto = r;
      },
      (e) => {
        this.nzNotificationService.error('Erro ao criar solicitação', '');
      }
    );
  }

  alterar(enviar: boolean) {
    let fValue = this.centroCustoForm.value;

    let req = CentroCustoAlterarCommand.fromJS({
      ...fValue,
      id: this.centroCusto.id,
      loginGestorSolicitante: fValue['gestorSolicitante'].login,
      nomeGestorSolicitante: fValue['gestorSolicitante'].nome,

      projetoId: this.projetoId,
      enviarSolicitacao: enviar,
    });

    this.centroCustoClient.alterar(req).subscribe(
      (r) => {
        this.nzNotificationService.success(
          'Solicitação alterada com sucesso',
          ''
        );
        this.centroCusto = r;
      },
      (e) => {
        this.nzNotificationService.error('Erro ao alterar solicitação', '');
      }
    );
  }

  responder(responder: boolean) {
    let fValue = this.respostaForm.value;

    let req = CentroCustoResponderCommand.fromJS({
      ...fValue,
      id: this.centroCusto.id,
      projetoId: this.projetoId,
      responderSolicitacao: responder,
    });

    this.centroCustoClient.responder(req).subscribe(
      (r) => {
        this.nzNotificationService.success(
          'Solicitação respondida com sucesso',
          ''
        );
        this.centroCusto = r;
      },
      (e) => {
        this.nzNotificationService.error('Erro ao responder solicitação', '');
      }
    );
  }

  get exibirResposta(): boolean {
    return (
      this.centroCusto?.situacao === SituacaoCentroCusto.AguardandoCriacao ||
      this.centroCusto?.situacao === SituacaoCentroCusto.CentroCustoCriado
    );
  }

  get respostaSomenteLeitura(): boolean {
    return this.centroCusto?.situacao === SituacaoCentroCusto.CentroCustoCriado;
  }

  get exibirCocup(): boolean {
    return this.centroCusto?.origemRecursos === OrigemRecursos.RecursoProprio;
  }

  incluirResposta() {
    if (this.respostaIncluirForm.invalid) {
      for (const key in this.respostaIncluirForm.controls) {
        this.respostaIncluirForm.controls[key].markAsDirty();
        this.respostaIncluirForm.controls[key].updateValueAndValidity();
      }
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente os campos obrigatórios!',
      });
    } else {
      let fValue = this.respostaIncluirForm.value;
      fValue.descricao = 'P - ' + fValue.descricao;

      let req = CentroCustoIncluirRespostaCommand.fromJS(<
        CentroCustoIncluirRespostaCommand
      >{
        centroCustoId: this.centroCusto.id,
        descricao: fValue.descricao,
        nome: fValue.nome,
        nomeReduzido: fValue.nomeReduzido,
      });

      this.carregando = true;
      this.centroCustoClient
        .incluirResposta(req)
        .pipe(
          finalize(() => {
            this.carregando = false;
          })
        )
        .subscribe((response) => {
          this.centroCusto?.centroCustoRespostas.push(response);
          this.respostaIncluirForm.reset();
        });
    }
  }

  excluirResposta(id: number) {
    this.carregando = true;
    this.centroCustoClient
      .excluirResposta(id)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe((response) => {
        this.nzNotificationService.success(
          'Centro de custo excluído com sucesso!',
          ''
        );
        if (this.centroCusto != null)
          this.centroCusto.centroCustoRespostas =
            this.centroCusto?.centroCustoRespostas.filter((x) => {
              return x.id != id;
            });
      });
  }

  enviarSolicitacao() {
    this.salvar(SituacaoCentroCusto.AguardandoCriacao);
  }

  responderSolicitacao() {
    this.salvar(SituacaoCentroCusto.CentroCustoCriado);
  }

  atualizarCentro(centro: CentroCustoVm) {
    if (!!centro) {
      this.centroCusto = centro;
    } else {
      this.nzNotificationService.error(
        'Erro ao salvar Centro de Custo',
        'Preencha todos os dados necessários na aba centro de custo'
      );
    }
  }

  toggleForm(habilitar: boolean) {
    if (habilitar) {
      this.centroCustoForm.enable();
      this.respostaForm.enable();
      this.respostaIncluirForm.enable();
    } else {
      this.centroCustoForm.disable();
      this.respostaForm.disable();
      this.respostaIncluirForm.disable();
    }
  }

  get exibirEnviarSolicitacao(): boolean {
    return (
      !this.centroCusto ||
      this.centroCusto?.situacao === SituacaoCentroCusto.EmElaboracao
    );
  }

  get exibirEnviarRespostaSolicitacao(): boolean {
    return (
      !!this.centroCusto &&
      this.centroCusto?.situacao === SituacaoCentroCusto.AguardandoCriacao
    );
  }

  get exibirCentroCusto(): boolean {
    return true;
  }

  get exibirTornarPlurianual(): boolean {
    return true;
  }

  get desabilitaBotoes(): boolean {
    return (
      !this.possuiPermissaoEditar || this.statusProjeto !== StatusProjeto.Ativo
    );
  }
}
