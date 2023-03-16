import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgxPermissionsService } from 'ngx-permissions';
import { Subject, of, EMPTY } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
  catchError,
} from 'rxjs/operators';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import {
  AdClient,
  EquipeProjetoClient,
  EquipeProjetoCriarCommand,
  EquipeProjetoFuncaoClient,
  EquipeProjetoFuncaoObterTodosQuery,
  EquipeProjetoFuncaoVm,
  Participacao,
  PeriodicidadesClient,
  PeriodicidadeVm,
  ProdutosClient,
  ProdutoVm,
  ProjetoAlterarCommand,
  ProjetoAlterarSituacaoCommand,
  ProjetoExcluirPlanoComunicacaoCommand,
  ProjetoExcluirRiscoCommand,
  ProjetoIncluirPlanoComunicacaoCommand,
  ProjetoIncluirRiscoCommand,
  ProjetosClient,
  ProjetoVm,
  SituacaoProjeto,
  StatusProjeto,
  UsuarioAd,
} from 'web-api-client';

@Component({
  selector: 'app-tap',
  templateUrl: './tap.component.html',
  styleUrls: ['./tap.component.scss'],
})
export class TapComponent implements OnInit {
  @Input() projeto: ProjetoVm;
  @Input() possuiPermissaoEditar: boolean;
  @Output() sairDadosProjetoEvent = new EventEmitter<void>();

  form: UntypedFormGroup;
  planoForm: UntypedFormGroup;
  riscoForm: UntypedFormGroup;
  equipeForm: UntypedFormGroup;

  produtos: ProdutoVm[];
  periodicidades: PeriodicidadeVm[];

  participacao = Participacao;

  private searchUsuario$: Subject<string>;
  buscandoUsuarioAd: boolean;
  usuariosAd: UsuarioAd[];

  funcoes: EquipeProjetoFuncaoVm[];

  carregando: boolean = false;

  abaSelecionada = Abas.dados;

  abas = Abas;

