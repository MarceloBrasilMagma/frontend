import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import { DeclaracaoTrabalhoAlterarCommand, DeclaracaoTrabalhoAlterarSituacaoCommand, DeclaracaoTrabalhoSituacao, DeclaracaoTrabalhoVm, DeclaracoesTrabalhoClient } from 'web-api-client';

@Component({
  selector: 'app-solicitacao-ajustes-dt',
  templateUrl: './solicitacao-ajustes-dt.component.html',
  styleUrls: ['./solicitacao-ajustes-dt.component.scss']
})
export class SolicitacaoAjustesDtComponent implements OnInit {
  @Input() declaracao: DeclaracaoTrabalhoVm;
  @Input() situacao: DeclaracaoTrabalhoSituacao;
  form: UntypedFormGroup;
  saving: boolean;

  constructor(
    private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient,
    private nzModalRef: NzModalRef,
    private nzNotificationService: NzNotificationService,
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      motivo: [null, Validators.required],
    });
  }

  justificar(){
    this.saving = true;
    this.declaracoesTrabalhoClient
      .alterarSituacao(new DeclaracaoTrabalhoAlterarSituacaoCommand({
        declaracaoTrabalhoId: this.declaracao.id,
        motivoSolicitacaoNovasInformacoes: this.form.controls['motivo'].value,
        situacao: this.situacao
      }))
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe( r=> {
        this.nzNotificationService.success(
          'Solicitação salva com sucesso!',
          ''
        );
        this.destroyModal(r);
      })
  }

  destroyModal(result?: DeclaracaoTrabalhoVm): void {
    this.nzModalRef.destroy(result);
  }

}
