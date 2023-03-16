import { OrcamentosListarComponent } from './../../declaracoes-trabalho/components/orcamentos-listar/orcamentos-listar.component';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCollapsePanelComponent } from 'ng-zorro-antd/collapse';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgxPermissionsService } from 'ngx-permissions';
import { EMPTY, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
  take,
} from 'rxjs/operators';
import { ModalConfirmacaoComponent } from 'src/app/shared/components/modal-confirmacao/modal-confirmacao.component';
import { RessalvaListarOrcamentosComponent } from 'src/app/shared/components/ressalva-preprojeto/ressalva-listar-orcamentos/ressalva-listar-orcamentos.component';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import {
  AdClient,
  AreaEnvolvidaVm,
  CestasClient,
  CestaVm,
  DeclaracaoTrabalhoSituacao,
  DeclaracaoTrabalhoVm,
  DepartamentosClient,
  DepartamentoVm,
  ObjetivoEstrategicoPreProjetoVm,
  ObjetivoEstrategicoVm,
  ObjetivosEstrategicosClient,
  OrigemPreProjeto,
  PermissaoAcessoPreProjetoTipo,
  PortifoliosClient,
  PortifolioVm,
  PreProjetoAlterarCommand,
  PreProjetoAlterarParecerCommand,
  PreProjetoAlterarSituacaoCommand,
  PreProjetosClient,
  PreProjetoSituacao,
  PreProjetoSituacaoVm,
  PreProjetoVm,
  SituacaoParecer,
  SituacaoPreProjeto,
  SituacaoPreProjetoOrcamento,
  StakeholdersClient,
  StakeholderVm,
  TipoParecer,
  UsuarioAd,
  ZonaRisco,
} from 'web-api-client';
import { PermissaoProjetoModalComponent } from '../components/permissao-projeto-modal/permissao-projeto-modal.component';
import { SolicitacaoAjustesProjetoComponent } from '../components/solicitacao-ajustes-projeto/solicitacao-ajustes-projeto.component';
import { AprovacaoModalComponent } from '../components/aprovacao-modal/aprovacao-modal.component';

@Component({
  templateUrl: './preprojeto-editar.component.html',
  styleUrls: ['./preprojeto-editar.component.scss'],
})
export class PreProjetoEditarComponent implements OnInit {
  @ViewChildren(NzCollapsePanelComponent)
  collapsePanelComponents: QueryList<NzCollapsePanelComponent>;

  form: UntypedFormGroup;
  formParecerJuridico: UntypedFormGroup;
  formParecerDepartamentoRiscos: UntypedFormGroup;
  projeto: PreProjetoVm;
  carregandoProjeto: boolean;
  salvandoProjeto: boolean;

  ZonaRisco = ZonaRisco;
  stakeholders: StakeholderVm[];
  departamentos: DepartamentoVm[];
  objetivos: ObjetivoEstrategicoVm[];

  private searchGerenteProjeto$: Subject<string>;
  buscandoGerenteProjetoAd: boolean;
  gerentesProjetoAd: UsuarioAd[];

  private searchGerenteNegocio$: Subject<string>;
  buscandoGerenteNegocioAd: boolean;
  gerentesNegocioAd: UsuarioAd[];

  private searchSponsorProjeto$: Subject<string>;
  buscandoSponsorProjetoAd: boolean;
  sponsorsProjetoAd: UsuarioAd[];

  addAreaEnvolvidaInput: string;
  addObjetivoEstrategicoInput: string;

  parecerJuridicoModel = <PreProjetoAlterarParecerCommand>{};
  parecerDepartamentoRiscosModel = <PreProjetoAlterarParecerCommand>{};
  salvandoParecerJuridico: boolean;
  salvandoParecerDepartamentoRiscos: boolean;
  SituacaoParecer = SituacaoParecer;
  SituacaoPreProjeto = SituacaoPreProjeto;
  OrigemPreProjeto = OrigemPreProjeto;

  abaSelecionada: number = 0;
  cestas: CestaVm[];
  portifolios: PortifolioVm[];
  mensagens: PreProjetoSituacaoVm[];

