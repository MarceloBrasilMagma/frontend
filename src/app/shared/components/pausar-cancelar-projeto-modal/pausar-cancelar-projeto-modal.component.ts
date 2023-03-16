import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ProjetoAlterarStatusCommand, ProjetoPlurianualVm, ProjetosClient, ProjetoVm, StatusProjeto } from 'web-api-client';

@Component({
  selector: 'app-pausar-cancelar-projeto-modal',
  templateUrl: './pausar-cancelar-projeto-modal.component.html',
  styleUrls: ['./pausar-cancelar-projeto-modal.component.css']
})
export class PausarCancelarProjetoModalComponent implements OnInit {
  @Input() projetoId: number;
  @Input() motivoPausaCancelamento: string;
  @Input() status: StatusProjeto;
  StatusProjeto = StatusProjeto;
  projeto: ProjetoVm = new ProjetoVm();

  form: UntypedFormGroup;

  constructor(
      private projetosClient: ProjetosClient,
      private nzModalService: NzModalService,
      private nzModalRef: NzModalRef
    ) { }

  ngOnInit(): void {
    this.initForm();
    if(!!this.motivoPausaCancelamento){
      this.form.controls['motivo'].setValue(this.motivoPausaCancelamento);
      this.form.disable();
    }
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      motivo: [null, Validators.required],
    });
  }

  pausarCancelarProjeto(){

    if(this.form.invalid){
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente os campos obrigatórios!',
      });

      return;
    }

    var req = <ProjetoAlterarStatusCommand>{
      projetoId: this.projetoId,
      status: this.status,
      motivoPausaCancelamento: this.form.controls['motivo'].value
    };
    this.projetosClient.alterarStatus(req)
      .subscribe({
        next: res => {
          this.projeto = res;
          this.nzModalRef.destroy(this.projeto);
        },
        error: error => {
          this.nzModalService.error({
            nzTitle: 'Erro',
            nzContent:
              'Não foi possível alterar o status do projeto'
          });
          console.log(error);
          this.nzModalRef.destroy();
        }
      });
  }

  get modoExibicao(): boolean{
    return !!this.motivoPausaCancelamento;
  }
}
