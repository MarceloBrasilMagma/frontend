import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  CronogramaAlterarCommand,
  CronogramaCriarCommand,
  CronogramasClient,
  CronogramaVm,
} from 'web-api-client';

@Component({
  selector: 'app-cronograma-form',
  templateUrl: './cronograma-form.component.html',
  styleUrls: ['./cronograma-form.component.scss'],
})
export class CronogramaFormComponent implements OnInit {
  @Input() cronograma: CronogramaVm;
  @Input() projetoId: number;

  form: UntypedFormGroup;
  saving: boolean;

  formSubscription: Subscription;

  constructor(
    private cronogramaClient: CronogramasClient,
    private nzModalRef: NzModalRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.preencherForm();
  }

  private preencherForm() {
    if (!!this.cronograma) {
      this.form.patchValue({
        ...this.cronograma,

        dataStatus: moment(this.cronograma.dataStatus).format('YYYY-MM-DD'),
      });
    } else {
      this.form.patchValue({
        dataStatus: moment(new Date(Date.now())).format('YYYY-MM-DD'),
      });
    }
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      dataStatus: [null, Validators.required],
      revisado: [null, Validators.required],
      realizado: [null, Validators.required],
    });
  }

  protected destroyModal(ok: boolean): void {
    this.nzModalRef.destroy(ok);
  }

  protected ok() {
    this.destroyModal(true);
  }

  protected cancelar() {
    this.destroyModal(false);
  }

  salvar() {
    if (!this.cronograma) {
      this.criar();
    } else {
      this.alterar();
    }
  }

  criar() {
    let fValue = this.form.value;

    let req = CronogramaCriarCommand.fromJS(fValue);

    req.projetoId = this.projetoId;

    this.saving = true;
    this.cronogramaClient
      .criar(req)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe((r) => {
        this.ok();
      });
  }

  alterar() {
    let fValue = this.form.value;

    let req = CronogramaAlterarCommand.fromJS(fValue);

    req.id = this.cronograma.id;

    this.saving = true;
    this.cronogramaClient
      .alterar(req)
      .pipe(
        finalize(() => {
          this.saving = false;
        })
      )
      .subscribe((r) => {
        this.ok();
      });
  }
}
