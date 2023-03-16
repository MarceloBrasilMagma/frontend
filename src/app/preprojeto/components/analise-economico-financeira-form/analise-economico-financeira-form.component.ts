import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { AdClient, AnaliseEconomicoFinanceiraAlterarCommand, AnaliseEconomicoFinanceiraAnexoDto, AnaliseEconomicoFinanceiraClient, AnaliseEconomicoFinanceiraCriarCommand, DepartamentosClient, DepartamentoVm, PreProjetosClient, PreProjetoVm, SituacaoPreProjeto, UsuarioAd } from 'web-api-client';

@Component({
  selector: 'app-analise-economico-financeira-form',
  templateUrl: './analise-economico-financeira-form.component.html',
  styleUrls: ['./analise-economico-financeira-form.component.scss'],
})
export class AnaliseEconomicoFinanceiraFormComponent implements OnInit {
  @Input() projeto: PreProjetoVm;

  departamentos: DepartamentoVm[];

  form: UntypedFormGroup;

  analiseEconomicoFinanceiraAplicavel: boolean;

  private searchRepresentante$: Subject<string>;
  buscandoRepresentanteAd: boolean;
  representantesAd: UsuarioAd[];

  anexosCadastro: AnaliseEconomicoFinanceiraAnexoDto[];

  @Input() salvarEvent: Subject<void>;

  constructor(
    private departamentosClient: DepartamentosClient,
    private adClient: AdClient,
    private analiseEconomicoFinanceiraClient: AnaliseEconomicoFinanceiraClient,
    private nzNotificationService: NzNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.obterDepartamentos();
    this.initSubjectSearchRepresentante();

    if (!!this.projeto.analiseEconomicoFinanceira) {
      this.analiseEconomicoFinanceiraAplicavel =
        this.projeto.analiseEconomicoFinanceira.analiseEconomicoFinanceiraAplicavel;

      this.form.patchValue(this.projeto.analiseEconomicoFinanceira);
      this.form.patchValue({
        data: moment(
          this.projeto.analiseEconomicoFinanceira.data
        ).format('YYYY-MM-DD'),
      });

      let representanteControladoria = <UsuarioAd>{
        login:
          this.projeto.analiseEconomicoFinanceira
            .loginRepresentanteControladoria,
        nome: this.projeto.analiseEconomicoFinanceira
          .nomeRepresentanteControladoria,
      };
      this.representantesAd = [representanteControladoria];
      this.form.patchValue({ representanteControladoria });
    }

    this.salvarEvent.subscribe(r => this.salvar());
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      analiseEconomicoFinanceiraAplicavel: [null, Validators.required],
      retornoFinanceiroPositivo: [null],
      parecer: [null, Validators.required],

      departamentoId: [null, Validators.required],
      representanteControladoria: [null, Validators.required],
      data: [null, Validators.required],
    });
  }

  private initSubjectSearchRepresentante() {
    this.searchRepresentante$ = new Subject<string>();
    this.searchRepresentante$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 4) {
            return of([]);
          }
          this.buscandoRepresentanteAd = true;
          return this.adClient.obterUsuarioPorNome(value).pipe(
            finalize(() => {
              this.buscandoRepresentanteAd = false;
            }),
            catchError((err) => {
              return EMPTY;
            })
          );
        })
      )
      .subscribe((r) => {
        this.representantesAd = r;
      });
  }

  searchRepresentante(value: string): void {
    this.searchRepresentante$.next(value);
  }

  private obterDepartamentos() {
    this.departamentosClient.obter().subscribe((r) => { this.departamentos = r; });
  }

  get exibirEnviar(): boolean {
    return this.projeto.situacao == SituacaoPreProjeto.AguardandoAnaliseViabilidadeFinanceira
  }
  salvar() {
    !!this.projeto.analiseEconomicoFinanceira ? this.alterar() : this.criar();
  }

  criar() {
    const fValue = this.form.value;
    const req = AnaliseEconomicoFinanceiraCriarCommand.fromJS(fValue);
    
    req.projetoId = this.projeto.id;
    req.nomeRepresentanteControladoria = fValue.representanteControladoria.nome;
    req.loginRepresentanteControladoria = fValue.representanteControladoria.login;
    req.anexos = this.anexosCadastro;

    this.analiseEconomicoFinanceiraClient.criar(req).subscribe((r) => {
      this.projeto.analiseEconomicoFinanceira = r;
      this.nzNotificationService.success(
        'Análise econômico-financeira salva com sucesso!',
        ''
      );
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate(['pre-projetos','editar', this.projeto.id]));
      
    });
  }

  alterar() {
    const fValue = this.form.value;
    const req = AnaliseEconomicoFinanceiraAlterarCommand.fromJS(fValue);
    req.id = this.projeto.analiseEconomicoFinanceira.id;
    req.nomeRepresentanteControladoria = fValue.representanteControladoria.nome;
    req.loginRepresentanteControladoria =
      fValue.representanteControladoria.login;

    this.analiseEconomicoFinanceiraClient.alterar(req).subscribe((r) => {
      this.projeto.analiseEconomicoFinanceira = r;
      this.nzNotificationService.success(
        'Análise economico-financeira salva com sucesso!',
        ''
      );
      this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate(['pre-projetos','editar', this.projeto.id]));
    });
  }
}
