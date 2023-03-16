import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzCollapsePanelComponent } from 'ng-zorro-antd/collapse';
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
import { ModalConfirmacaoComponent } from 'src/app/shared/components/modal-confirmacao/modal-confirmacao.component';
import {
  AdClient,
  AreaEnvolvidaVm,
  CestasClient,
  CestaVm,
  DepartamentosClient,
  DepartamentoVm,
  ObjetivoEstrategicoPreProjetoVm,
  ObjetivoEstrategicoVm,
  ObjetivosEstrategicosClient,
  OrigemPreProjeto,
  PreProjetoCriarCommand,
  PreProjetosClient,
  StakeholdersClient,
  StakeholderVm,
  UsuarioAd,
  ZonaRisco,
} from 'web-api-client';

@Component({
  templateUrl: './preprojeto-cadastrar.component.html',
  styleUrls: ['./preprojeto-cadastrar.component.scss'],
})
export class PreProjetoCadastrarComponent implements OnInit {
  @ViewChildren(NzCollapsePanelComponent)
  collapsePanelComponents: QueryList<NzCollapsePanelComponent>;

  form: UntypedFormGroup;

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

  cadastrandoProjeto: boolean;

  pontuacaoWorkshop: number;

  addAreaEnvolvidaInput: string;
  addObjetivoEstrategicoInput: string;

  cestas: CestaVm[];

  OrigemPreProjeto = OrigemPreProjeto;

  constructor(
    private router: Router,
    private nzModalService: NzModalService,
    private nzNotificationService: NzNotificationService,
    private adClient: AdClient,
    private PreProjetosClient: PreProjetosClient,
    private stakeholdersClient: StakeholdersClient,
    private departamentosClient: DepartamentosClient,
    private cestasClient: CestasClient,
    private objetivosClient: ObjetivosEstrategicosClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.obterStakeholders();
    this.obterDepartamentos();
    this.obterObjetivos();
    this.initSubjectSearchGerenteProjeto();
    this.initSubjectSearchGerenteNegocio();
    this.initSubjectSearchSponsorProjeto();
    this.obterCestas();
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      nome: [null, Validators.required],
      departamentoId: [null, Validators.required],
      gerenteProjeto: [null, Validators.required],
      gerenteNegocio: [null, Validators.required],
      sponsorProjeto: [null, Validators.required],
      pontuacaoWorkshop: [null],
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
      cestaId: [null],
      objetivosEstrategicos: [null],
      origem: [null, Validators.required],
    });
  }

  obterCestas() {
    this.cestasClient.obter(-1, 0).subscribe((res) => {
      this.cestas = res.items;
    });
  }

  private obterDepartamentos() {
    this.departamentosClient.obter().subscribe((r) => {
      this.departamentos = r;
    });
  }

  private obterObjetivos() {
    this.objetivosClient.obter().subscribe((r) => {
      this.objetivos = r;
    });
  }

  private obterStakeholders() {
    this.stakeholdersClient.obter().subscribe((r) => {
      this.stakeholders = r;
    });
  }

  exibirModalConfirmacao() {
    const modal = this.nzModalService.create({
      nzContent: ModalConfirmacaoComponent,
      nzTitle: 'Confirmação',
      nzComponentParams: {
        mensagem: 'Deseja enviar para PMO?',
        textoOk: 'Sim',
        textoCancelar: 'Não, somente salvar',
        corCancelar: 'goldenrod',
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.subscribe((r) => {
      this.cadastrar(r);
    });
  }

  cadastrar(enviarPmo: boolean) {
    if (this.exibirPontuacaoWorkshop) {
      this.form.controls['pontuacaoWorkshop'].setValidators(
        Validators.required
      );
      this.form.get('pontuacaoWorkshop').updateValueAndValidity();
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
      if (this.form.controls['nome'].invalid) {
        this.nzModalService.warning({
          nzTitle: 'Atenção',
          nzContent:
            'Verifique o formulário e preencha corretamente o campo obrigatório!',
        });
        this.form.controls['nome'].markAsDirty();
        this.form.controls['nome'].updateValueAndValidity();
        this.expandAll();
        return;
      }
    }
    this.cadastrarProjeto(enviarPmo);
  }

  private cadastrarProjeto(enviarPmo: boolean) {
    const fValue = this.form.value;
    const req = PreProjetoCriarCommand.fromJS(fValue);
    req.enviarPmo = enviarPmo;
    req.loginGerenteProjeto = fValue.gerenteProjeto?.login;
    req.nomeGerenteProjeto = fValue.gerenteProjeto?.nome;

    req.loginGerenteNegocio = fValue.gerenteNegocio?.login;
    req.nomeGerenteNegocio = fValue.gerenteNegocio?.nome;

    req.loginSponsor = fValue.sponsorProjeto?.login;
    req.nomeSponsor = fValue.sponsorProjeto?.nome;

    req.areasEnvolvidas = this.areasEnvolvidas?.map((a) => a.departamentoId);

    req.objetivosEstrategicos = this.objetivosPreProjeto?.map((a) => a.id);

    this.cadastrandoProjeto = true;
    this.PreProjetosClient.criar(req)
      .pipe(
        finalize(() => {
          this.cadastrandoProjeto = false;
        })
      )
      .subscribe(
        (r) => {
          this.nzNotificationService.success(
            'Iniciativa cadastrada com sucesso!',
            ''
          );
          this.router.navigate(['pre-projetos', 'editar', r.id]);
        },
        (error) => console.log(error)
      );
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

  get areasEnvolvidas(): AreaEnvolvidaVm[] {
    return [...(this.form.controls.areasEnvolvidas.value || [])];
  }

  private workshopSelecionado() {
    if (this.form?.value['origem'] === OrigemPreProjeto.Workshop) {
      return [null, Validators.required];
    } else return [null];
  }

  get exibirPontuacaoWorkshop() {
    return this.form?.value['origem'] === OrigemPreProjeto.Workshop;
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
}
