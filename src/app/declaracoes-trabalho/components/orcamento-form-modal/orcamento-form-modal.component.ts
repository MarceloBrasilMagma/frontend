import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import {
  DeclaracaoTrabalhoOrcamentoAlterarCommand,
  DeclaracaoTrabalhoOrcamentoCriarCommand,
  DeclaracaoTrabalhoOrcamentoVm,
  DeclaracaoTrabalhoSituacao,
  DeclaracoesTrabalhoClient,
} from 'web-api-client';

@Component({
  selector: 'app-orcamento-dt',
  templateUrl: './orcamento-form-modal.component.html',
  styleUrls: ['./orcamento-form-modal.component.scss'],
})

export class OrcamentoFormModalComponent implements OnInit {
  @Input() declaracaoTrabalhoId: number;
  @Input() orcamento: DeclaracaoTrabalhoOrcamentoVm;
  @Input() declaracaoSituacao: DeclaracaoTrabalhoSituacao;

  form: UntypedFormGroup;
  saving: boolean;

  total: number = 0;
  totalObservacoes: number = 0;

  formSubscription: Subscription;

  valorAnteriorValido = false;
  valorValido = false;

  constructor(
    private nzModalRef: NzModalRef,
    private nzNotificationService: NzNotificationService,
    private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (this.orcamento) {


      this.declaracoesTrabalhoClient.obterOrcamento(this.orcamento.id).subscribe(r => {
        this.orcamento = r;
        this.form.patchValue({
          ...r,
          valorDespesaAdministrativaObservacao: this.orcamento.valorDespesaAdministrativaObservacao !== null ? this.orcamento.valorDespesaAdministrativaObservacao : this.orcamento.valorDespesaAdministrativa,
          valorCustoAssistencialObservacao: this.orcamento.valorCustoAssistencialObservacao !== null ? this.orcamento.valorCustoAssistencialObservacao : this.orcamento.valorCustoAssistencial,
          valorInvestimentoObservacao: this.orcamento.valorInvestimentoObservacao !== null ? this.orcamento.valorInvestimentoObservacao : this.orcamento.valorInvestimento,
          observacao: this.orcamento.observacao
        });
      })

      this.total = this.orcamento.valorCustoAssistencial + this.orcamento.valorDespesaAdministrativa + this.orcamento.valorInvestimento;
      this.totalObservacoes = this.total;
    }
    this.onChanges();
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

  onChanges(): void {
    this.formSubscription = this.form.valueChanges.pipe(
      debounceTime(900)).subscribe(val => {

        let valorDespesaAdministrativa = val["valorDespesaAdministrativa"] || 0;
        let valorCustoAssistencial = val["valorCustoAssistencial"] || 0;
        let valorInvestimento = val["valorInvestimento"] || 0;

        this.total = valorDespesaAdministrativa + valorCustoAssistencial + valorInvestimento

        valorDespesaAdministrativa = val["valorDespesaAdministrativaObservacao"] || 0;
        valorCustoAssistencial = val["valorCustoAssistencialObservacao"] || 0;
        valorInvestimento = val["valorInvestimentoObservacao"] || 0;
        this.totalObservacoes = valorDespesaAdministrativa + valorCustoAssistencial + valorInvestimento

        if (this.declaracaoSituacao == DeclaracaoTrabalhoSituacao.AguardandoClassificacao) {
          this.valorAnteriorValido = this.valorValido;
          this.valorValido = this.totalObservacoes == this.total

          if (!this.valorValido && this.valorValido != this.valorAnteriorValido) {
            this.nzNotificationService.warning("Valor total do ajuste diferente do original", "");
          }
        }
      });
  }


  transferirAdministrativo(origem: string) {
    if (origem === "Assistencial") {
      let valor = (<number>this.form.value["valorCustoAssistencialObservacao"]) +
        (<number>this.form.value["valorDespesaAdministrativaObservacao"]);

      this.form.patchValue({
        valorDespesaAdministrativaObservacao: 0,
        valorCustoAssistencialObservacao: valor
      })
    }
    if (origem === "Investimento") {
      let valor = (<number>this.form.value["valorInvestimentoObservacao"] || 0) +
        (<number>this.form.value["valorDespesaAdministrativaObservacao"] || 0);

      this.form.patchValue({
        valorDespesaAdministrativaObservacao: 0,
        valorInvestimentoObservacao: valor
      })
    }
  }

  transferirAssistencial(origem: string) {
    if (origem === "Administrativo") {
      let valor = (<number>this.form.value["valorDespesaAdministrativaObservacao"]) +
        (<number>this.form.value["valorCustoAssistencialObservacao"]);

      this.form.patchValue({
        valorCustoAssistencialObservacao: 0,
        valorDespesaAdministrativaObservacao: valor
      })
    }
    if (origem === "Investimento") {
      let valor = (<number>this.form.value["valorInvestimentoObservacao"]) +
        (<number>this.form.value["valorCustoAssistencialObservacao"]);

      this.form.patchValue({
        valorCustoAssistencialObservacao: 0,
        valorInvestimentoObservacao: valor
      })
    }
  }

  transferirInvestimento(origem: string) {
    if (origem === "Administrativo") {
      let valor = (<number>this.form.value["valorCustoAssistencialObservacao"]) +
        (<number>this.form.value["valorInvestimentoObservacao"]);

      this.form.patchValue({
        valorInvestimentoObservacao: 0,
        valorCustoAssistencialObservacao: valor
      })
    }
    if (origem === "Assistencial") {
      let valor = (<number>this.form.value["valorDespesaAdministrativaObservacao"]) +
        (<number>this.form.value["valorInvestimentoObservacao"]);

      this.form.patchValue({
        valorInvestimentoObservacao: 0,
        valorDespesaAdministrativaObservacao: valor
      })
    }
  }
  get exibirObservacoes(): boolean {
    return this.declaracaoSituacao === DeclaracaoTrabalhoSituacao.AguardandoClassificacao ||
      this.declaracaoSituacao === DeclaracaoTrabalhoSituacao.ClassificacaoRealizada ||
      this.declaracaoSituacao === DeclaracaoTrabalhoSituacao.Cancelada ||
      this.declaracaoSituacao === DeclaracaoTrabalhoSituacao.Finalizada
  }

  get editarObservacoes(): boolean {
    return this.declaracaoSituacao === DeclaracaoTrabalhoSituacao.AguardandoClassificacao
  }
  salvar() {
    this.orcamento ? this.atualizar() : this.cadastrar();
  }

  private cadastrar() {
    this.saving = true;
    this.declaracoesTrabalhoClient
      .incluirOrcamento(
        this.declaracaoTrabalhoId as any,
        DeclaracaoTrabalhoOrcamentoCriarCommand.fromJS({
          ...this.form.value,
          declaracaoTrabalhoId: this.declaracaoTrabalhoId,
        })
      )
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe((r) => {
        this.nzNotificationService.success(
          'Orçamento cadastrado com sucesso!',
          ''
        );
        this.destroyModal({ ocorreuAlteracao: true });
      });
  }

  private atualizar() {
    this.saving = true;
    this.declaracoesTrabalhoClient
      .alterarOcamento(
        this.declaracaoTrabalhoId as any,
        this.orcamento.id as any,
        DeclaracaoTrabalhoOrcamentoAlterarCommand.fromJS({
          ...this.form.value,
          declaracaoTrabalhoId: this.declaracaoTrabalhoId,
        })
      )
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe((r) => {
        this.nzNotificationService.success('Orçamento salvo com sucesso!', '');
        this.destroyModal({ ocorreuAlteracao: true });
      });
  }

  destroyModal(result?: { ocorreuAlteracao: boolean }): void {
    this.formSubscription.unsubscribe();
    this.nzModalRef.destroy(result);
  }

  get salvarInvalid(): boolean {
    return (!!this.orcamento && this.totalObservacoes != this.total && this.declaracaoSituacao != DeclaracaoTrabalhoSituacao.AguardandoFornecedor)
  }
}
