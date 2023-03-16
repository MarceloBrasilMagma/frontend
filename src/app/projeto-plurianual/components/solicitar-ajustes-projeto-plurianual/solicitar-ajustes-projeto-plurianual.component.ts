import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import { ProjetoPlurianualAlterarSituacaoCommand, ProjetoPlurianualVm, ProjetosPlurianuaisClient, SituacaoProjetoPlurianual } from 'web-api-client';

@Component({
  selector: 'app-solicitar-ajustes-projeto-plurianual',
  templateUrl: './solicitar-ajustes-projeto-plurianual.component.html',
  styleUrls: ['./solicitar-ajustes-projeto-plurianual.component.scss']
})
export class SolicitarAjustesProjetoPlurianualComponent implements OnInit {
  @Input() projeto: ProjetoPlurianualVm;
  @Input() situacao: SituacaoProjetoPlurianual
  form: UntypedFormGroup;
  saving: boolean;

  constructor(
    private projetosPlurianuaisClient: ProjetosPlurianuaisClient,
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
    this.projetosPlurianuaisClient
      .alterarSituacao(this.projeto.id.toString(), new ProjetoPlurianualAlterarSituacaoCommand({
        projetoPlurianualId: this.projeto.id,
        motivoSolicitacaoNovasInformacoes: this.form.controls['motivo'].value,
        situacao: this.situacao
      }))
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe( r => {
        this.nzNotificationService.success(
          'Solicitação salva com sucesso!',
          ''
        );
        this.destroyModal(r);
      })
  }

  destroyModal(result?: ProjetoPlurianualVm): void {
    this.nzModalRef.destroy(result);
  }

}
