import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgxPermissionsService } from 'ngx-permissions';
import { Subscription } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { ProjetoPlurianualOrcamentoVm, ProjetosPlurianuaisClient, DeclaracoesTrabalhoClient, DeclaracaoTrabalhoOrcamentoAlterarCommand, DeclaracaoTrabalhoSituacao, ProjetoPlurianualOrcamentoCriarCommand, ProjetoPlurianualOrcamentoAlterarCommand, SituacaoProjetoPlurianualOrcamento, ProjetoPlurianualOrcamentoAlterarSituacaoCommand } from 'web-api-client';

@Component({
  selector: 'app-orcamento-projeto-plurianual-form-modal',
  templateUrl: './orcamento-projeto-plurianual-form-modal.component.html',
  styleUrls: ['./orcamento-projeto-plurianual-form-modal.component.scss']
})
export class OrcamentoProjetoPlurianualFormModalComponent implements OnInit {
  @Input() projetoId: number;
  @Input() orcamento: ProjetoPlurianualOrcamentoVm;
  @Input() declaracaoSituacao: DeclaracaoTrabalhoSituacao;

  SituacaoPreProjetoOrcamento = SituacaoProjetoPlurianualOrcamento;

  form: UntypedFormGroup;
  saving: boolean;

  total: number = 0;
  totalObservacoes: number = 0;

  valorAnteriorValido = false;
  valorValido = false;

  formSubscription: Subscription;

