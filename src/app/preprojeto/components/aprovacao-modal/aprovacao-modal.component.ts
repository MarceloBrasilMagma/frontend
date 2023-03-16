import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { PortifolioVm } from 'web-api-client';

@Component({
  selector: 'app-aprovacao-modal',
  templateUrl: './aprovacao-modal.component.html',
  styleUrls: ['./aprovacao-modal.component.scss']
})
export class AprovacaoModalComponent implements OnInit {
  @Input() portifolios: PortifolioVm[];
  @Input() mensagem: string;
  @Input() iniciativaPortifolioId: number;
  @Input() comRessalva: boolean;

  form: UntypedFormGroup;

  constructor(
    private nzModalRef: NzModalRef
  ) { }

  ngOnInit(): void {
    this.initForm();
  }
  
  initForm() {
    this.form = new UntypedFormBuilder().group({
      dataProjeto: [null, Validators.required],
      portifolioId: [null, Validators.required],
      ressalva: [null]
    })
    this.form.patchValue({
      portifolioId: this.iniciativaPortifolioId
    })
  }

  protected destroyModal(data: Object | null): void {
    this.nzModalRef.destroy(data);
  }

  protected ok(){
    if(this.comRessalva) {
      this.form.controls["ressalva"].setValidators(Validators.required);
      this.form.get("ressalva").updateValueAndValidity();
    }
    if (this.form.invalid) {
      for (const key in this.form.controls) {
        this.form.controls[key].markAsDirty();
        this.form.controls[key].updateValueAndValidity();
      }
    } else {
      this.destroyModal(this.form.value) 
    }
  }

  protected cancelar(){
    this.destroyModal(null)
  }

}