  constructor(
    private projetosClient: ProjetosClient,
    private produtosClient: ProdutosClient,
    private periodicidadesClient: PeriodicidadesClient,
    private nzModalService: NzModalService,
    private nzNotificationService: NzNotificationService,
    private router: Router,
    private adClient: AdClient,
    private equipeProjetoFuncaoClient: EquipeProjetoFuncaoClient,
    private equipeProjetoClient: EquipeProjetoClient,
    private ano: YearReferenceService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!!this.projeto && !!this.form) {
      this.form.patchValue(this.projeto);
      if(this.projeto.status !== StatusProjeto.Ativo){
        this.toggleForm(false);
      }
      else{
        this.toggleForm(true);
      }
    }
  }

  ngOnInit(): void {
    this.initForm();

    this.carregarFuncoes();

    this.produtosClient.obter().subscribe((response) => {
      this.produtos = response;
    });
    this.periodicidadesClient.obter().subscribe((response) => {
      this.periodicidades = response;
    });
    this.form.patchValue(this.projeto);

    if(this.projeto.status !== StatusProjeto.Ativo){
      this.toggleForm(false);
    }
    else{
      this.toggleForm(true);
    }

    this.initSubjectSearchUsuario();
  }

  initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null, Validators.required],
      comentarios: [null],
      escopoDoProjeto: [null, Validators.required],
      objetivoDoProjeto: [null, Validators.required],
      premissasDoProjeto: [null, Validators.required],
      restricoesDoProjeto: [null, Validators.required],
      riscosDoProjeto: [null, Validators.required],
    });
    this.planoForm = new UntypedFormBuilder().group({
      conteudo: [null, Validators.required],
      publico: [null, Validators.required],
      produtoId: [null, Validators.required],
      periodicidadeId: [null, Validators.required],
    });
    this.riscoForm = new UntypedFormBuilder().group({
      descricao: [null, Validators.required],
      impacto: [null, Validators.required],
      probabilidade: [null, Validators.required],
      planoDeAcao: [null, Validators.required],
    });
    this.equipeForm = new UntypedFormBuilder().group({
      usuario: [null, Validators.required],
      participacao: [null, Validators.required],
      funcao: [null, Validators.required],
    });
  }

  carregarProjeto() {
    let anoReferencia: number = this.ano.obterAno()
    this.projetosClient.obterPorId(this.projeto.id, anoReferencia).subscribe((r) => {
      this.projeto = r;
      this.form.patchValue(this.projeto);

      if(this.projeto.status !== StatusProjeto.Ativo){
        this.toggleForm(false);
      }
      else{
        this.toggleForm(true);
      }
    });
  }

  atualizarProjeto() {
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
      this.projetosClient
        .alterar(
          new ProjetoAlterarCommand({
            id: this.projeto.id,
            ...this.form.value,
          })
        )
        .subscribe((response) => {
          this.nzNotificationService.success(
            'Projeto alterado com sucesso!',
            ''
          );
          this.form.reset();
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate(['projetos/editar', this.projeto.id], { queryParams: { ano: this.ano.obterAno() }});
            });
        });
    }
  }

  situacaoProjeto() {
    if (this.projeto.situacao == SituacaoProjeto.ProjetoAberto) {
      return 'Enviar Aprovação TAP';
    } else if (
      this.projeto.situacao == SituacaoProjeto.AguardandoAprovacaoTap
    ) {
      return 'Aprovar TAP';
    } else {
      return 'Sair';
    }
  }

  incluirPlano() {
    if (this.planoForm.invalid) {
      for (const key in this.planoForm.controls) {
        this.planoForm.controls[key].markAsDirty();
        this.planoForm.controls[key].updateValueAndValidity();
      }
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente os campos obrigatórios!',
      });
    } else {
      this.projetosClient
        .incluirPlano(
          new ProjetoIncluirPlanoComunicacaoCommand({
            projetoId: this.projeto.id,
            ...this.planoForm.value,
          })
        )
        .subscribe((response) => {
          this.nzNotificationService.success(
            'Plano de comunicação incluso com sucesso!',
            ''
          );
          this.projeto.planoDeComunicacaoVm.push(response);
          this.planoForm.reset();
        });
    }
  }

  excluirPlano(id: number) {
    this.projetosClient
      .excluirPlano(
        new ProjetoExcluirPlanoComunicacaoCommand({
          id: id,
        })
      )
      .subscribe((response) => {
        this.nzNotificationService.success(
          'Plano de comunicação excluído com sucesso!',
          ''
        );
        this.projeto.planoDeComunicacaoVm =
          this.projeto.planoDeComunicacaoVm.filter((x) => {
            return x.id !== id;
          });
      });
  }

  incluirRisco() {
    if (this.riscoForm.invalid) {
      for (const key in this.riscoForm.controls) {
        this.riscoForm.controls[key].markAsDirty();
        this.riscoForm.controls[key].updateValueAndValidity();
      }
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente os campos obrigatórios!',
      });
    } else {
      this.projetosClient
        .incluirRisco(
          new ProjetoIncluirRiscoCommand({
            projetoId: this.projeto.id,
            ...this.riscoForm.value,
          })
        )
        .subscribe((response) => {
          this.projeto.riscoVm.push(response);
          this.riscoForm.reset();
        });
    }
  }

  excluirRisco(id) {
    this.projetosClient
      .excluirRisco(
        new ProjetoExcluirRiscoCommand({
          id: id,
        })
      )
      .subscribe((response) => {
        this.nzNotificationService.success('Risco excluído com sucesso!', '');
        this.projeto.riscoVm = this.projeto.riscoVm.filter((x) => {
          return x.id !== id;
        });
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

  carregarFuncoes() {
    let req = EquipeProjetoFuncaoObterTodosQuery.fromJS({
      pageIndex: 1,
      pageSize: 1000,
    });
    this.equipeProjetoFuncaoClient.obter(req).subscribe((r) => {
      this.funcoes = r.items;
    });
  }

  incluirEquipe() {
    if (this.equipeForm.invalid) {
      for (const key in this.equipeForm.controls) {
        this.equipeForm.controls[key].markAsDirty();
        this.equipeForm.controls[key].updateValueAndValidity();
      }
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente os campos obrigatórios!',
      });
    } else {
      let fValue = this.equipeForm.value;

      let req = EquipeProjetoCriarCommand.fromJS({
        projetoId: this.projeto.id,
        participacao: fValue.participacao,
        funcaoId: fValue.funcao,
        login: fValue.usuario.login,
        nome: fValue.usuario.nome,
      });

      this.carregando = true;
      this.equipeProjetoClient
        .criar(req)
        .pipe(
          finalize(() => {
            this.carregando = false;
          })
        )
        .subscribe((response) => {
          console.log(response);
          this.projeto.equipesProjeto.push(response);
          this.equipeForm.reset();
        });
    }
  }

  excluirEquipe(id: number) {
    this.carregando = true;
    this.equipeProjetoClient
      .excluir(id)
      .pipe(
        finalize(() => {
          this.carregando = false;
        })
      )
      .subscribe((response) => {
        this.nzNotificationService.success(
          'Membro da equipe excluído com sucesso!',
          ''
        );
        this.projeto.equipesProjeto = this.projeto.equipesProjeto.filter(
          (x) => {
            return x.id !== id;
          }
        );
      });
  }

  selecionarAba(e) {
    //debugger
    this.abaSelecionada = e.index;
  }

  onIndexChange(index: number): void {
    if (this.abaSelecionada == Abas.dados) {
      if (this.form.dirty) {
        this.nzModalService.confirm({
          nzTitle: 'Deseja salvar as alterações?',
          nzContent: '',
          nzOnOk: () => this.atualizarProjeto(),
        });
      }
    }
    this.abaSelecionada = index;
  }

  toggleForm(habilitar: boolean){
    if(habilitar){
      this.form.enable();
      this.planoForm.enable();
      this.riscoForm.enable();
      this.equipeForm.enable();
    }
    else{
      this.form.disable();
      this.planoForm.disable();
      this.riscoForm.disable();
      this.equipeForm.disable();
    }
  }

  get textoInicial(): string {
    switch (this.abaSelecionada) {
      case Abas.dados:
        return 'Dados do Projeto';
      case Abas.riscos:
        return 'Riscos do Projeto';
      case Abas.comunicacao:
        return 'Plano de Comunicação';
      case Abas.equipe:
        return 'Equipe do Projeto';
    }
  }

  get desabilitaBotoes(){
    return this.projeto?.status !== StatusProjeto.Ativo;
  }

}

enum Abas {
  dados = 0,
  riscos = 1,
  comunicacao = 2,
  equipe = 3,
}
