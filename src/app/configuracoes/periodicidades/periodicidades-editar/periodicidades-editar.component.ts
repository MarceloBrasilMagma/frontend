import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { PeriodicidadeAlterarCommand, PeriodicidadeCriarCommand, PeriodicidadesClient, PeriodicidadeVm } from 'web-api-client';

@Component({
  selector: 'app-periodicidades-editar',
  templateUrl: './periodicidades-editar.component.html',
  styleUrls: ['./periodicidades-editar.component.scss']
})
export class PeriodicidadesEditarComponent implements OnInit {
  @Input() periodicidade: PeriodicidadeVm

  form: UntypedFormGroup;
  saving: boolean;

  formSubscription: Subscription;

  constructor(
    private periodicidadeClient: PeriodicidadesClient,
    private nzModalRef: NzModalRef
  ) { }

  ngOnInit(): void {
    this.initForm()
    this.preencherForm()
  }

  private preencherForm() {
    if (!!this.periodicidade) {
      this.form.patchValue({
        ...this.periodicidade,
      })
    }
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      nome: [null, Validators.required],
    })
  }

  protected destroyModal(ok: boolean): void {
    this.nzModalRef.destroy(ok);
  }

  protected ok() {
    this.destroyModal(true)
  }

  protected cancelar() {
    this.destroyModal(false)
  }

  salvar() {
    if (!this.periodicidade) {
      this.criar()
    } else {
      this.alterar()
    }
  }

  criar() {
    let fValue = this.form.value;

    let req = <PeriodicidadeCriarCommand>{
      ...fValue
    }
    this.saving = true;
    this.periodicidadeClient.criar(req)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe(r => {
        this.ok()
      })
  }

  alterar() {
    let fValue = this.form.value;

    let req = <PeriodicidadeAlterarCommand>{
      ...fValue
    }

    req.id = this.periodicidade.id;

    this.saving = true;
    this.periodicidadeClient.alterar(req)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe(r => {
        this.ok()
      })
  }
}