  salvarAnaliseFinanceiraSubject: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private nzModalService: NzModalService,
    private nzNotificationService: NzNotificationService,
    private adClient: AdClient,
    private PreProjetosClient: PreProjetosClient,
    private stakeholdersClient: StakeholdersClient,
    private departamentosClient: DepartamentosClient,
    private permissionsService: NgxPermissionsService,
    private authenticationService: AuthenticationService,
    private cestasClient: CestasClient,
    private portifolioClient: PortifoliosClient,
    private objetivosClient: ObjetivosEstrategicosClient,
    private ano: YearReferenceService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.carregarProjeto(this.route.snapshot.paramMap.get('id'));
    this.obterStakeholders();
    this.obterDepartamentos();
    this.obterObjetivos();
    this.initSubjectSearchGerenteProjeto();
    this.initSubjectSearchGerenteNegocio();
    this.initSubjectSearchSponsorProjeto();
    this.obterCestas();
    this.obterPortifolios();
    this.initFormParecerJuridico();
    this.initFormParecerDepartamentoRiscos();
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      nome: [null, Validators.required],
      departamentoId: [null, Validators.required],
      gerenteProjeto: [null, Validators.required],
      gerenteNegocio: [null, Validators.required],
      sponsorProjeto: [null, Validators.required],
      ideia: [null, Validators.required],
      atendeRequisitoLegal: [null, Validators.required],
      descricaoAtendeRequisitoLegal: [null],
      possuiAlinhamentoObjetivosEstrategicos: [null, Validators.required],
      descricaoPossuiAlinhamentoObjetivosEstrategicos: [null],
      possuiVinculoEstrategiaOperacao: [null],
      descricaoPossuiVinculoEstrategiaOperacao: [null],
      acrescentaProdutoServico: [null, Validators.required],
      descricaoAcrescentaProdutoServico: [null],
      zonaRisco: [null],
      descricaoZonaRisco: [null],
      abrangenciaResultadoRestrigeApenasPropriaArea: [
        null,
        Validators.required,
      ],
      descricaoAbrangenciaResultadoRestrigeApenasPropriaArea: [null],
      stakeHolders: [null],
      possuiNovasAquisicoes: [null, Validators.required],
      descricaoPossuiNovasAquisicoes: [null],
      necessarioNovosConhecimentos: [null, Validators.required],
      descricaoNecessarioNovosConhecimentos: [null],
      areasEnvolvidas: [null],
      pontuacaoWorkshop: [null],
      portifolioId: [null],
      cestaId: [null],
      objetivosEstrategicos: [null],
      observacaoOrcamentos: [null],
      origem: [null, Validators.required],
    });
  }

  private initFormParecerDepartamentoRiscos() {
    this.formParecerDepartamentoRiscos = new UntypedFormBuilder().group({
      parecerDepartamentoRiscos: [null],
      descricaoParecerDepartamentoRiscos: [null, Validators.required],
    });
  }

  private initFormParecerJuridico() {
    this.formParecerJuridico = new UntypedFormBuilder().group({
      parecerDepartamentoJuridico: [null],
      descricaoParecerDepartamentoJuridico: [null, Validators.required],
    });
  }

  obterCestas() {
    this.cestasClient.obter(-1, 0).subscribe((res) => {
      this.cestas = res.items;
    });
  }

  obterPortifolios() {
    this.portifolioClient.obter(-1, 0).subscribe((res) => {
      this.portifolios = res.items;
    });
  }

  private carregarProjeto(id) {
    this.carregandoProjeto = true;
    this.PreProjetosClient.obterPorId(id)
      .pipe(
        finalize(() => {
          this.carregandoProjeto = false;
        })
      )
      .subscribe((r) => {
        this.projeto = r;
        this.setarParecerJuridico(r);
        this.setarParecerDepartamentoRiscos(r);
        this.obterMensagens()

        this.form.patchValue(r);

        this.form.patchValue({
          cestaId: r.cestaId,
          portifolioId: r.portifolioId,
        });

        if (!!r.loginGerenteProjeto) {
          let gerenteProjeto = <UsuarioAd>{
            login: r.loginGerenteProjeto,
            nome: r.nomeGerenteProjeto,
          };
          this.gerentesProjetoAd = [gerenteProjeto];
          this.form.patchValue({ gerenteProjeto });
        }

        if (!!r.loginGerenteNegocio) {
          let gerenteNegocio = <UsuarioAd>{
            login: r.loginGerenteNegocio,
            nome: r.nomeGerenteNegocio,
          };
          this.gerentesNegocioAd = [gerenteNegocio];
          this.form.patchValue({ gerenteNegocio });
        }

        if (!!r.loginSponsor) {
          let sponsorProjeto = <UsuarioAd>{
            login: r.loginSponsor,
            nome: r.nomeSponsor,
          };
          this.sponsorsProjetoAd = [sponsorProjeto];
          this.form.patchValue({ sponsorProjeto });
        }

        if (!!r.stakeHolders) {
          let stakeHolders: number[] = r.stakeHolders.map((s) => s.id);
          this.form.patchValue({ stakeHolders });
        }
      });
  }

  private obterDepartamentos() {
    this.departamentosClient.obter().subscribe((r) => {
      this.departamentos = r;
    });
  }

  private obterStakeholders() {
    this.stakeholdersClient.obter().subscribe((r) => {
      this.stakeholders = r;
    });
  }

  private obterObjetivos() {
    this.objetivosClient.obter().subscribe((r) => {
      this.objetivos = r;
    });
  }

  salvar(enviarPmo: boolean) {
    if (
      this.abaSelecionada == 4 &&
      this.projeto.situacao ==
      SituacaoPreProjeto.AguardandoAnaliseViabilidadeFinanceira
    ) {
      this.salvarAnaliseFinanceiraSubject.next();
      return;
    }
    if (this.exibirPontuacaoWorkshop) {
      this.form.controls["pontuacaoWorkshop"].setValidators(Validators.required);
      this.form.get("pontuacaoWorkshop").updateValueAndValidity();
    }
    if (enviarPmo) {
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
        return;
    }
    } else {
      if (this.form.controls["nome"].invalid) {
        this.nzModalService.warning({
          nzTitle: 'Atenção',
          nzContent:
            'Verifique o formulário e preencha corretamente o campo obrigatório!',
        });
        this.form.controls["nome"].markAsDirty();
        this.form.controls["nome"].updateValueAndValidity();
        this.expandAll();
        return;
    }
   
  }
    this.salvarProjeto(enviarPmo);
  }

  private salvarProjeto(enviarPmo: boolean, portifolioId?: number) {
    const fValue = this.form.value;
    const req = PreProjetoAlterarCommand.fromJS(fValue);
    if(!!portifolioId) {
      req.portifolioId = portifolioId
    }
    req.enviarPmo = enviarPmo;
    req.loginGerenteProjeto = fValue.gerenteProjeto?.login;
    req.nomeGerenteProjeto = fValue.gerenteProjeto?.nome;

    req.loginGerenteNegocio = fValue.gerenteNegocio?.login;
    req.nomeGerenteNegocio = fValue.gerenteNegocio?.nome;

    req.loginSponsor = fValue.sponsorProjeto?.login;
    req.nomeSponsor = fValue.sponsorProjeto?.nome;

    req.areasEnvolvidas = this.areasEnvolvidas?.map((a) => a.departamentoId);

    req.objetivosEstrategicos = this.objetivosPreProjeto?.map((a) => a.id);

    req.descricaoParecerDepartamentoJuridico =
      this.parecerJuridicoModel?.parecer;
    req.descricaoParecerDepartamentoRiscos =
      this.parecerDepartamentoRiscosModel?.parecer;

    this.salvandoProjeto = true;
    this.PreProjetosClient.alterar(req)
      .pipe(
        finalize(() => {
          this.salvandoProjeto = false;
        })
      )
      .subscribe((r) => {
        this.nzNotificationService.success('Projeto salvo com sucesso!', '');

        if (enviarPmo) {
          if (
            this.getExibirModalMotivo(SituacaoPreProjeto.ProjetoClassificado)
          ) {
            this.abrirModalMotivo(SituacaoPreProjeto.ProjetoClassificado);
          } else {
            this.carregarProjeto(this.projeto.id);
          }
        } else this.carregarProjeto(this.projeto.id);
      });
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

  private initSubjectSearchGerenteNegocio() {
    this.searchGerenteNegocio$ = new Subject<string>();
    this.searchGerenteNegocio$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) {
            return of([]);
          }
          this.buscandoGerenteNegocioAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => {
              this.buscandoGerenteNegocioAd = false;
            }),
            catchError((err) => {
              return EMPTY;
            })
          );
        })
      )
      .subscribe((r) => {
        this.gerentesNegocioAd = r;
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

  searchGerenteProjeto(value: string): void {
    this.searchGerenteProjeto$.next(value);
  }

  searchGerenteNegocio(value: string): void {
    this.searchGerenteNegocio$.next(value);
  }

  searchSponsorProjeto(value: string): void {
    this.searchSponsorProjeto$.next(value);
  }

  addAreaEnvolvida(area: DepartamentoVm) {
    if (area) {
      setTimeout(() => {
        this.addAreaEnvolvidaInput = null;
      });
      let areasEnvolvidas = this.areasEnvolvidas;
      if (!areasEnvolvidas.find((a) => a.departamentoId == area.id)) {
        areasEnvolvidas.push(
          new AreaEnvolvidaVm({
            departamentoId: area.id,
            nome: area.nome,
          })
        );
        this.form.patchValue({ areasEnvolvidas });
      }
    }
  }

  removerAreaEnvolvida(area: AreaEnvolvidaVm) {
    this.form.patchValue({
      areasEnvolvidas: this.areasEnvolvidas.filter(
        (a) => a.departamentoId != area.departamentoId
      ),
    });
  }

  get areasEnvolvidas(): AreaEnvolvidaVm[] {
    return [...(this.form.controls.areasEnvolvidas.value || [])];
  }

  get objetivosPreProjeto(): ObjetivoEstrategicoPreProjetoVm[] {
    return [...(this.form.controls.objetivosEstrategicos.value || [])];
  }

  addObjetivoEstrategico(objetivo: ObjetivoEstrategicoVm) {
    if (objetivo) {
      setTimeout(() => {
        this.addObjetivoEstrategicoInput = null;
      });

      let objetivosEstrategicos = this.objetivosPreProjeto;

      if (!objetivosEstrategicos.find((x) => x.id == objetivo.id)) {
        objetivosEstrategicos.push(
          new ObjetivoEstrategicoPreProjetoVm({
            id: objetivo.id,
            descricao: objetivo.descricao,
          })
        );
        this.form.patchValue({ objetivosEstrategicos });
      }
    }
  }

  removerObjetivoEstrategico(objetivo: ObjetivoEstrategicoVm) {
    this.form.patchValue({
      objetivosEstrategicos: this.objetivosPreProjeto.filter(
        (a) => a.id != objetivo.id
      ),
    });
  }

  get anyExpanded(): boolean {
    return !!this.collapsePanelComponents?.find((cp) => cp.nzActive);
  }

  private getFormControlValue(controlName: string): any {
    return this.form.controls[controlName].value;
  }

  get atendeRequisitoLegal(): boolean {
    return this.getFormControlValue('atendeRequisitoLegal');
  }

  get possuiAlinhamentoObjetivosEstrategicos(): boolean {
    return this.getFormControlValue('possuiAlinhamentoObjetivosEstrategicos');
  }

  get possuiVinculoEstrategiaOperacao(): boolean {
    return this.getFormControlValue('possuiVinculoEstrategiaOperacao');
  }

  get acrescentaProdutoServico(): boolean {
    return this.getFormControlValue('acrescentaProdutoServico');
  }

  get zonaRiscoInativo(): boolean {
    return this.getFormControlValue('zonaRisco') === ZonaRisco.NaoEstaAssociado;
  }

  get abrangenciaResultadoRestrigeApenasPropriaArea(): boolean {
    return this.getFormControlValue(
      'abrangenciaResultadoRestrigeApenasPropriaArea'
    );
  }

  get possuiNovasAquisicoes(): boolean {
    return this.getFormControlValue('possuiNovasAquisicoes');
  }

  get necessarioNovosConhecimentos(): boolean {
    return this.getFormControlValue('necessarioNovosConhecimentos');
  }

  get exibirSalvarEnviarPmo(): boolean {
    return this.projeto.situacao === SituacaoPreProjeto.EmElaboracao;
  }

  get possuiPermissaoVerHistorico(): boolean {
    return this.possuiPermissaoEditar(['Administrador']);
  }

  private setarParecerJuridico(i: PreProjetoVm) {
    this.parecerJuridicoModel = PreProjetoAlterarParecerCommand.fromJS({
      projetoId: i.id,
      tipoParecer: TipoParecer.Juridico,
      parecer: i.descricaoParecerDepartamentoJuridico,
      situacao: i.parecerDepartamentoJuridico,
    });
  }

  private setarParecerDepartamentoRiscos(i: PreProjetoVm) {
    this.parecerDepartamentoRiscosModel =
      PreProjetoAlterarParecerCommand.fromJS({
        projetoId: i.id,
        tipoParecer: TipoParecer.Dpo,
        parecer: i.descricaoParecerDepartamentoRiscos,
        situacao: i.parecerDepartamentoRiscos,
      });
  }

  aprovarParecerJuridico() {
    if (this.formParecerJuridico.invalid) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente o campo obrigatório!',
      });
      for (const key in this.formParecerJuridico.controls) {
        this.formParecerJuridico.controls[key].markAsDirty();
        this.formParecerJuridico.controls[key].updateValueAndValidity();
      }
    } else {
      this.salvarParecerJuridico(SituacaoParecer.Aprovado);
    }
  }

  reprovarParecerJuridico() {
    this.salvarParecerJuridico(SituacaoParecer.Reprovado);
  }

  aprovarParecerDepartamentoRiscos() {
    if (this.formParecerDepartamentoRiscos.invalid) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente o campo obrigatório!',
      });
      for (const key in this.formParecerDepartamentoRiscos.controls) {
        this.formParecerDepartamentoRiscos.controls[key].markAsDirty();
        this.formParecerDepartamentoRiscos.controls[
          key
        ].updateValueAndValidity();
      }
    } else {
      this.salvarParecerDepartamentoRiscos(SituacaoParecer.Aprovado);
    }
  }

  reprovarParecerDepartamentoRiscos() {
    this.salvarParecerDepartamentoRiscos(SituacaoParecer.Reprovado);
  }

  salvarParecerJuridico(situacao?: SituacaoParecer) {
    let req = this.parecerJuridicoModel;

    if (situacao != undefined) {
      req.situacao = situacao;
    }

    this.salvandoParecerJuridico = true;
    this.PreProjetosClient.alterarParecer(this.projeto.id, req)
      .pipe(
        finalize(() => {
          this.salvandoParecerJuridico = false;
          this.nzNotificationService.success(
            'Parecer Jurídico salvo com sucesso!',
            ''
          );
        })
      )
      .subscribe((r) => {
        this.projeto = r;
        this.setarParecerJuridico(r);
        this.carregarProjeto(this.projeto.id);
      });
  }

  salvarParecerDepartamentoRiscos(situacao?: SituacaoParecer) {
    let req = this.parecerDepartamentoRiscosModel;
    if (situacao != undefined) {
      req.situacao = situacao;
    }
    this.salvandoParecerDepartamentoRiscos = true;
    this.PreProjetosClient.alterarParecer(this.projeto.id, req)
      .pipe(
        finalize(() => {
          this.salvandoParecerDepartamentoRiscos = false;
          this.nzNotificationService.success(
            'Parecer do DPO salvo com sucesso!',
            ''
          );
        })
      )
      .subscribe((r) => {
        this.projeto = r;
        this.setarParecerDepartamentoRiscos(r);
        this.carregarProjeto(this.projeto.id);
      });
  }

  get exibirParecer(): boolean {
    return this.projeto.situacao !== SituacaoPreProjeto.EmElaboracao;
  }

  get exibirAbaDeclaracaoTrabalho(): boolean {
    return (
      this.projeto.situacao !== SituacaoPreProjeto.EmElaboracao &&
      this.projeto.situacao !== SituacaoPreProjeto.ProjetoClassificado
    );
  }

  get exibirAbaViabilidadeEconomicaFinanceira(): boolean {
    return (
      (this.projeto.situacao ===
        SituacaoPreProjeto.AguardandoAnaliseViabilidadeFinanceira ||
        this.projeto.situacao === SituacaoPreProjeto.AguardandoAprovacao ||
        this.projeto.situacao === SituacaoPreProjeto.ProjetoReprovado ||
        this.projeto.situacao === SituacaoPreProjeto.ProjetoValidado ||
        this.projeto.situacao ===
        SituacaoPreProjeto.ProjetoValidadoRessalvas) &&
      this.possuiPermissaoEditar([
        'Administrador',
        'Projeto.ViabilidadeEconomicoFinanceira',
      ])
    );
  }

  get exibirAprovarProjeto(): boolean {
    return (
      this.projeto.situacao === SituacaoPreProjeto.AguardandoAprovacao ||
      this.projeto.situacao === SituacaoPreProjeto.ProjetoReprovado
    ) && this.possuiPermissaoEditar(['Administrador']);
  }

  get exibirAprovarRessalvaProjeto(): boolean {
    return (
      this.exibirAprovarProjeto ||
      this.projeto.situacao === SituacaoPreProjeto.ProjetoValidadoRessalvas
    );
  }

  get exibirReprovarProjeto(): boolean {
    return this.projeto.situacao === SituacaoPreProjeto.AguardandoAprovacao;
  }

  get exibirRetornarParaElaboracao(): boolean {
    return (
      this.projeto.situacao === SituacaoPreProjeto.ProjetoClassificado &&
      (this.possuiPermissaoEditar(['Administrador']) ||
        this.authenticationService.loginUsuarioLogado ==
        this.projeto.loginGerenteProjeto)
    );
  }

  get exibirSolicitarLevantamentoCusto(): boolean {
    return (
      this.possuiPermissaoEditar(['Administrador']) &&
      this.projeto.situacao === SituacaoPreProjeto.ProjetoClassificado
    );
  }

  get exibirSolicitarAnaliseFinanceira(): boolean {
    return (
      (this.possuiPermissaoEditar(['Administrador']) ||
        this.projeto.loginGerenteProjeto ==
        this.authenticationService.loginUsuarioLogado) &&
      this.projeto.situacao ===
      SituacaoPreProjeto.AguardandoLevantamentoDeCustoEPrazo
    );
  }

  get exibirMotivoPedidoAjustes(): boolean {
    return this.getExibirModalMotivo(this.projeto?.situacao);
  }

  get exibirAprovarParecerJuridico(): boolean {
    return (
      (this.possuiPermissaoEditar(['Administrador']) ||
        this.possuiPermissaoEditar(['Projeto.AprovarParecerJuridico'])) &&
      this.abaParecerAtiva
    );
  }

  get exibirAprovarParecerDPO(): boolean {
    return (
      (this.possuiPermissaoEditar(['Administrador']) ||
        this.possuiPermissaoEditar(['Projeto.AprovarParecerDpo'])) &&
      this.abaParecerAtiva
    );
  }

  get bloquearCadastrarDt(): boolean {
    return (
      this.projeto.situacao === SituacaoPreProjeto.ProjetoValidado ||
      this.projeto.situacao === SituacaoPreProjeto.ProjetoReprovado ||
      this.projeto.situacao === SituacaoPreProjeto.ProjetoValidadoRessalvas
    );
  }

  get permissaoEditarParecerJuridico(): boolean {
    return (
      this.possuiPermissaoEditar(['Administrador']) ||
      (this.possuiPermissaoEditar(['Projeto.AprovarParecerJuridico']) &&
        this.parecerJuridicoModel.situacao !== SituacaoParecer.Aprovado)
    );
  }

  get permissaoEditarParecerDPO(): boolean {
    return (
      this.possuiPermissaoEditar(['Administrador']) ||
      (this.possuiPermissaoEditar(['Projeto.AprovarParecerDpo']) &&
        this.parecerDepartamentoRiscosModel.situacao !==
        SituacaoParecer.Aprovado)
    );
  }

  get corSituacao(): string {
    switch (this.projeto.situacao) {
      case SituacaoPreProjeto.EmElaboracao:
        return 'gold';
      case SituacaoPreProjeto.ProjetoClassificado:
        return 'gold';
      case SituacaoPreProjeto.AguardandoAnaliseViabilidadeFinanceira:
        return 'gold';
      case SituacaoPreProjeto.AguardandoLevantamentoDeCustoEPrazo:
        return 'gold';
      case SituacaoPreProjeto.AguardandoAprovacao:
        return 'gold';
      case SituacaoPreProjeto.ProjetoValidado:
        return 'green';
      case SituacaoPreProjeto.ProjetoReprovado:
        return 'red';
      case SituacaoPreProjeto.ProjetoValidadoRessalvas:
        return 'blue';
      case SituacaoPreProjeto.ProjetoArquivado:
        return 'gray';
    }
  }
  obterMensagens() {
    if(this.projetoArquivado) {
      this.mensagens = this.projeto?.projetoSituacoes.filter((p) => {
        return !!p.mensagem;
      });
    } else {
      this.mensagens = this.projeto?.projetoSituacoes.filter((p) => {
        return !!p.mensagem && p.situacao != SituacaoPreProjeto.ProjetoArquivado;
      });
    }
  }
  getExibirModalMotivo(situacao: SituacaoPreProjeto) {
    return (
      situacao == SituacaoPreProjeto.EmElaboracao ||
      (this.mensagens.length &&
        situacao == SituacaoPreProjeto.ProjetoClassificado)
    );
  }
  alterarSituacao(
    situacao: SituacaoPreProjeto,
    observacao?: string,
    recarregar: boolean = false,
    dataProjeto?: Date
  ) {
    if (this.getExibirModalMotivo(situacao)) {
      this.abrirModalMotivo(situacao);
    } else {
      this.salvandoProjeto = true;
      this.PreProjetosClient.alterarSituacao(
        this.projeto.id,
        new PreProjetoAlterarSituacaoCommand({
          situacao,
          preProjetoId: this.projeto.id,
          observacao,
          dataProjeto
        })
      )
        .pipe(
          finalize(() => {
            this.salvandoProjeto = false;
          })
        )
        .subscribe(
          (r) => {
            if (recarregar) {
              window.location.reload();
            }

            this.nzNotificationService.success(
              'Situação alterada com sucesso!',
              ''
            );
            this.projeto.situacao = r.situacao;
            this.projeto.situacaoDescricao = r.situacaoDescricao;
            this.projeto.motivoSolicitacaoNovasInformacoes =
              r.motivoSolicitacaoNovasInformacoes;
          },
          (error) => {
            this.nzNotificationService.error('Erro ao alterar situação!', '');
          }
        );
    }
  }

  projetoAlterada(projeto: PreProjetoVm) {
    this.projeto = projeto;
  }

  get somaValoresDespesaAdministrativa(): number {
    return this.projeto.declaracoesTrabalho
      .map((o) => o.totalDespesaAdministrativa)
      .reduce((sum, current) => sum + current, 0);
  }

  get somaValoresCustoAssistencial(): number {
    return this.projeto.declaracoesTrabalho
      .map((o) => o.totalCustoAssistencial)
      .reduce((sum, current) => sum + current, 0);
  }

  get somaValoresInvestimento(): number {
    return this.projeto.declaracoesTrabalho
      .map((o) => o.totalInvestimento)
      .reduce((sum, current) => sum + current, 0);
  }

  get somaValoresOrcamento(): number {
    return this.projeto.declaracoesTrabalho
      .map((o) => o.totalOrcamento)
      .reduce((sum, current) => sum + current, 0);
  }

  abrirModalMotivo(situacao: SituacaoPreProjeto) {
    this.salvandoProjeto = true;

    const modal = this.nzModalService.create({
      nzTitle: 'Solicitar ajustes',
      nzContent: SolicitacaoAjustesProjetoComponent,
      nzComponentParams: {
        projeto: this.projeto,
        situacao: situacao,
        arquivar: false
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.pipe(take(1)).subscribe((r) => {
      this.projeto = !!r ? r : this.projeto;
      this.salvandoProjeto = false;
    });
  }

  possuiPermissaoEditar(permissoes: string[]): boolean {
    if (this.projeto.situacao == SituacaoPreProjeto.EmElaboracao) return true;

    if (
      this.projeto.permissaoUsuarioLogado ==
      PermissaoAcessoPreProjetoTipo.AcessoTotal
    ) {
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

  selecionarAba(e) {
    //debugger
    this.abaSelecionada = e.index;
  }

  get situacoesOrdenadas(): PreProjetoSituacaoVm[] {
    return this.projeto.projetoSituacoes?.sort((x, y) => {
      return x.data < y.data ? 1 : x.data > y.data ? -1 : 0;
    });
  }

  get dataEmElaboracao(): string {
    let data = this.situacoesOrdenadas
      ?.find((x) => {
        return x.situacao == SituacaoPreProjeto.EmElaboracao;
      })
      ?.data.toLocaleString();
    return data ? data : this.dataProjetoClassificado;
  }
  get dataProjetoClassificado(): string {
    return this.situacoesOrdenadas
      ?.find((x) => {
        return x.situacao == SituacaoPreProjeto.ProjetoClassificado;
      })
      ?.data.toLocaleString();
  }
  get dataCustoEPrazo(): string {
    return this.situacoesOrdenadas
      ?.find((x) => {
        return (
          x.situacao == SituacaoPreProjeto.AguardandoLevantamentoDeCustoEPrazo
        );
      })
      ?.data.toLocaleString();
  }
  get dataViabilidadeFinanceira(): string {
    return this.situacoesOrdenadas
      ?.find((x) => {
        return (
          x.situacao ==
          SituacaoPreProjeto.AguardandoAnaliseViabilidadeFinanceira
        );
      })
      ?.data.toLocaleString();
  }
  get dataAguardandoAprovacao(): string {
    return this.situacoesOrdenadas
      ?.find((x) => {
        return x.situacao == SituacaoPreProjeto.AguardandoAprovacao;
      })
      ?.data.toLocaleString();
  }
  get dataAprovado(): string {
    return this.situacoesOrdenadas
      ?.find((x) => {
        return (
          x.situacao == SituacaoPreProjeto.ProjetoValidado ||
          x.situacao == SituacaoPreProjeto.ProjetoValidadoRessalvas
        );
      })
      ?.data.toLocaleString();
  }
  get dataReprovado(): string {
    return this.situacoesOrdenadas
      ?.find((x) => {
        return x.situacao == SituacaoPreProjeto.ProjetoReprovado;
      })
      ?.data.toLocaleString();
  }

  get projetoReprovado(): boolean {
    return this.projeto.situacao === SituacaoPreProjeto.ProjetoReprovado;
  }

  get projetoAprovado(): boolean {
    return (
      this.projeto.situacao === SituacaoPreProjeto.ProjetoValidado ||
      this.projeto.situacao === SituacaoPreProjeto.ProjetoValidadoRessalvas
    );
  }

  get projetoArquivado(): boolean {
    return this.projeto.situacao === SituacaoPreProjeto.ProjetoArquivado;
  }

  get timeLineIndex(): number {
    switch (this.projeto.situacao) {
      case SituacaoPreProjeto.EmElaboracao:
        return 0;
      case SituacaoPreProjeto.ProjetoClassificado:
        return 1;
      case SituacaoPreProjeto.AguardandoLevantamentoDeCustoEPrazo:
        return 2;
      case SituacaoPreProjeto.AguardandoAnaliseViabilidadeFinanceira:
        return 3;
      case SituacaoPreProjeto.AguardandoAprovacao:
        return 4;
      case SituacaoPreProjeto.ProjetoValidado ||
        SituacaoPreProjeto.ProjetoValidadoRessalvas ||
        SituacaoPreProjeto.ProjetoReprovado:
        return 5;
    }
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
  selecionouDepartamento(departamentoId?: number) {
    if (departamentoId) {
      var deps = this.departamentos.filter((x) => x.id == departamentoId);

      if (deps?.length == 1) {
        var departamentoSelecionado = deps[0];
        var gerenteProjeto = new UsuarioAd({
          login: departamentoSelecionado.loginGestor,
          nome: departamentoSelecionado.nomeGestor,
        });

        this.gerentesProjetoAd = [gerenteProjeto];

        //checa se tem departamento pai para incluir sponsor
        if (departamentoSelecionado.departamentoSuperiorVm) {
          var sponsorProjeto = new UsuarioAd({
            login: departamentoSelecionado.departamentoSuperiorVm.loginGestor,
            nome: departamentoSelecionado.departamentoSuperiorVm.nomeGestor,
          });

          this.sponsorsProjetoAd = [sponsorProjeto];
        }

        this.form.patchValue({
          gerenteProjeto,
          sponsorProjeto,
        });
      }
    }
  }

  exibirModalConfirmacaoAprovacao() {
    if (!this.projeto.descricaoParecerDepartamentoJuridico) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent: 'Favor preencher o parecer jurídico para aprovar o projeto',
      });
    } else if (!this.projeto.descricaoParecerDepartamentoRiscos) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent: 'Favor preencher o parecer DPO para aprovar o projeto',
      });
    } else {
      const modal = this.nzModalService.create({
        nzContent: AprovacaoModalComponent,
        nzTitle: 'Aprovar Iniciativa',
        nzComponentParams: {
          mensagem: "Preencha os dados para aprovar a iniciativa:",
          portifolios: this.portifolios,
          iniciativaPortifolioId: this.projeto.portifolioId,
          comRessalva: false
        },
        nzMaskClosable: false,
        nzClosable: false,
      });

      modal.afterClose.subscribe((r) => {
        if (r) {
          this.alterarSituacao(SituacaoPreProjeto.ProjetoValidado, null, false, r.dataProjeto);
          this.salvarProjeto(false, r.portifolioId)
        }
      }, (error) => {
        this.nzModalService.warning({
          nzTitle: 'Erro',
          nzContent: 'Erro ao aprovar o projeto',
        });
      });
    }
  }

  exibirModalConfirmacaoRessalva() {
    if (!this.projeto.descricaoParecerDepartamentoJuridico) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent: 'Favor preencher o parecer jurídico para aprovar o projeto',
      });
    } else if (!this.projeto.descricaoParecerDepartamentoRiscos) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent: 'Favor preencher o parecer DPO para aprovar o projeto',
      });
    } else {
      const modal = this.nzModalService.create({
        nzContent: AprovacaoModalComponent,
        nzTitle: 'Aprovar Iniciativa',
        nzComponentParams: {
          mensagem: "Preencha os dados para aprovar a iniciativa:",
          portifolios: this.portifolios,
          iniciativaPortifolioId: this.projeto.portifolioId,
          comRessalva: true
        },
        nzMaskClosable: false,
        nzClosable: false,
      });

      modal.afterClose.subscribe((r) => {
        console.log(r)
        if (r) {
          this.alterarSituacao(
            SituacaoPreProjeto.ProjetoValidadoRessalvas,
            r['ressalva'],
            true,
            r.dataProjeto
          );
        }
      }, (error) => {
        this.nzModalService.warning({
          nzTitle: 'Erro',
          nzContent: 'Erro ao aprovar o projeto',
        });
      });
    }
  }

  exibirModalConfirmacaoReprovacao() {
    const modal = this.nzModalService.create({
      nzContent: ModalConfirmacaoComponent,
      nzTitle: 'Confirmação',
      nzComponentParams: {
        mensagem: 'Deseja reprovar o projeto?',
        textoOk: 'Reprovar',
        textoCancelar: 'Cancelar',
        corCancelar: '#ff3b3b',
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.alterarSituacao(SituacaoPreProjeto.ProjetoReprovado);
      }
    });
  }

  exibirModalPermissoes() {
    this.nzModalService.create({
      nzContent: PermissaoProjetoModalComponent,
      nzTitle: 'Permissões',
      nzComponentParams: {
        preProjetoId: this.projeto.id,
      },
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: '50%',
      nzBodyStyle: { height: '500px' },
    });
  }

  get usuarioAdministrador(): boolean {
    return this.possuiPermissaoEditar(['Administrador']);
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
        this.PreProjetosClient.excluir(this.projeto.id)
          .pipe(
            finalize(() => {
              this.carregandoProjeto = false;
            })
          )
          .subscribe((r) => {
            this.nzNotificationService.success(
              'Projeto excluído com sucesso!',
              ''
            );
            this.router.navigateByUrl('pre-projetos');
          });
      }
    });
  }

  get abaParecerAtiva(): boolean {
    return this.abaSelecionada == 1;
  }

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

  get exibirPontuacaoWorkshop() {
    return this.form?.value['origem'] === OrigemPreProjeto.Workshop;
  }

  get mudarDirecaoTimeline() {
    if (window.screen.width < 1000) {
      return 'vertical';
    } else return 'horizontal';
  }

  verificarDeclaracaoTrabalho() {
    if (!this.projeto?.podeSolicitarAnaliseFinanceira) {
      this.nzNotificationService.warning("Análise Financeira", 'Todas as declarações de trabalho devem estar finalizadas para prosseguir')
    } else if (this.projeto.declaracoesTrabalho.length == 0) {
      this.nzNotificationService.warning("Análise Financeira", 'Crie uma declaração de trabalho para prosseguir')
    } else if ((this.projeto?.orcamentos.filter(o => o.situacaoDt == DeclaracaoTrabalhoSituacao.Finalizada || o.situacao == SituacaoPreProjetoOrcamento.ClassificacaoRealizada)).length != this.projeto?.orcamentos.length) {
      this.nzNotificationService.warning("Análise Financeira", 'Todos os Orçamentos devem estar classificados para prosseguir')
    }
    else {
      this.alterarSituacao(SituacaoPreProjeto.AguardandoAnaliseViabilidadeFinanceira)
    }
  }

  acessarProjetoAprovado() {
    this.router.navigate(['projetos/editar', this.projeto?.projetoId], {
      queryParams: { ano: this.ano.obterAno() },
    });
  }

  arquivar() {
    this.nzModalService.create({
      nzTitle: 'Arquivar Projeto',
      nzContent: SolicitacaoAjustesProjetoComponent,
      nzComponentParams: {
        projeto: this.projeto,
        arquivar: true
      },
      nzMaskClosable: false,
      nzClosable: false,
    })
   
  }
  desarquivar() {
    this.nzModalService.create({
      nzTitle: 'Desarquivar Projeto',
      nzContent: SolicitacaoAjustesProjetoComponent,
      nzComponentParams: {
        projeto: this.projeto,
        arquivar: true
      },
      nzMaskClosable: false,
      nzClosable: false,
    })
  }

  retornarPaginaAnterior() {
    if (
      this.projetoAprovado ||
      this.projetoReprovado ||
      this.projetoArquivado
    ) {
      return this.router.navigate(['/arquivados']);
    } else {
      return this.router.navigate(['/pre-projetos']);
    }
  }
}
