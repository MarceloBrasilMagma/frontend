import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-modal-confirmacao',
  templateUrl: './modal-confirmacao.component.html',
  styleUrls: ['./modal-confirmacao.component.scss']
})
export class ModalConfirmacaoComponent implements OnInit {
  @Input() textoOk: string
  @Input() textoCancelar: string
  @Input() mensagem: string

  @Input() corOk: string
  @Input() corCancelar: string

  constructor(
    private nzModalRef: NzModalRef
  ) { }

  ngOnInit(): void {
  }

  protected destroyModal(ok: boolean): void {
    this.nzModalRef.destroy(ok);
  }

  protected ok(){
    this.destroyModal(true)
  }

  protected cancelar(){
    this.destroyModal(false)
  }
}
