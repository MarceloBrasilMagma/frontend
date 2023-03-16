import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs/operators';
import { DepartamentosClient, DepartamentoVm, FollowUp, PlanoAcaoAlterarCommand, PlanoAcaoCriarCommand, PlanoAcaoVm, PlanosAcaoClient } from 'web-api-client';

@Component({
  selector: 'app-plano-acao-form',
  templateUrl: './plano-acao-form.component.html',
  styleUrls: ['./plano-acao-form.component.scss']
})
export class PlanoAcaoFormComponent implements OnInit {
  @Input() planoAcao: PlanoAcaoVm;
  @Input() projetoId: number;

  form: UntypedFormGroup;
  saving: boolean;

  followUp = FollowUp;

  departamentos: DepartamentoVm[];

  constructor(
    private planosAcaoClient: PlanosAcaoClient,
    private nzModalRef: NzModalRef,
    private departamentosClient: DepartamentosClient,
  ) { }

  ngOnInit(): void {
    this.initForm()
    this.preencherForm()

    this.obterDepartamentos();
  }

  private preencherForm() {
    if (!!this.planoAcao) {
      this.form.patchValue({
        ...this.planoAcao,

        data: moment(
          this.planoAcao.data
        ).format('YYYY-MM-DD'),
      })
    } else {
      this.form.patchValue({
        data: moment(
          new Date(Date.now())
        ).format('YYYY-MM-DD'),
      })
    }

  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      descricao: [null, Validators.required],
      departamentoId: [null, Validators.required],
      data: [null, Validators.required],
      observacao: [null, Validators.required],
      followUp: [null, Validators.required],
    })
  }

  private obterDepartamentos() {
    this.departamentosClient.obter().subscribe((r) => {
      this.departamentos = r;
    });
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
    if (!this.planoAcao) {
      this.criar()
    } else {
      this.alterar()
    }
  }

  criar() {
    let fValue = this.form.value;

    let req = <PlanoAcaoCriarCommand>{
      ...fValue
    }

    req.projetoId = this.projetoId;

    this.saving = true;
    this.planosAcaoClient.criar(req)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe(r => {
        this.ok()
      })
  }

  alterar() {
    let fValue = this.form.value;

    let req = <PlanoAcaoAlterarCommand>{
      ...fValue
    }

    req.id = this.planoAcao.id;

    this.saving = true
    this.planosAcaoClient.alterar(req)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe(r => {
        this.ok()
      })
  }
}

