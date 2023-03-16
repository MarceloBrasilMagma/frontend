import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NzCollapsePanelComponent } from 'ng-zorro-antd/collapse';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgxPermissionsService } from 'ngx-permissions';
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap, take } from 'rxjs/operators';
import { ModalConfirmacaoComponent } from 'src/app/shared/components/modal-confirmacao/modal-confirmacao.component';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import {
  AdClient,
  DeclaracaoTrabalhoAlterarCommand,
  DeclaracaoTrabalhoAlterarSituacaoCommand,
  DeclaracaoTrabalhoAnexoCriarDto,
  DeclaracaoTrabalhoCorresponsavelVm,
  DeclaracaoTrabalhoCriarCommand,
  DeclaracaoTrabalhoSituacao,
  DeclaracaoTrabalhoVm,
  DeclaracoesTrabalhoClient,
  DepartamentosClient,
  DepartamentoVm,
  DTSituacaoVm,
  PaginatedListOfPreProjetoVm,
  PermissaoAcessoDeclaracaoTrabalhoTipo,
  ProjetoPlurianualVm,
  PreProjetosClient,
  PreProjetosObterQuery,
  ProjetosPlurianuaisClient,
  PreProjetoVm,
  SituacaoPreProjeto,
  StakeholderVm,
  UsuarioAd,
  ZonaRisco,
  SearchProjetoDto,
  PaginatedListOfSearchProjetoDto,
  SearchProjetoQuery,
  TipoProjetoDT,
  SituacaoProjetoPlurianual,
} from 'web-api-client';
import { PermissaoDeclaracaoTrabalhoModalComponent } from '../components/permissao-declaracao-trabalho-modal/permissao-declaracao-trabalho-modal.component';
import { SolicitacaoAjustesDtComponent } from '../components/solicitacao-ajustes-dt/solicitacao-ajustes-dt.component';

@Component({
  templateUrl: './declaracoes-trabalho-form.component.html',
  styleUrls: ['./declaracoes-trabalho-form.component.scss'],
})
export class DeclaracoesTrabalhoFormComponent implements OnInit {
  @ViewChildren(NzCollapsePanelComponent)
  collapsePanelComponents: QueryList<NzCollapsePanelComponent>;

  form: UntypedFormGroup;
  formFornecedor: UntypedFormGroup;

  ZonaRisco = ZonaRisco;
  stakeholders: StakeholderVm[];
  departamentos: DepartamentoVm[];

  private searchResponsavel$: Subject<string>;
  buscandoResponsavelAd: boolean;
  responsaveisAd: UsuarioAd[];

  private searchCorresponsavel$: Subject<string>;
  buscandoCorresponsavelAd: boolean;
  corresponsaveisAd: DeclaracaoTrabalhoCorresponsavelVm[];

  salvandoDeclaracoesTrabalho: boolean;

  declaracaoTrabalhoId: number;
  declaracaoTrabalho: DeclaracaoTrabalhoVm = <DeclaracaoTrabalhoVm>{
    situacao: DeclaracaoTrabalhoSituacao.Elaboracao
  };
  carregandoDeclaracaoTrabalho: boolean;

  paramProjetoId: number;
  projeto: PreProjetoVm;

  paramProjetoPlurianualId: number;
  projetoPlurianual: ProjetoPlurianualVm;

  carregandoProjeto: boolean;

  //#region Atributos utilizados somente ao criar DT
  anexosCadastro: DeclaracaoTrabalhoAnexoCriarDto[];

  private searchProjeto$: Subject<string>;
  buscandoProjeto: boolean;
  projetos: SearchProjetoDto[];
  //#endregion

  DeclaracaoTrabalhoSituacao = DeclaracaoTrabalhoSituacao;

  tabIndex: number = 0

  textoBotaoSalvar = 'Salvar';
  preencheuDadosFornecedor = false;

