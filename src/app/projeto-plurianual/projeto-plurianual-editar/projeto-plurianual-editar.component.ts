import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NzCollapsePanelComponent } from 'ng-zorro-antd/collapse';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgxPermissionsService } from 'ngx-permissions';
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap, take} from 'rxjs/operators';
import { ModalConfirmacaoComponent } from 'src/app/shared/components/modal-confirmacao/modal-confirmacao.component';
import { RessalvaListarOrcamentosComponent } from 'src/app/shared/components/ressalva-preprojeto/ressalva-listar-orcamentos/ressalva-listar-orcamentos.component';
import { AdClient, CestaRasaVm, CestasClient, CestaVm, DeclaracaoTrabalhoSituacao, DeclaracaoTrabalhoVm, DepartamentosClient, DepartamentoVm, PortifolioRasoVm, PortifoliosClient, PortifolioVm,
  ProjetoAlterarStatusCommand,
  ProjetoPlurianualAlterarCommand, ProjetoPlurianualAlterarSituacaoCommand, ProjetoPlurianualAnexoDto, ProjetoPlurianualCriarCommand, ProjetoPlurianualSituacaoVm,
  ProjetoPlurianualVm, ProjetosClient, ProjetosPlurianuaisClient, ProjetoVm, SituacaoProjetoPlurianual, UsuarioAd, PermissaoAcessoPreProjetoTipo, StatusProjeto} from 'web-api-client';
import { SolicitarAjustesProjetoPlurianualComponent } from '../components/solicitar-ajustes-projeto-plurianual/solicitar-ajustes-projeto-plurianual.component';
import { Abas } from '../components/menu-lateral-plurianual/menu-lateral-plurianual.component';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import { PermissaoProjetoModalComponent } from 'src/app/preprojeto/components/permissao-projeto-modal/permissao-projeto-modal.component';
import { PausarCancelarProjetoModalComponent } from 'src/app/shared/components/pausar-cancelar-projeto-modal/pausar-cancelar-projeto-modal.component';

@Component({
  selector: 'app-projeto-plurianual-editar',
  templateUrl: './projeto-plurianual-editar.component.html',
  styleUrls: ['./projeto-plurianual-editar.component.scss'],
})
export class ProjetoPlurianualEditarComponent implements OnInit {
  @ViewChildren(NzCollapsePanelComponent)
  collapsePanelComponents: QueryList<NzCollapsePanelComponent>;

  SituacaoProjetoPlurianual = SituacaoProjetoPlurianual;

  form: UntypedFormGroup;
  projetoPlurianualId: any;
  projetoPlurianual: ProjetoPlurianualVm;
  carregandoProjeto: boolean = false;
  salvandoProjeto: boolean;

  departamentos: DepartamentoVm[];

  private searchResponsavel$: Subject<string>;
  buscandoResponsavelAd: boolean;
  responsaveisAd: UsuarioAd[];

  private searchSponsor$: Subject<string>;
  buscandoSponsorAd: boolean;
  sponsorsProjetoAd: UsuarioAd[];

  tabIndex: number = 0;

  anexosCadastro: ProjetoPlurianualAnexoDto[];

  cestas: CestaVm[];
  cestaProjetoPlurianual: CestaRasaVm;
  portifolios: PortifolioVm[];
  portifolioProjetoPlurianual: PortifolioRasoVm;
  mensagens: ProjetoPlurianualSituacaoVm[];

  projeto: ProjetoVm
  exibirMenuLateral: boolean = false;
  abas = Abas;
  abaSelecionada: Abas;

