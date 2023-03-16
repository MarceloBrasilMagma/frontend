import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import { PreProjetoAlterarCommand, PreProjetoAlterarSituacaoCommand, PreProjetosClient, PreProjetoSituacao, PreProjetoVm, SituacaoPreProjeto } from 'web-api-client';

@Component({
  selector: 'app-solicitacao-ajustes-projeto',
  templateUrl: './solicitacao-ajustes-projeto.component.html',
  styleUrls: ['./solicitacao-ajustes-projeto.component.scss']
})
export class SolicitacaoAjustesProjetoComponent implements OnInit {
  @Input() projeto: PreProjetoVm;
  @Input() situacao: SituacaoPreProjeto;
  @Input() arquivar: boolean;

  form: UntypedFormGroup;
  saving: boolean;

  constructor(
    private PreProjetosClient: PreProjetosClient,
    private nzModalRef: NzModalRef,
    private nzNotificationService: NzNotificationService,
    private router: Router,
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
    if(this.arquivar) {
      this.PreProjetosClient.arquivarProjeto(this.projeto.id, this.form.controls['motivo'].value)
          .pipe(
            finalize(() => {
              this.saving = false;
            })
          )
          .subscribe((r) => {
            if(r.situacao == SituacaoPreProjeto.ProjetoArquivado) {
              this.nzNotificationService.success(
                'Projeto arquivado com sucesso!',
                ''
              );
            } else {
              this.nzNotificationService.success(
                'Projeto desarquivado com sucesso!',
                ''
              );
            }
            this.destroyModal(r);
            this.router.navigateByUrl('pre-projetos');
          });
    } else {
      this.PreProjetosClient
        .alterarSituacao(this.projeto.id, new PreProjetoAlterarSituacaoCommand({
          preProjetoId: this.projeto.id,
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
  }

  destroyModal(result?: PreProjetoVm): void {
    this.nzModalRef.destroy(result);
  }

}