  // Area de Mensagems
  exibirMsg: boolean = false;
  btnTexto: boolean = true;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private nzModalService: NzModalService,
    private nzNotificationService: NzNotificationService,
    private adClient: AdClient,
    private PreProjetosClient: PreProjetosClient,
    private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient,
    private departamentosClient: DepartamentosClient,
    private permissionsService: NgxPermissionsService,
    private authenticationService: AuthenticationService,
    private projetosPlurianuaisClient: ProjetosPlurianuaisClient,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.obterDepartamentos();
    this.initSubjectSearchResponsavel();
    this.initSubjectSearchCorresponsavel();
    this.initSubjectSearchProjeto();

    this.declaracaoTrabalhoId = parseInt(this.route.snapshot.paramMap.get('id'));
    if (this.declaracaoTrabalhoId) {
      this.carregarDeclaracaoTrabalho();
    }

    this.paramProjetoId = this.route.snapshot.queryParams['projetoId'];
    if (!!this.paramProjetoId) {
      this.carregarProjeto(this.paramProjetoId);
    }

    this.paramProjetoPlurianualId = this.route.snapshot.queryParams['projetoPlurianualId'];
    if (!!this.paramProjetoPlurianualId) {
      this.carregarProjetoPlurianual(this.paramProjetoPlurianualId);
    }
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      projetoId: [null],
      tipoProjeto: [null],
      projetoPlurianualId: [null],
      departamentoId: [null, Validators.required],
      responsavel: [null, Validators.required],
      corresponsaveis: [null],
      //problemaIdentificado: [null, Validators.required],
      solucaoProposta: [null, Validators.required],
      //requisitosEspecificacoesDesejadas: [null, Validators.required],
      //requisitosEspecificacoesFundamentais: [null, Validators.required],
      prazoEsperadoExecucaoSolucao: [null, Validators.required],