  StatusProjeto = StatusProjeto;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private nzModalService: NzModalService,
    private nzNotificationService: NzNotificationService,
    private adClient: AdClient,
    private projetosPlurianuaisClient: ProjetosPlurianuaisClient,
    private departamentosClient: DepartamentosClient,
    private permissionsService: NgxPermissionsService,
    private cestasClient: CestasClient,
    private portifolioClient: PortifoliosClient,
    private projetosClient: ProjetosClient,
    private ano: YearReferenceService
  ) { }

  ngOnInit(): void {
    this.projetoPlurianualId = this.route.snapshot.paramMap.get('id');
    this.initForm();
    this.carregarProjeto();
    this.obterDepartamentos();
    this.obterCestas();
    this.obterPortifolios();
    this.initSubjectSearchResponsavel();
    this.initSubjectSearchSponsor();
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],

      nome: [null, Validators.required],
      departamentoId: [null, Validators.required],

      responsavel: [null, Validators.required],
      sponsor: [null, Validators.required],

      escopoAnoSeguinte: [null, Validators.required],
      anoReferencia: [null, Validators.required],
      prazoExecucaoInicial: [null],
      prazoExecucaoFinal: [null],

      portifolioId: [null],
      cestaId: [null]
    });
  }

  obterCestas() {
    this.cestasClient.obter(-1, 0).subscribe(res => {
      this.cestas = res.items;
      this.cestaProjetoPlurianual = this.cestas.filter(c => c.id == this.projetoPlurianual?.cestaId)[0];
    })
  }

  obterPortifolios() {
    this.portifolioClient.obter(-1, 0).subscribe(res => {
      this.portifolios = res.items;
      this.portifolioProjetoPlurianual = this.portifolios.filter(p => p.id == this.projetoPlurianual?.portifolioId)[0];
    })
  }

  private carregarProjeto() {
  
    if (this.projetoPlurianualId) {
      this.carregandoProjeto = true;
      this.projetosPlurianuaisClient
        .obterPorId(this.projetoPlurianualId)
        .pipe(
          finalize(() => {
            this.carregandoProjeto = false;
          })
        )
        .subscribe((r) => {
          this.projetoPlurianual = r;
          this.obterMensagens();
          
          this.form.patchValue({
            id: r.id,
            nome: r.nome,
            departamentoId: r.departamentoId,
            escopoAnoSeguinte: r.escopoAnoSeguinte,
            cestaId: r.cestaId,
            portifolioId: r.portifolioId,
            prazoExecucaoInicial: moment(r.prazoExecucaoInicial).format('YYYY-MM-DD'),
            prazoExecucaoFinal: moment(r.prazoExecucaoFinal).format('YYYY-MM-DD'),
          })
          
          if (!!r.loginSponsor) {
            let sponsor = <UsuarioAd>{
              login: r.loginSponsor,
              nome: r.nomeSponsor,
            };
            this.sponsorsProjetoAd = [sponsor];
            this.form.patchValue({ sponsor });
          }

          if (!!r.loginResponsavel) {
            let responsavel = <UsuarioAd>{
              login: r.loginResponsavel,
              nome: r.nomeResponsavel,
            };
            this.responsaveisAd = [responsavel];
            this.form.patchValue({ responsavel });
          }

          let anoReferencia = !!r.anoReferencia ? r.anoReferencia : (new Date().getFullYear() + 1)
          this.form.patchValue({anoReferencia: new Date(anoReferencia, 1)})
          if (
            r.situacao ===
            SituacaoProjetoPlurianual.AguardandoLevantamentoDeCustoEPrazo
          ) {
            this.tabIndex = 1;
          }
          if(!!r.projetoId) {
            this.projetosClient.obterPorId(r.projetoId, this.ano.obterAno()).subscribe(response => {
              this.projeto = response;
              if(this.projeto?.status !== StatusProjeto.Ativo){
                this.toggleForm(false);
              }
              else{
                this.toggleForm(true);
              }
            });
          }
        });
      }
  }

  private obterDepartamentos() {
    this.departamentosClient.obter().subscribe((r) => {
      this.departamentos = r;
    });
  }

  salvar(solicitarLevantamentoCustoEPrazo: boolean) {
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
      !this.projetoPlurianualId
        ? this.criarProjeto(solicitarLevantamentoCustoEPrazo)
        : this.alterarProjeto(solicitarLevantamentoCustoEPrazo);
    }
  }

  private criarProjeto(solicitarLevantamentoCustoEPrazo: boolean) {
    const fValue = this.form.value;
    const req = ProjetoPlurianualCriarCommand.fromJS(fValue);

    req.anoReferencia = fValue.anoReferencia.getFullYear()
    req.loginResponsavel = fValue.responsavel.login;
    req.nomeResponsavel = fValue.responsavel.nome;

    req.loginSponsor = fValue.sponsor.login;
    req.nomeSponsor = fValue.sponsor.nome;

    req.solicitarLevantamentoCustoEPrazo = solicitarLevantamentoCustoEPrazo;

    req.anexos = this.anexosCadastro;

    this.salvandoProjeto = true;

    this.projetosPlurianuaisClient.criar(req).pipe(finalize(() => {
      this.salvandoProjeto = false;
        }))
      .subscribe((r) => {
        this.nzNotificationService.success('Projeto salvo com sucesso!', '');
        if (!solicitarLevantamentoCustoEPrazo)
          this.router.navigateByUrl('projetos');
        else this.router.navigate(['projetos-plurianuais', 'editar', r.id]);
      });
  }

  private alterarProjeto(solicitarLevantamentoCustoEPrazo: boolean) {
    const fValue = this.form.value;
    const req = ProjetoPlurianualAlterarCommand.fromJS(fValue);

    req.anoReferencia = fValue.anoReferencia.getFullYear()

    req.loginResponsavel = fValue.responsavel.login;
    req.nomeResponsavel = fValue.responsavel.nome;

    req.loginSponsor = fValue.sponsor.login;
    req.nomeSponsor = fValue.sponsor.nome;

    req.solicitarLevantamentoCustoEPrazo = solicitarLevantamentoCustoEPrazo;

    this.salvandoProjeto = true;

    this.projetosPlurianuaisClient
      .alterar(req)
      .pipe(
        finalize(() => {
          this.salvandoProjeto = false;
        })
      )
      .subscribe((r) => {
        this.nzNotificationService.success('Projeto salvo com sucesso!', '');
        if (!solicitarLevantamentoCustoEPrazo) {
          this.carregarProjeto()
        }
        else {
          if (this.getExibirModalMotivo(SituacaoProjetoPlurianual.AguardandoLevantamentoDeCustoEPrazo)){
            this.abrirModalMotivo(SituacaoProjetoPlurianual.AguardandoLevantamentoDeCustoEPrazo)
          } else {
            this.carregarProjeto();
          }
        }
      });
  }

  get anyExpanded(): boolean {
    return !!this.collapsePanelComponents?.find((cp) => cp.nzActive);
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

  private initSubjectSearchSponsor() {
    this.searchSponsor$ = new Subject<string>();
    this.searchSponsor$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) {
            return of([]);
          }
          this.buscandoSponsorAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => {
              this.buscandoSponsorAd = false;
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

  searchSponsor(value: string): void {
    this.searchSponsor$.next(value);
  }

  get corSituacao(): string {
    switch (this.projetoPlurianual?.situacao) {
      case SituacaoProjetoPlurianual.EmElaboracao:
        return 'gold';
      case SituacaoProjetoPlurianual.AguardandoLevantamentoDeCustoEPrazo:
        return 'gold';
      case SituacaoProjetoPlurianual.AguardandoAprovacao:
        return 'gold';
      case SituacaoProjetoPlurianual.ProjetoPlurianualValidado:
        return 'green';
      case SituacaoProjetoPlurianual.ProjetoPlurianualReprovado:
        return 'red';
      case SituacaoProjetoPlurianual.ProjetoPlurianualValidadoRessalvas:
        return 'blue';
    }
  }

  get corStatus(): string {
    switch (this.projeto?.status) {
      case StatusProjeto.Ativo:
        return 'blue';
      case StatusProjeto.Pausado:
        return 'gray';
      case StatusProjeto.Cancelado:
        return 'gray';
      case StatusProjeto.Concluido:
        return 'green'
    }
  }

  projetoAlterada(projetoPlurianual: ProjetoPlurianualVm) {
    this.projetoPlurianual = projetoPlurianual;
  }

  get somaValoresDespesaAdministrativa(): number {
    return this.projetoPlurianual.declaracoesTrabalho
      .map((o) => o.totalDespesaAdministrativa)
      .reduce((sum, current) => sum + current, 0);
  }

  get somaValoresCustoAssistencial(): number {
    return this.projetoPlurianual.declaracoesTrabalho
      .map((o) => o.totalCustoAssistencial)
      .reduce((sum, current) => sum + current, 0);
  }

  get somaValoresInvestimento(): number {
    return this.projetoPlurianual.declaracoesTrabalho
      .map((o) => o.totalInvestimento)
      .reduce((sum, current) => sum + current, 0);
  }

  get somaValoresOrcamento(): number {
    return this.projetoPlurianual.declaracoesTrabalho
      .map((o) => o.totalOrcamento)
      .reduce((sum, current) => sum + current, 0);
  }

  corTagSitacao(declaracao: DeclaracaoTrabalhoVm) {
    switch (declaracao.situacao) {
      case DeclaracaoTrabalhoSituacao.Elaboracao:
        return 'gray';
      case DeclaracaoTrabalhoSituacao.AguardandoFornecedor:
        return 'gold';
      case DeclaracaoTrabalhoSituacao.Respondida:
        return 'blue';
      case DeclaracaoTrabalhoSituacao.AguardandoClassificacao:
        return 'orange';
      case DeclaracaoTrabalhoSituacao.ClassificacaoRealizada:
        return 'geekblue';
      case DeclaracaoTrabalhoSituacao.Finalizada:
        return 'green';
      case DeclaracaoTrabalhoSituacao.Cancelada:
        return 'red';
    }
  }

  excluirProjeto() {
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
        this.carregandoProjeto = true;
        this.projetosPlurianuaisClient
          .excluir(this.projetoPlurianual.id)
          .pipe(
            finalize(() => {
              this.carregandoProjeto = false;
            })
          )
          .subscribe((r) => {
            this.nzNotificationService.success(
              'Projeto excluido com sucesso!',
              ''
            );
            this.router.navigateByUrl('projetos');
          });
      }
    });
  }

  selecionouDepartamento(departamentoId?: number) {
    if (departamentoId) {
      var deps = this.departamentos?.filter((x) => x.id == departamentoId);

      if (deps?.length == 1) {
        var departamentoSelecionado = deps[0];
        var responsavel = new UsuarioAd({
          login: departamentoSelecionado.loginGestor,
          nome: departamentoSelecionado.nomeGestor,
        });

        this.responsaveisAd = [responsavel];

        //checa se tem departamento pai para incluir sponsor
        if (departamentoSelecionado.departamentoSuperiorVm) {
          var sponsor = new UsuarioAd({
            login: departamentoSelecionado.departamentoSuperiorVm.loginGestor,
            nome: departamentoSelecionado.departamentoSuperiorVm.nomeGestor,
          });

          this.sponsorsProjetoAd = [sponsor];
        }

        this.form.patchValue({
          responsavel,
          sponsor,
        });

      }
    }
  }

  exibirModalConfirmacaoSalvar() {
    const modal = this.nzModalService.create({
      nzContent: ModalConfirmacaoComponent,
      nzTitle: 'Confirmação',
      nzComponentParams: {
        mensagem: 'Deseja salvar as alterações?',
        textoOk: 'Sim',
        textoCancelar: 'Cancelar',
        corCancelar: '#ff3b3b',
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.subscribe((r) => {
      if (r) this.salvar(false);
    });
  }

  exibirModalConfirmacaoSolicitarLevantamento() {
    const modal = this.nzModalService.create({
      nzContent: ModalConfirmacaoComponent,
      nzTitle: 'Confirmação',
      nzComponentParams: {
        mensagem: 'Deseja salvar e solicitar levantamento de custo e prazo?',
        textoOk: 'Sim',
        textoCancelar: 'Cancelar',
        corCancelar: '#ff3b3b',
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.subscribe((r) => {
      if (r) this.salvar(true);
    });
  }

  get editando(): boolean {
    return !!this.projetoPlurianualId;
  }

  get exibirAbaDeclaracaoTrabalho(): boolean {
    return (
      this.editando &&
      this.projetoPlurianual?.situacao !== SituacaoProjetoPlurianual.EmElaboracao
    );
  }

  get exibirCadastrarDt(): boolean {
    return (
      this.projetoPlurianual?.situacao ===
      SituacaoProjetoPlurianual.AguardandoLevantamentoDeCustoEPrazo
    );
  }

  get exibirAprovarProjeto(): boolean {
    return (
      (this.projetoPlurianual?.situacao ===
        SituacaoProjetoPlurianual.AguardandoAprovacao ||
        this.projetoPlurianual?.situacao ===
        SituacaoProjetoPlurianual.ProjetoPlurianualReprovado) &&
      this.possuiPermissaoEditar(['Administrador'])
    );
  }

  get exibirSolicitarAjustes(): boolean {
    return (this.projetoPlurianual?.situacao === SituacaoProjetoPlurianual.AguardandoLevantamentoDeCustoEPrazo) &&
      this.possuiPermissaoEditar(['Administrador'])
  }

  get exibirReprovarProjeto(): boolean {
    return (
      (this.projetoPlurianual?.situacao ===
        SituacaoProjetoPlurianual.AguardandoAprovacao ||
        this.projetoPlurianual?.situacao ===
        SituacaoProjetoPlurianual.ProjetoPlurianualValidado ||
        this.projetoPlurianual?.situacao ===
        SituacaoProjetoPlurianual.ProjetoPlurianualValidadoRessalvas) &&
      this.possuiPermissaoEditar(['Administrador'])
    );
  }

  get exibirSolicitarLevantamentoCusto(): boolean {
    return (
      this.possuiPermissaoEditar(['Administrador']) &&
      (this.projetoPlurianual?.situacao === SituacaoProjetoPlurianual.EmElaboracao ||
        !this.editando)
    );
  }

  get exibirConcluirLevantamentoCusto(): boolean {
    return (
      this.projetoPlurianual?.situacao ===
      SituacaoProjetoPlurianual.AguardandoLevantamentoDeCustoEPrazo &&
      !this.projetoPlurianual?.declaracoesTrabalho.find((x) => {
        return !(
          x.situacao === DeclaracaoTrabalhoSituacao.Finalizada ||
          x.situacao === DeclaracaoTrabalhoSituacao.Cancelada
        );
      })
    );
  }

  alterarSituacao(situacao: SituacaoProjetoPlurianual, observacao?: string) {
    if (this.getExibirModalMotivo(situacao)) {
      this.abrirModalMotivo(situacao);
    } else {
      this.salvandoProjeto = true;

      let req = new ProjetoPlurianualAlterarSituacaoCommand({
        situacao,
        projetoPlurianualId: this.projetoPlurianual?.id,
        observacao: observacao
      })
      
      this.projetosPlurianuaisClient
        .alterarSituacao(
          this.projetoPlurianual.id.toString(), req
        )
        .pipe(
          finalize(() => {
            this.salvandoProjeto = false;
          })
        )
        .subscribe((r) => {
          this.nzNotificationService.success(
            'Situação alterada com sucesso!',
            ''
          );
          this.projetoPlurianual.situacao = r.situacao;
          this.projetoPlurianual.situacaoDescricao = r.situacaoDescricao;
          this.projetoPlurianual.motivoSolicitacaoNovasInformacoes =
            r.motivoSolicitacaoNovasInformacoes;

          if (
            r.situacao ==
            SituacaoProjetoPlurianual.AguardandoLevantamentoDeCustoEPrazo
          ) {
            this.tabIndex = 1;
          }
        });
    }
  }

  exibirModalConfirmacaoAprovacao() {
    const modal = this.nzModalService.create({
      nzContent: ModalConfirmacaoComponent,
      nzTitle: 'Confirmação',
      nzComponentParams: {
        mensagem: 'Deseja aprovar o projeto?',
        textoOk: 'Aprovar',
        textoCancelar: 'Cancelar',
        corCancelar: 'red',
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.alterarSituacao(SituacaoProjetoPlurianual.ProjetoPlurianualValidado);
      } else {

      }
    });
  }

  exibirModalConfirmacaoReprovacao() {
    const modal = this.nzModalService.create({
      nzContent: ModalConfirmacaoComponent,
      nzTitle: 'Confirmação',
      nzComponentParams: {
        mensagem: 'Deseja reprovar o projeto?',
        textoOk: 'Sim',
        textoCancelar: 'Cancelar',
        corCancelar: '#ff3b3b',
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.alterarSituacao(
          SituacaoProjetoPlurianual.ProjetoPlurianualReprovado
        );
      }
    });
  }

  selectedIndexChange(index: number) {
    this.tabIndex = index;
  }

  //#region Permissões
  possuiPermissaoEditar(permissoes: string[]): boolean {
    
      if (this.projeto?.preProjeto.permissaoUsuarioLogado == PermissaoAcessoPreProjetoTipo.AcessoTotal)
      {
        return true;
      }

    var possuiPermissao = false;

    if (permissoes == null) possuiPermissao;

    var permissions = this.permissionsService.getPermissions();

    permissoes.forEach((element) => {
      if (element in permissions) {
        possuiPermissao = true;
        return;
      }
    });

    return possuiPermissao;
  }
  //#endregion

  getDataEntregaFornecedor(dt: DeclaracaoTrabalhoVm): string {
    if (dt.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor)
      return !dt.dataEntregaFornecedor
        ? '-'
        : dt.dataEntregaFornecedor?.toLocaleDateString();
    else if (dt.situacao == DeclaracaoTrabalhoSituacao.AguardandoClassificacao)
      return !dt.dataEntregaClassificacaoContabil
        ? '-'
        : dt.dataEntregaClassificacaoContabil?.toLocaleDateString();
    else return '-';
  }

  getExibirModalMotivo(situacao: SituacaoProjetoPlurianual) {
    return (
      situacao == SituacaoProjetoPlurianual.EmElaboracao ||
      (this.mensagens?.length &&
        situacao ==
        SituacaoProjetoPlurianual.AguardandoLevantamentoDeCustoEPrazo)
    );
  }

  abrirModalMotivo(situacao: SituacaoProjetoPlurianual) {
    this.salvandoProjeto = true;

    const modal = this.nzModalService.create({
      nzTitle: 'Solicitar ajustes',
      nzContent: SolicitarAjustesProjetoPlurianualComponent,
      nzComponentParams: {
        projeto: this.projetoPlurianual,
        situacao: situacao,
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.pipe(take(1)).subscribe((r) => {
      this.projetoPlurianual = !!r ? r : this.projetoPlurianual;
      this.salvandoProjeto = false;
    });
  }

  get exibirMotivoPedidoAjustes(): boolean {
    return (this.projetoPlurianual?.situacao === SituacaoProjetoPlurianual.EmElaboracao || this.projetoPlurianual?.situacao === SituacaoProjetoPlurianual.AguardandoLevantamentoDeCustoEPrazo)
      && !!this.mensagens?.length
  }

  obterMensagens() {
    if(this.projetoPlurianual.projetoSituacoes?.length > 0) {
    this.mensagens = this.projetoPlurianual.projetoSituacoes?.sort((x, y) => { return x.data < y.data ? 1 : x.data > y.data ? -1 : 0 })
              .filter((x) => { return !!x.mensagem; });
    }
  }

  exibirModalConfirmacaoRessalva() {
    const modal = this.nzModalService.create({
      nzContent: RessalvaListarOrcamentosComponent,
      nzTitle: "Confirmação",
      nzComponentParams: {
        projetoPlurianual: this.projetoPlurianual
      },
      nzMaskClosable: false,
      nzClosable: false,
      nzWidth: "75%"
    });

    modal.afterClose.subscribe((r) => {
      if (r["aprovar"]) {
        this.alterarSituacao(SituacaoProjetoPlurianual.ProjetoPlurianualValidadoRessalvas, r["ressalva"])
      }
      else { }
    });
  }

  get exibirAprovarProjetoComRessalva(): boolean{
    return this.exibirAprovarProjeto || this.projetoPlurianual?.situacao === SituacaoProjetoPlurianual.ProjetoPlurianualValidadoRessalvas
  }

  //menu lateral
  fecharMenuLateral() {
    this.exibirMenuLateral = false;
  }

  abrirMenuLateral(aba: Abas) {
    this.abaSelecionada = aba;
    this.exibirMenuLateral = true;
  }

  verificarDeclaracaoTrabalho() {
    if(this.projetoPlurianual.declaracoesTrabalho.length == 0) {
    this.nzNotificationService.warning("Levantamento de Custo e Prazo", 'Crie uma declaração de trabalho para prosseguir')
    }
    else {
      this.alterarSituacao(SituacaoProjetoPlurianual.AguardandoAprovacao)
    }
  }
  exibirModalPermissoes() {
    this.nzModalService.create({
      nzContent: PermissaoProjetoModalComponent,
      nzTitle: 'Permissões',
      nzComponentParams: {
        preProjetoId: this.projeto.preProjeto.id,
      },
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: '50%',
      nzBodyStyle: { height: '500px' },
    });
  }

  abrirModalAlterarStatusProjeto(status: StatusProjeto){
    const modal = this.nzModalService.create({
      nzContent: PausarCancelarProjetoModalComponent,
      nzTitle: (status === StatusProjeto.Pausado ? 'Pausar' : 'Cancelar') + ' Projeto',
      nzFooter: null,
      nzComponentParams: {
        projetoId: this.projetoPlurianual.projetoId,
        status: status
      },
      nzWidth: "50%"
    });

    modal.afterClose.subscribe((r) => {
      if(r){
        this.projeto.status = r.status;
        this.projeto.statusDescricao = r.statusDescricao;
        this.projeto.motivoPausaCancelamento = r.motivoPausaCancelamento;

        if(this.projeto?.status !== StatusProjeto.Ativo){
          this.toggleForm(false);
        }
        else{
          this.toggleForm(true);
        }
      }
    });
  }

  abrirModalVisualizarMotivoPausaCancelamento(){
    const modal = this.nzModalService.create({
      nzContent: PausarCancelarProjetoModalComponent,
      nzTitle: 'Visualizar Motivo Pausa/Cancelamento',
      nzFooter: null,
      nzComponentParams: {
        projetoId: this.projetoPlurianual.projetoId,
        motivoPausaCancelamento: this.projeto.motivoPausaCancelamento
      },
      nzWidth: "50%"
    });
  }

  alterarStatusProjeto(status: StatusProjeto){
    var req = <ProjetoAlterarStatusCommand>{
      projetoId: this.projetoPlurianual.projetoId,
      status: status
    };
    this.projetosClient.alterarStatus(req)
      .subscribe({
        next: res => {
          this.projeto.status = res.status;
          this.projeto.statusDescricao = res.statusDescricao;

          if(this.projeto?.status !== StatusProjeto.Ativo){
            this.toggleForm(false);
          }
          else{
            this.toggleForm(true);
          }
        },
        error: error => {
          this.nzModalService.error({
            nzTitle: 'Erro',
            nzContent:
              'Não foi possível alterar o status do projeto'
          });
          console.log(error);
        }
      });
  }

  toggleForm(habilitar: boolean){
    if(habilitar){
      this.form.enable();
    }
    else{
      this.form.disable();
    }
  }

  get podeEditarPermissoes(): boolean {
    return this.possuiPermissaoEditar(['Administrador']);
  }

  imprimir() {
    setTimeout(() => window.print(), 2000)
  }


  get exibirRetomarProjeto(): boolean{
    return this.projeto?.status === StatusProjeto.Pausado || this.projeto?.status === StatusProjeto.Cancelado;
  }

  get exibirPausarCancelarProjeto(): boolean{
    return this.projeto?.status === StatusProjeto.Ativo;
  }

  get exibirConcluirProjeto(): boolean{
    return this.projeto?.status === StatusProjeto.Ativo;
  }

  get desabilitaBotoes(): boolean{
    return this.projeto?.status !== StatusProjeto.Ativo;
  }

  get habilitarBotaoVisualizarModalMotivoPausaCancelamento(){
    return this.projeto?.status === StatusProjeto.Pausado || this.projeto?.status === StatusProjeto.Cancelado;
  }
}