  constructor(
    private nzModalRef: NzModalRef,
    private nzNotificationService: NzNotificationService,
    private projetosPlurianuaisClient: ProjetosPlurianuaisClient,
    private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient,
    private authenticationService: AuthenticationService,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.onChanges();
    if (this.orcamento) {
      this.form.patchValue({
        ...this.orcamento,

        valorDespesaAdministrativaObservacao:
          this.orcamento.valorDespesaAdministrativaObservacao !== null
            ? this.orcamento.valorDespesaAdministrativaObservacao
            : this.orcamento.valorDespesaAdministrativa,
        valorCustoAssistencialObservacao:
          this.orcamento.valorCustoAssistencialObservacao !== null
            ? this.orcamento.valorCustoAssistencialObservacao
            : this.orcamento.valorCustoAssistencial,
        valorInvestimentoObservacao:
          this.orcamento.valorInvestimentoObservacao !== null
            ? this.orcamento.valorInvestimentoObservacao
            : this.orcamento.valorInvestimento,
        observacao: this.orcamento.observacao,
      });
    }

    console.log(this.orcamento);
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      descricao: [null, Validators.required],
      valorDespesaAdministrativa: [0, Validators.required],
      valorCustoAssistencial: [0, Validators.required],
      valorInvestimento: [0, Validators.required],
      observacao: [null],
      valorDespesaAdministrativaObservacao: [null],
      valorCustoAssistencialObservacao: [null],
      valorInvestimentoObservacao: [null],
    });
  }

  salvar(situacao?: SituacaoProjetoPlurianualOrcamento) {
    this.orcamento ? this.atualizar(situacao) : this.cadastrar(situacao);
  }

  private cadastrar(situacao?: SituacaoProjetoPlurianualOrcamento) {
    this.saving = true;
    this.projetosPlurianuaisClient
      .incluirOrcamento(
        ProjetoPlurianualOrcamentoCriarCommand.fromJS({
          ...this.form.value,
          projetoPlurianualId: this.projetoId,
        })
      )
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe((r) => {
        if (situacao) {
          this.projetosPlurianuaisClient
            .alterarSituacaoOcamento(<ProjetoPlurianualOrcamentoAlterarSituacaoCommand>{
              id: r.id,
              situacao: situacao,
            })
            .subscribe((res) => {
              this.nzNotificationService.success(
                'Orçamento cadastrado com sucesso!',
                ''
              );
              this.orcamento = res;
              this.destroyModal({ ocorreuAlteracao: true });
            });
        } else {
          this.nzNotificationService.success(
            'Orçamento cadastrado com sucesso!',
            ''
          );
          this.destroyModal({ ocorreuAlteracao: true });
        }
      });
  }

  private atualizar(situacao?: SituacaoProjetoPlurianualOrcamento) {
    this.saving = true;

    if (!this.orcamento.declaracaoTrabalhoId) {
      this.projetosPlurianuaisClient
        .alterarOcamento(
          ProjetoPlurianualOrcamentoAlterarCommand.fromJS({
            ...this.form.value,
            projetoPlurianualId: this.projetoId,
          })
        )
        .pipe(
          finalize(() => {
            this.saving = false;
          })
        )
        .subscribe((r) => {
          if (!situacao) {
            this.nzNotificationService.success(
              'Orçamento salvo com sucesso!',
              ''
            );
            this.destroyModal({ ocorreuAlteracao: true });
          } else {
            this.projetosPlurianuaisClient
              .alterarSituacaoOcamento(<ProjetoPlurianualOrcamentoAlterarSituacaoCommand>{
                id: this.orcamento.id,
                situacao: situacao,
              })
              .subscribe((res) => {
                this.nzNotificationService.success(
                  'Orçamento salvo com sucesso!',
                  ''
                );
                this.orcamento = res;
                this.destroyModal({ ocorreuAlteracao: true });
              });
          }
        });
    } else {
      this.declaracoesTrabalhoClient
        .alterarOcamento(
          this.orcamento.declaracaoTrabalhoId as any,
          this.orcamento.id as any,
          DeclaracaoTrabalhoOrcamentoAlterarCommand.fromJS({
            ...this.form.value,
            declaracaoTrabalhoId: this.orcamento.declaracaoTrabalhoId,
          })
        )
        .pipe(
          finalize(() => {
            this.saving = false;
          })
        )
        .subscribe((r) => {
          this.nzNotificationService.success(
            'Orçamento salvo com sucesso!',
            ''
          );
          this.destroyModal({ ocorreuAlteracao: true });
        });
    }
  }

  destroyModal(result?: { ocorreuAlteracao: boolean }): void {
    this.formSubscription.unsubscribe();
    this.nzModalRef.destroy(result);
  }

  onChanges(): void {
    this.formSubscription = this.form.valueChanges
      .pipe(debounceTime(900))
      .subscribe((val) => {
        let valorDespesaAdministrativa = 0 | val['valorDespesaAdministrativa'];
        let valorCustoAssistencial = 0 | val['valorCustoAssistencial'];
        let valorInvestimento = 0 | val['valorInvestimento'];
        this.total =
          valorDespesaAdministrativa +
          valorCustoAssistencial +
          valorInvestimento;

        valorDespesaAdministrativa =
          0 | val['valorDespesaAdministrativaObservacao'];
        valorCustoAssistencial = 0 | val['valorCustoAssistencialObservacao'];
        valorInvestimento = 0 | val['valorInvestimentoObservacao'];
        this.totalObservacoes =
          valorDespesaAdministrativa +
          valorCustoAssistencial +
          valorInvestimento;

        if (
          this.orcamento?.situacao ==
          SituacaoProjetoPlurianualOrcamento.AguardandoClassificacao
        ) {
          this.valorAnteriorValido = this.valorValido;
          this.valorValido = this.totalObservacoes == this.total;

          if (
            !this.valorValido &&
            this.valorValido != this.valorAnteriorValido
          ) {
            this.nzNotificationService.warning(
              'Valor total do ajuste diferente do original',
              ''
            );
          }
        }
      });
  }

  get exibirObservacoes(): boolean {
    return (
      this.orcamento?.situacao ===
      SituacaoProjetoPlurianualOrcamento.AguardandoClassificacao ||
      this.orcamento?.situacao ===
      SituacaoProjetoPlurianualOrcamento.ClassificacaoRealizada
    );
  }
  get editarObservacoes(): boolean {
    return (
      this.orcamento?.situacao ===
      SituacaoProjetoPlurianualOrcamento.AguardandoClassificacao
    );
  }

  transferirAdministrativo(origem: string) {
    if (origem === 'Assistencial') {
      let valor =
        <number>this.form.value['valorCustoAssistencialObservacao'] +
        <number>this.form.value['valorDespesaAdministrativaObservacao'];

      this.form.patchValue({
        valorDespesaAdministrativaObservacao: 0,
        valorCustoAssistencialObservacao: valor,
      });
    }
    if (origem === 'Investimento') {
      let valor =
        ((<number>this.form.value['valorInvestimentoObservacao']) || 0) +
        ((<number>this.form.value['valorDespesaAdministrativaObservacao']) || 0);

      this.form.patchValue({
        valorDespesaAdministrativaObservacao: 0,
        valorInvestimentoObservacao: valor,
      });
    }
  }

  transferirAssistencial(origem: string) {
    if (origem === 'Administrativo') {
      let valor =
        <number>this.form.value['valorDespesaAdministrativaObservacao'] +
        <number>this.form.value['valorCustoAssistencialObservacao'];

      this.form.patchValue({
        valorCustoAssistencialObservacao: 0,
        valorDespesaAdministrativaObservacao: valor,
      });
    }
    if (origem === 'Investimento') {
      let valor =
        <number>this.form.value['valorInvestimentoObservacao'] +
        <number>this.form.value['valorCustoAssistencialObservacao'];

      this.form.patchValue({
        valorCustoAssistencialObservacao: 0,
        valorInvestimentoObservacao: valor,
      });
    }
  }

  transferirInvestimento(origem: string) {
    if (origem === 'Administrativo') {
      let valor =
        <number>this.form.value['valorCustoAssistencialObservacao'] +
        <number>this.form.value['valorInvestimentoObservacao'];

      this.form.patchValue({
        valorInvestimentoObservacao: 0,
        valorCustoAssistencialObservacao: valor,
      });
    }
    if (origem === 'Assistencial') {
      let valor =
        <number>this.form.value['valorDespesaAdministrativaObservacao'] +
        <number>this.form.value['valorInvestimentoObservacao'];

      this.form.patchValue({
        valorInvestimentoObservacao: 0,
        valorDespesaAdministrativaObservacao: valor,
      });
    }
  }

  get exibirEnviarClassificacao(): boolean {
    return (
      !this.orcamento ||
      this.orcamento.situacao === SituacaoProjetoPlurianualOrcamento.EmElaboracao
    );
  }

  possuiPermissaoEditar(permissoes: string[]): boolean {
    if (!this.orcamento) return false;

    var login = this.authenticationService.loginUsuarioLogado;

    if (login == null) return false;

    var possuiPermissao = false;

    if (permissoes == null) possuiPermissao;

    var permissions = this.permissionsService.getPermissions();

    permissoes.forEach((element) => {
      if (element in permissions || 'Administrador' in permissions) {
        possuiPermissao = true;
        return;
      }
    });

    return possuiPermissao;
  }

  get exibirConcluirClassificacao(): boolean {
    return (
      this.possuiPermissaoEditar([
        'Administador',
        'Projeto.ClassificacaoContabil',
      ]) &&
      this.orcamento?.situacao ===
      SituacaoProjetoPlurianualOrcamento.AguardandoClassificacao
    );
  }
}