      dataEntregaClassificacaoContabil: [null],
      dataEntregaFornecedor: [null],
    });
    this.formFornecedor = new UntypedFormBuilder().group({
      viavelTecnicamente: [null, Validators.required],
      parecerTecnico: [null, Validators.required],
      periodoExecucaoSolucao: [null, Validators.required],
      consideracoes: [null, Validators.required],
    })
  }

  private carregarDeclaracaoTrabalho() {
    this.carregandoDeclaracaoTrabalho = true;
    this.declaracoesTrabalhoClient
      .obterPorId(this.declaracaoTrabalhoId)
      .pipe(
        finalize(() => {
          this.carregandoDeclaracaoTrabalho = false;
        })
      )
      .subscribe((r) => {
        this.form.patchValue({
          ...r,
          prazoEsperadoExecucaoSolucao: moment(
            r.prazoEsperadoExecucaoSolucao
          ).format('YYYY-MM'),

          dataEntregaFornecedor: r.dataEntregaFornecedor ? moment(
            r.dataEntregaFornecedor
          ).format('YYYY-MM-DD') : null,

          dataEntregaClassificacaoContabil: r.dataEntregaClassificacaoContabil ? moment(
            r.dataEntregaClassificacaoContabil
          ).format('YYYY-MM-DD') : null,
        });
        this.declaracaoTrabalho = r;
        if (!!r.loginResponsavel) {
          let responsavel = <UsuarioAd>{
            login: r.loginResponsavel,
            nome: r.nomeResponsavel,
          };
          this.responsaveisAd = [responsavel];
          this.form.patchValue({ responsavel });
        }

        if (r.corresponsaveis) {
          this.corresponsaveisAd = r.corresponsaveis;
        }

        if (this.declaracaoTrabalho.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor) {
          if (!this.declaracaoTrabalho?.orcamentos?.length) {
            this.textoBotaoSalvar = 'Salvar e Preencher Orçamento';
          } else {
            this.preencheuDadosFornecedor = true;
          }
        }
        
          this.formFornecedor.patchValue({
          viavelTecnicamente: this.declaracaoTrabalho.viavelTecnicamente,
          parecerTecnico: this.declaracaoTrabalho.parecerTecnico,
          periodoExecucaoSolucao: this.declaracaoTrabalho.periodoExecucaoSolucao,
          consideracoes: this.declaracaoTrabalho.consideracoes,
          })
        
      });
  }

  private carregarProjeto(paramProjetoId: number) {
    this.carregandoProjeto = true;
    this.PreProjetosClient
      .obterPorId(paramProjetoId)
      .pipe(
        finalize(() => {
          this.carregandoProjeto = false;
        })
      )
      .subscribe((r) => {
        this.projeto = r;
        this.form.patchValue({ projetoId: r.id });
      });
  }

  private carregarProjetoPlurianual(paramProjetoPlurianualId: number) {
    this.carregandoProjeto = true;
    this.projetosPlurianuaisClient
      .obterPorId(paramProjetoPlurianualId)
      .pipe(
        finalize(() => {
          this.carregandoProjeto = false;
        })
      )
      .subscribe((r) => {
        this.projetoPlurianual = r;
        this.form.patchValue({ projetoPlurianualId: r.id });
      });
  }

  private obterDepartamentos() {
    this.departamentosClient.obter().subscribe((r) => {
      this.departamentos = r;
    });
  }

  exibirModalConfirmacao() {
    const modal = this.nzModalService.create({
      nzContent: ModalConfirmacaoComponent,
      nzTitle: "Confirmação",
      nzComponentParams: {
        mensagem: 'Deseja enviar para o fornecedor?',
        textoOk: 'Sim',
        textoCancelar: 'Não, somente salvar',
        corCancelar: 'goldenrod',
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.subscribe((r) => {
      r ? this.salvar(true) : this.salvar(false)
    });
  }

  salvar(enviarFornecedor?: boolean) {
    this.declaracaoTrabalhoId ? this.atualizarDeclaracaoTrabalho() : this.cadastrarDeclaracaoTrabalho(enviarFornecedor);
  }


  private cadastrarDeclaracaoTrabalho(enviarFornecedor?: boolean) {
    if (this.form.invalid) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente os campos obrigatórios!',
      });
      for (const key in this.form.controls) {
        this.form.controls[key].markAsDirty();
        this.form.controls[key].updateValueAndValidity();
      }
      this.expandAll();
    } else {
      const fValue = this.form.value;
      let req = DeclaracaoTrabalhoCriarCommand.fromJS(fValue);

      switch (fValue.tipoProjeto) {
        case TipoProjetoDT.PreProjeto:
          req.preProjetoId = fValue.projetoId;
          break;
        case TipoProjetoDT.Plurianual:
          req.projetoPlurianualId = fValue.projetoId;
          break;
        default:
          break;
      }

      req.preProjetoId = fValue.projetoId;
      req.loginResponsavel = fValue.responsavel.login;
      req.nomeResponsavel = fValue.responsavel.nome;

      req.anexos = this.anexosCadastro;
      req.enviarFornecedor = enviarFornecedor;

      this.salvandoDeclaracoesTrabalho = true;
      this.declaracoesTrabalhoClient
        .criar(req)
        .pipe(
          finalize(() => {
            this.salvandoDeclaracoesTrabalho = false;
          })
        )
        .subscribe((r) => {
          this.nzNotificationService.success(
            'Declaração de Trabalho cadastrada com sucesso!',
            ''
          );

          if (!!req.preProjetoId)
            this.router.navigate(['pre-projetos', 'editar', req.preProjetoId]);

          else
            this.router.navigate(['/declaracoes-trabalho/editar/', r.id]);
        });

    }
  }


  private atualizarDeclaracaoTrabalho() {
    if (this.formFornecedor.invalid) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente os campos obrigatórios!',
      });
      for (const key in this.formFornecedor.controls) {
        this.formFornecedor.controls[key].markAsDirty();
        this.formFornecedor.controls[key].updateValueAndValidity();
      }
      this.expandAll();
    } else {
      const fValue = {...this.form.value, ...this.formFornecedor.value};
      const req = DeclaracaoTrabalhoAlterarCommand.fromJS(fValue);
      req.loginResponsavel = fValue.responsavel.login;
      req.nomeResponsavel = fValue.responsavel.nome;

      this.salvandoDeclaracoesTrabalho = true;
      this.declaracoesTrabalhoClient
        .alterar(req)
        .pipe(
          finalize(() => {
            this.salvandoDeclaracoesTrabalho = false;
          })
        )
        .subscribe((r) => {
          this.nzNotificationService.success('Declaração de Trabalho atualizada com sucesso!', '');
            
          if (r.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor && !this.declaracaoTrabalho.orcamentos.length) {
            this.tabIndex = 1;
            this.preencheuDadosFornecedor = true;
            this.textoBotaoSalvar = "Salvar";
          }
          else {
            if (!!this.paramProjetoId)
              this.router.navigate(['pre-projetos', 'editar', this.paramProjetoId]);

            else
              this.router.navigateByUrl('/declaracoes-trabalho');
          }
        });

    }
  }

  collapseAll() {
    this.collapsePanelComponents.forEach((c) => {
      c.nzActive = false;
      c.markForCheck();
    });
  }

  expandAll() {
    this.collapsePanelComponents.forEach((c) => {
      c.nzActive = true;
      c.markForCheck();
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
        this.responsaveisAd = r;
      });
  }

  private initSubjectSearchCorresponsavel() {
    this.searchCorresponsavel$ = new Subject<string>();
    this.searchCorresponsavel$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) {
            return of([]);
          }
          this.buscandoCorresponsavelAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => {
              this.buscandoCorresponsavelAd = false;
            }),
            catchError((err) => {
              return EMPTY;
            })
          );
        })
      )
      .subscribe((r) => {
        this.corresponsaveisAd = r;
      });
  }

  searchResponsavel(value: string): void {
    this.searchResponsavel$.next(value);
  }

  searchCorresponsavel(value: string): void {
    this.searchCorresponsavel$.next(value);
  }

  get anyExpanded() {
    return !!this.collapsePanelComponents?.find((cp) => cp.nzActive);
  }

  private initSubjectSearchProjeto() {
    this.searchProjeto$ = new Subject<string>();
    this.searchProjeto$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) {
            return of(new PaginatedListOfSearchProjetoDto());
          }
          this.buscandoProjeto = true;
          return this.declaracoesTrabalhoClient
            .searchProjeto(<SearchProjetoQuery>{
              nome: value,
              situacaoPreProjeto: SituacaoPreProjeto.AguardandoLevantamentoDeCustoEPrazo,
              situacaoPlurianual: SituacaoProjetoPlurianual.AguardandoLevantamentoDeCustoEPrazo,
              pageIndex: 1,
              pageSize: 100,
            })
            .pipe(
              finalize(() => {
                this.buscandoProjeto = false;
              }),
              catchError((err) => {
                return EMPTY;
              })
            );
        })
      )
      .subscribe((r) => {
        this.projetos = r.items;
      });
  }

  searchProjeto(value: string): void {
    this.searchProjeto$.next(value);
  }

  atualizaTipoProjeto(id: number) {
    this.form.controls['tipoProjeto'].setValue(this.projetos.filter(x => x.id === id)[0].tipo);
  }

  salvarAlterarSituacao(situacao: DeclaracaoTrabalhoSituacao) {
    if (situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor && this.declaracaoTrabalho.situacao == DeclaracaoTrabalhoSituacao.AguardandoAjustes) {
      situacao = DeclaracaoTrabalhoSituacao.AjustesRealizados
    }
    const fValue = {...this.form.value, ...this.formFornecedor.value};
    const req = DeclaracaoTrabalhoAlterarCommand.fromJS(fValue);

    req.loginResponsavel = fValue.responsavel.login;
    req.nomeResponsavel = fValue.responsavel.nome;

    this.salvandoDeclaracoesTrabalho = true;
    this.declaracoesTrabalhoClient
      .alterar(req)
      .pipe(
        finalize(() => {
          this.salvandoDeclaracoesTrabalho = false;
        })
      )
      .subscribe((r) => {
        this.alterarSituacao(situacao)
      });

  }

  get mensagens() {
    return this.declaracaoTrabalho?.declaracaoTrabalhoSituacoes?.filter(x => { return !!x.mensagem })
  }

  getExibirModalMotivo(situacao: DeclaracaoTrabalhoSituacao) {
    return (situacao == DeclaracaoTrabalhoSituacao.AguardandoAjustes || situacao == DeclaracaoTrabalhoSituacao.AjustesRealizados)
      || (situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor && (this.declaracaoTrabalho.situacao == DeclaracaoTrabalhoSituacao.Finalizada || this.declaracaoTrabalho.situacao == DeclaracaoTrabalhoSituacao.Respondida))
      || (situacao == DeclaracaoTrabalhoSituacao.Respondida && this.mensagens?.length)
  }

  alterarSituacao(situacao: DeclaracaoTrabalhoSituacao): void {

    if (this.getExibirModalMotivo(situacao)) {
      this.abrirModalMotivo(situacao);
    }
    else {
      this.salvandoDeclaracoesTrabalho = true;
      this.declaracoesTrabalhoClient.alterarSituacao(new DeclaracaoTrabalhoAlterarSituacaoCommand({
        declaracaoTrabalhoId: this.declaracaoTrabalhoId,
        situacao: situacao
      })).pipe(
        finalize(() => {
          this.salvandoDeclaracoesTrabalho = false;
        })
      )
        .subscribe((r) => {
          this.nzNotificationService.success(
            'Situação alterada com sucesso!',
            ''
          );

          if (!!this.paramProjetoId)
            this.router.navigate(['pre-projetos', 'editar', this.paramProjetoId]);

          else
            this.router.navigate(['/declaracoes-trabalho/editar/', r.id]);

          this.declaracaoTrabalho = r;

          this.form.patchValue({
            ...r,
            prazoEsperadoExecucaoSolucao: moment(
              r.prazoEsperadoExecucaoSolucao
            ).format('YYYY-MM-DD'),

            dataEntregaFornecedor: r.dataEntregaFornecedor ? moment(
              r.dataEntregaFornecedor
            ).format('YYYY-MM-DD') : null,

            dataEntregaClassificacaoContabil: r.dataEntregaClassificacaoContabil ? moment(
              r.dataEntregaClassificacaoContabil
            ).format('YYYY-MM-DD') : null,
          });
          this.formFornecedor.patchValue({
            viavelTecnicamente: this.declaracaoTrabalho.viavelTecnicamente,
            parecerTecnico: this.declaracaoTrabalho.parecerTecnico,
            periodoExecucaoSolucao: this.declaracaoTrabalho.periodoExecucaoSolucao,
            consideracoes: this.declaracaoTrabalho.consideracoes,
          })

          this.formFornecedor.patchValue({
            viavelTecnicamente: this.declaracaoTrabalho.viavelTecnicamente,
            parecerTecnico: this.declaracaoTrabalho.parecerTecnico,
            periodoExecucaoSolucao: this.declaracaoTrabalho.periodoExecucaoSolucao,
            consideracoes: this.declaracaoTrabalho.consideracoes,
          })

          if (this.declaracaoTrabalho.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor) {
            if (!this.declaracaoTrabalho.orcamentos.length) {
              this.textoBotaoSalvar = 'Salvar e Preencher Orçamento';
            } else {
              this.preencheuDadosFornecedor = true;
            }
          }
        }, (e) => {
          this.nzNotificationService.error("Erro", e)
        });
    }
  }

  abrirModalMotivo(situacao: DeclaracaoTrabalhoSituacao) {
    this.salvandoDeclaracoesTrabalho = true;

    const modal = this.nzModalService.create({
      nzTitle: 'Solicitar novas informações',
      nzContent: SolicitacaoAjustesDtComponent,
      nzComponentParams: {
        declaracao: this.declaracaoTrabalho,
        situacao: situacao
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.pipe(take(1)).subscribe((r) => {
      this.declaracaoTrabalho = !!r ? r : this.declaracaoTrabalho;
      this.salvandoDeclaracoesTrabalho = false;
    });
  }

  get usuarioCriouDt(): boolean {
    if (!this.declaracaoTrabalho)
      return false;

    if (!this.declaracaoTrabalho.id)
      return true;

    return this.authenticationService.loginUsuarioLogado == this.declaracaoTrabalho.usuarioCriacaoId;
  }

  get exibirSalvar(): boolean {
    return this.declaracaoTrabalho?.situacao != DeclaracaoTrabalhoSituacao.Cancelada
      && (this.usuarioCriouDt || this.usuarioResponsavelDt || this.possuiPermissaoEditar(['Administrador']));
  }
  get exibirAguardandoAjustes(): boolean {
    return this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor
      && (this.usuarioResponsavelDt || this.possuiPermissaoEditar(['Administrador']));
  }
  get exibirEnviarParaFornecedor(): boolean {
    return this.declaracaoTrabalho?.id && (this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.Elaboracao || this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.AguardandoAjustes)
      && (this.authenticationService.loginUsuarioLogado == this.declaracaoTrabalho.usuarioCriacaoId
        || this.possuiPermissaoEditar(['Administrador']));
  }

  get exibirResponderFornecedor(): boolean {
    return (this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor
      && this.preencheuDadosFornecedor || this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.AjustesRealizados)
      && (this.usuarioResponsavelDt || this.possuiPermissaoEditar(['Administrador']));
  }

  get exibirEnviarParaClassificacao(): boolean {
    return this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.Respondida
      && (this.projeto?.loginGerenteProjeto == this.authenticationService.loginUsuarioLogado || this.possuiPermissaoEditar(['Administrador']));
  }

  get exibirRealizarClassificacaoContabil(): boolean {
    return this.possuiPermissaoEditar(['Administador', 'Projeto.ClassificacaoContabil'])
      && this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.AguardandoClassificacao
  }

  get exibirFinalizar(): boolean {
    return this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.ClassificacaoRealizada
  }

  get usuarioAdministrador(): boolean {
    var permissions = this.permissionsService.getPermissions();
    return 'Administrador' in permissions || this.declaracaoTrabalho.permissaoUsuarioLogado == PermissaoAcessoDeclaracaoTrabalhoTipo.AcessoTotal;
  }

  get exibirCancelar(): boolean {
    return !!this.declaracaoTrabalhoId &&
      (this.usuarioAdministrador || this.authenticationService.loginUsuarioLogado == this.declaracaoTrabalho.usuarioCriacaoId)
      &&
      (this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.Elaboracao ||
        this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor ||
        this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.Finalizada)
  }

  get exibirMotivoPedidoAjustes(): boolean {
    return this.mensagens?.length > 0 && (this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.AguardandoAjustes || this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.AjustesRealizados || this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor || this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.Respondida)
  }

  get exibirAlterarDataEntregaFornecedor(): boolean {
    return this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.Elaboracao && !!this.declaracaoTrabalho?.motivoSolicitacaoNovasInformacoes
  }

  get exibirRetornarParaFornecedor(): boolean {
    var permissions = this.permissionsService.getPermissions();
    return (this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.Respondida || this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.Finalizada)
      && (this.authenticationService.loginUsuarioLogado == this.declaracaoTrabalho.loginResponsavel
        || this.authenticationService.loginUsuarioLogado == this.projeto?.loginGerenteProjeto
        || 'Administrador' in permissions)
  }

  get corSituacao(): string {
    switch (this.declaracaoTrabalho?.situacao) {
      case (DeclaracaoTrabalhoSituacao.Elaboracao): return "gray";
      case (DeclaracaoTrabalhoSituacao.AguardandoFornecedor): return "gold";
      case (DeclaracaoTrabalhoSituacao.Respondida): return "blue";
      case (DeclaracaoTrabalhoSituacao.AguardandoClassificacao): return "orange";
      case (DeclaracaoTrabalhoSituacao.ClassificacaoRealizada): return "geekblue";
      case (DeclaracaoTrabalhoSituacao.Finalizada): return "green";
      case (DeclaracaoTrabalhoSituacao.Cancelada): return "red";
      case (DeclaracaoTrabalhoSituacao.AguardandoAjustes): return "gray";
      case (DeclaracaoTrabalhoSituacao.AjustesRealizados): return "gold";
    }
  }

  get exibirCamposFornecedor(): boolean {
    return this.declaracaoTrabalho && this.declaracaoTrabalho.situacao != DeclaracaoTrabalhoSituacao.Elaboracao;
  }

  get exibirCamposClassificacao(): boolean {
    return this.declaracaoTrabalho && this.declaracaoTrabalho.situacao == DeclaracaoTrabalhoSituacao.AguardandoClassificacao;
  }

  get usuarioResponsavelDt(): boolean {
    var login = this.authenticationService.loginUsuarioLogado;

    if (login == null || !this.declaracaoTrabalho)
      return false;

    if (this.declaracaoTrabalho.loginResponsavel == login
      || this.declaracaoTrabalho?.corresponsaveis?.some(x => x.login == login))
      return true;
  }

  possuiPermissaoEditar(permissoes: string[]): boolean {

    if (!this.declaracaoTrabalho)
      return false;

    if (!this.declaracaoTrabalho.id) //criacao de DT
      return true;

    var login = this.authenticationService.loginUsuarioLogado;

    if (login == null)
      return false;
    if (this.declaracaoTrabalho.permissaoUsuarioLogado == PermissaoAcessoDeclaracaoTrabalhoTipo.AcessoTotal) {
      return true;
    }

    var possuiPermissao = false;

    if (permissoes == null)
      possuiPermissao;

    var permissions = this.permissionsService.getPermissions();

    permissoes.forEach(element => {
      if (element in permissions || 'Administrador' in permissions) {
        possuiPermissao = true;
        return;
      }
    });

    return possuiPermissao;
  }

  get possuiPermissaoEditarOrcamento(): boolean {
    if (!this.declaracaoTrabalho)
      return false;

    switch (this.declaracaoTrabalho.situacao) {
      case DeclaracaoTrabalhoSituacao.Finalizada:
        return this.usuarioAdministrador;
      case DeclaracaoTrabalhoSituacao.AguardandoFornecedor:
      case DeclaracaoTrabalhoSituacao.AjustesRealizados:
        return this.usuarioAdministrador || this.usuarioResponsavelDt;
      case DeclaracaoTrabalhoSituacao.Cancelada:
        return false;
      case DeclaracaoTrabalhoSituacao.ClassificacaoRealizada:
        return this.usuarioAdministrador || this.usuarioResponsavelDt;
      case DeclaracaoTrabalhoSituacao.AguardandoClassificacao:
        return this.usuarioAdministrador
          || this.possuiPermissaoEditar(['Projeto.ClassificacaoContabil']);
      default:
        return this.usuarioAdministrador;
    }
  }

  get possuiPermissaoExcluirOrcamento(): boolean {
    if (!this.declaracaoTrabalho)
      return false;

    switch (this.declaracaoTrabalho.situacao) {
      case DeclaracaoTrabalhoSituacao.Elaboracao:
        return true;
      case DeclaracaoTrabalhoSituacao.AguardandoFornecedor:
      case DeclaracaoTrabalhoSituacao.AjustesRealizados:
        return this.usuarioAdministrador || this.usuarioResponsavelDt;
      default:
        return this.usuarioAdministrador;
    }
  }

  get possuiPermissaoVerHistorico(): boolean {
    return this.declaracaoTrabalho?.situacao != DeclaracaoTrabalhoSituacao.Elaboracao
      && this.possuiPermissaoEditar(['Administrador']);
  }

  get situacoesOrdenadas(): DTSituacaoVm[] {
    return this.declaracaoTrabalho.declaracaoTrabalhoSituacoes?.sort((x, y) => { return x.data < y.data ? 1 : x.data > y.data ? -1 : 0 })
  }

  get dataEmElaboracao(): string {
    let data = this.situacoesOrdenadas?.find(x => { return x.situacao == DeclaracaoTrabalhoSituacao.Elaboracao })?.data.toLocaleString();
    return data ? data : this.dataAguardandoFornecedor;
  }

  get dataAguardandoFornecedor(): string {
    return this.situacoesOrdenadas?.find(x => { return x.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor })?.data.toLocaleString();
  }

  get dataDtRespondida(): string {
    return this.situacoesOrdenadas?.find(x => { return x.situacao == DeclaracaoTrabalhoSituacao.Respondida })?.data.toLocaleString();
  }

  get dataAguardandoClassificacao(): string {
    return this.situacoesOrdenadas?.find(x => { return x.situacao == DeclaracaoTrabalhoSituacao.AguardandoClassificacao })?.data.toLocaleString();
  }
  get dataClassificacaoRealizada(): string {
    return this.situacoesOrdenadas?.find(x => { return x.situacao == DeclaracaoTrabalhoSituacao.ClassificacaoRealizada })?.data.toLocaleString();
  }
  get dataFinalizada(): string {
    return this.situacoesOrdenadas?.find(x => { return x.situacao == DeclaracaoTrabalhoSituacao.Finalizada })?.data.toLocaleString();
  }

  get dataCancelada(): string {
    return this.situacoesOrdenadas?.find(x => { return x.situacao == DeclaracaoTrabalhoSituacao.Cancelada })?.data.toLocaleString();
  }

  get dtReprovada(): boolean {
    return this.declaracaoTrabalho.situacao === DeclaracaoTrabalhoSituacao.Cancelada
  }

  get dtAprovada(): boolean {
    return this.declaracaoTrabalho.situacao === DeclaracaoTrabalhoSituacao.Finalizada
  }

  get timeLineIndex(): number {
    if (this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.AguardandoAjustes) return DeclaracaoTrabalhoSituacao.Elaboracao
    if (this.declaracaoTrabalho?.situacao == DeclaracaoTrabalhoSituacao.AjustesRealizados) return DeclaracaoTrabalhoSituacao.AguardandoFornecedor
    return this.declaracaoTrabalho?.situacao;
  }
  get possuiPermissaoEditarDados(): boolean {
    //debugger
    if (!this.declaracaoTrabalho)
      return false;

    switch (this.declaracaoTrabalho.situacao) {
      case DeclaracaoTrabalhoSituacao.Elaboracao:
      case DeclaracaoTrabalhoSituacao.AguardandoAjustes:
        return this.usuarioAdministrador
          || this.usuarioCriouDt;
      case DeclaracaoTrabalhoSituacao.Finalizada:
      case DeclaracaoTrabalhoSituacao.AguardandoFornecedor:
      case DeclaracaoTrabalhoSituacao.Cancelada:
      case DeclaracaoTrabalhoSituacao.ClassificacaoRealizada:
      case DeclaracaoTrabalhoSituacao.AguardandoClassificacao:
      case DeclaracaoTrabalhoSituacao.AjustesRealizados:
        return this.usuarioAdministrador;
      default:
        return this.usuarioAdministrador;
    }
  }

  selectedIndexChange(index: number) {
    this.tabIndex = index;
  }

  selecionouDepartamento(departamentoId?: number) {
    if (departamentoId) {
      var deps = this.departamentos.filter(x => x.id == departamentoId);

      if (deps?.length == 1) {
        var departamentoSelecionado = deps[0];
        var responsavel = new UsuarioAd({
          login: departamentoSelecionado.loginGestor,
          nome: departamentoSelecionado.nomeGestor
        });

        this.responsaveisAd = [
          responsavel
        ];

        this.form.patchValue({
          responsavel
        });
      }
    }
  }

  excluirDt() {
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
        this.carregandoDeclaracaoTrabalho = true;
        this.declaracoesTrabalhoClient
          .excluir(this.declaracaoTrabalhoId)
          .pipe(
            finalize(() => {
              this.carregandoDeclaracaoTrabalho = false;
            })
          )
          .subscribe((r) => {
            this.nzNotificationService.success('Declaração excluida com sucesso!', '');
            this.router.navigateByUrl('/declaracoes-trabalho');
          });
      }
    });
  }
  exibirModalPermissoes() {
    const modal = this.nzModalService.create({
      nzContent: PermissaoDeclaracaoTrabalhoModalComponent,
      nzTitle: "Permissões",
      nzComponentParams: {
        declaracaotrabalhoId: this.declaracaoTrabalhoId
      },
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: "50%",
      nzBodyStyle: { height: '500px' }
    });
  }

  // Area de Mensagems
  toogleMsgns() {
    this.exibirMsg = !this.exibirMsg;
    this.btnTexto = !this.btnTexto
  }

  get podeEditarPermissoes(): boolean {
    return this.possuiPermissaoEditar(['Administrador'])
  }
}
