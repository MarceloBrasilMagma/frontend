import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, finalize, catchError } from 'rxjs/operators';
import { AdClient, EquipeProjetoClient, EquipeProjetoCriarCommand, EquipeProjetoFuncao, EquipeProjetoFuncaoClient, EquipeProjetoFuncaoObterTodosQuery, EquipeProjetoFuncaoVm, Participacao, PeriodicidadesClient, PeriodicidadeVm, ProdutosClient, ProdutoVm, ProjetoAlterarCommand, ProjetoExcluirPlanoComunicacaoCommand, ProjetoExcluirRiscoCommand, ProjetoIncluirPlanoComunicacaoCommand, ProjetoIncluirRiscoCommand, ProjetosClient, ProjetoVm, UsuarioAd } from 'web-api-client';

@Component({
  selector: 'app-dados-projeto-form',
  templateUrl: './dados-projeto-form.component.html',
  styleUrls: ['./dados-projeto-form.component.scss']
})
export class DadosProjetoFormComponent implements OnInit, OnChanges, OnDestroy {

  @Input() projeto: ProjetoVm;
  @Output() recarregarProjetoEvent = new EventEmitter<void>();

  @Input() salvarEvent: Subject<void>;

  form: UntypedFormGroup;
  planoForm: UntypedFormGroup;
  riscoForm: UntypedFormGroup;
  equipeForm: UntypedFormGroup

  produtos: ProdutoVm[];
  periodicidades: PeriodicidadeVm[];

  participacao = Participacao

  private searchUsuario$: Subject<string>;
  buscandoUsuarioAd: boolean;
  usuariosAd: UsuarioAd[];

  funcoes: EquipeProjetoFuncaoVm[];

  carregando: boolean = false;

  constructor(
    private projetosClient: ProjetosClient,
    private produtosClient: ProdutosClient,
    private periodicidadesClient: PeriodicidadesClient,
    private nzModalService: NzModalService,
    private nzNotificationService: NzNotificationService,
    private router: Router,
    private adClient: AdClient,
    private equipeProjetoFuncaoClient: EquipeProjetoFuncaoClient,
    private equipeProjetoClient: EquipeProjetoClient
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!this.projeto && !!this.form) {
      this.form.patchValue(this.projeto);
    }
  }

  ngOnDestroy(): void {
    if (!!this.salvarEvent)
      this.salvarEvent.unsubscribe();
  }

  ngOnInit(): void {
    this.initForm();

    this.carregarFuncoes();

    this.produtosClient.obter().subscribe(response => {
      this.produtos = response;
    })
    this.periodicidadesClient.obter().subscribe(response => {
      this.periodicidades = response;
    });

    this.salvarEvent.subscribe(r => this.atualizarProjeto());

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
      planoDeAcao: [null, Validators.required]
    });
    this.equipeForm = new UntypedFormBuilder().group({
      usuario: [null, Validators.required],
      participacao: [null, Validators.required],
      funcao: [null, Validators.required],
    });
  }

  carregarProjeto() {
    this.recarregarProjetoEvent.emit();
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
      this.projetosClient.alterar(new ProjetoAlterarCommand({
        id: this.projeto.id,
        ...this.form.value
      })).subscribe(response => {
        this.nzNotificationService.success("Projeto alterado com sucesso!", "");
        this.carregarProjeto()
      })
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
      this.projetosClient.incluirPlano(new ProjetoIncluirPlanoComunicacaoCommand({
        projetoId: this.projeto.id,
        ...this.planoForm.value
      })).subscribe(response => {
        this.nzNotificationService.success("Plano de comunicação incluso com sucesso!", "");
        this.projeto.planoDeComunicacaoVm.push(response)
        this.planoForm.reset();
      });
    }
  }

  excluirPlano(id) {
    this.projetosClient.excluirPlano(new ProjetoExcluirPlanoComunicacaoCommand({
      id: id
    })).subscribe(response => {
      this.nzNotificationService.success("Plano de comunicação excluído com sucesso!", "");
      this.projeto.planoDeComunicacaoVm = this.projeto.planoDeComunicacaoVm.filter(x => {return x.id !== id})
    })
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
      this.projetosClient.incluirRisco(new ProjetoIncluirRiscoCommand({
        projetoId: this.projeto.id,
        ...this.riscoForm.value
      })).subscribe(response => {
        this.projeto.riscoVm.push(response)
        this.riscoForm.reset();
      });
    }
  }

  excluirRisco(id) {
    this.projetosClient.excluirRisco(new ProjetoExcluirRiscoCommand({
      id: id
    })).subscribe(response => {
      this.nzNotificationService.success("Risco excluído com sucesso!", "");
      this.projeto.riscoVm = this.projeto.riscoVm.filter(x => {return x.id !== id})
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


  carregarFuncoes() {
    let req = EquipeProjetoFuncaoObterTodosQuery.fromJS(
      {
        pageIndex: 1,
        pageSize: 1000,
      }
    )
    this.equipeProjetoFuncaoClient.obter(req).subscribe(r => {
      this.funcoes = r.items
    })
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
        nome: fValue.usuario.nome
      });

      this.carregando = true;
      this.equipeProjetoClient.criar(req)
      .pipe(finalize(() => {
        this.carregando = false;
      }))
      .subscribe(response => {
        console.log(response)
        this.projeto.equipesProjeto.push(response)
        this.equipeForm.reset();
      });
    }
  }

  excluirEquipe(id) {
    this.carregando = true;
    this.equipeProjetoClient.excluir(id)
    .pipe(finalize(() => {
      this.carregando = false;
    }))
    .subscribe(response => {
      this.nzNotificationService.success("Membro da equipe excluído com sucesso!", "");
      this.projeto.equipesProjeto = this.projeto.equipesProjeto.filter(x => {return x.id !== id})
    })
  }
}
