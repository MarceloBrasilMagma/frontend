import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgxPermissionsService } from 'ngx-permissions';
import { Subscription } from 'rxjs';
import { finalize, debounceTime } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { PreProjetosClient, PreProjetoOrcamentoVm, DeclaracaoTrabalhoSituacao, SituacaoPreProjetoOrcamento, DeclaracoesTrabalhoClient, PreProjetoOrcamentoCriarCommand, PreProjetoOrcamentoAlterarSituacaoCommand, PreProjetoOrcamentoAlterarCommand, DeclaracaoTrabalhoOrcamentoAlterarCommand } from 'web-api-client';

@Component({
  selector: 'app-ressalva-preprojeto-form',
  templateUrl: './ressalva-preprojeto-form.component.html',
  styleUrls: ['./ressalva-preprojeto-form.component.scss']
})
export class RessalvaPreprojetoFormComponent implements OnInit {
  @Input() projetoId: number;
  @Input() orcamento: PreProjetoOrcamentoVm;

  form: UntypedFormGroup;
  saving: boolean;

  total: number = 0;
  totalRessalva: number = 0;

  formSubscription: Subscription;

  constructor(
    private nzModalRef: NzModalRef,
    private nzNotificationService: NzNotificationService,
    private PreProjetosClient: PreProjetosClient,
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

        valorDespesaAdministrativa:
          this.orcamento.valorDespesaAdministrativaObservacao !== null
            ? this.orcamento.valorDespesaAdministrativaObservacao
            : this.orcamento.valorDespesaAdministrativa,
        valorCustoAssistencial:
          this.orcamento.valorCustoAssistencialObservacao !== null
            ? this.orcamento.valorCustoAssistencialObservacao
            : this.orcamento.valorCustoAssistencial,
        valorInvestimento:
          this.orcamento.valorInvestimentoObservacao !== null
            ? this.orcamento.valorInvestimentoObservacao
            : this.orcamento.valorInvestimento,

        observacao: this.orcamento.observacao,

        valorDespesaAdministrativaRessalva:
          this.orcamento.valorDespesaAdministrativaRessalva !== null
            ? this.orcamento.valorDespesaAdministrativaRessalva
            : this.orcamento.valorDespesaAdministrativaObservacao !== null
              ? this.orcamento.valorDespesaAdministrativaObservacao
              : this.orcamento.valorDespesaAdministrativa,
        valorCustoAssistencialRessalva:
          this.orcamento.valorCustoAssistencialRessalva !== null
            ? this.orcamento.valorCustoAssistencialRessalva
            : this.orcamento.valorCustoAssistencialObservacao !== null
              ? this.orcamento.valorCustoAssistencialObservacao
              : this.orcamento.valorCustoAssistencial,
        valorInvestimentoRessalva:
          this.orcamento.valorInvestimentoRessalva !== null
            ? this.orcamento.valorInvestimentoRessalva
            : this.orcamento.valorInvestimentoObservacao !== null
              ? this.orcamento.valorInvestimentoObservacao
              : this.orcamento.valorInvestimento,
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
      ressalva: [null],
      valorDespesaAdministrativaRessalva: [0, Validators.required],
      valorCustoAssistencialRessalva: [0, Validators.required],
      valorInvestimentoRessalva: [0, Validators.required],
    });
  }

  salvar(situacao?: SituacaoPreProjetoOrcamento) {
    this.saving = true;

    let fValue = this.form.value;

    let req = PreProjetoOrcamentoAlterarCommand.fromJS({
      ...this.orcamento,
      projetoId: this.projetoId,
      ressalva: fValue["ressalva"],
      valorDespesaAdministrativaRessalva: fValue["valorDespesaAdministrativaRessalva"],
      valorCustoAssistencialRessalva: fValue["valorCustoAssistencialRessalva"],
      valorInvestimentoRessalva: fValue["valorInvestimentoRessalva"],
    })

    this.PreProjetosClient
      .alterarOcamento(req)
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
          this.PreProjetosClient
            .alterarSituacaoOcamento(<PreProjetoOrcamentoAlterarSituacaoCommand>{
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

  }

  destroyModal(result?: { ocorreuAlteracao: boolean }): void {
    this.formSubscription.unsubscribe();
    this.nzModalRef.destroy(result);
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

  onChanges(): void {
    this.formSubscription = this.form.valueChanges
      .pipe(debounceTime(50))
      .subscribe((val) => {
        let valorDespesaAdministrativa = 0 || val['valorDespesaAdministrativa'];
        let valorCustoAssistencial = 0 || val['valorCustoAssistencial'];
        let valorInvestimento = 0 || val['valorInvestimento'];
        this.total =
          valorDespesaAdministrativa +
          valorCustoAssistencial +
          valorInvestimento;

        valorDespesaAdministrativa =
          0 || val['valorDespesaAdministrativaRessalva'];
        valorCustoAssistencial = 0 || val['valorCustoAssistencialRessalva'];
        valorInvestimento = 0 || val['valorInvestimentoRessalva'];
        this.totalRessalva =
          valorDespesaAdministrativa +
          valorCustoAssistencial +
          valorInvestimento;

      });
  }
}
