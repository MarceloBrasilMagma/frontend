import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import * as moment from 'moment';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DepartamentosClient, DepartamentoVm, FaseProjeto, LicaoAprendidaAlterarCommand, LicaoAprendidaClient, LicaoAprendidaCriarCommand, LicaoAprendidaVm } from 'web-api-client';

@Component({
  selector: 'app-licao-aprendida-form',
  templateUrl: './licao-aprendida-form.component.html',
  styleUrls: ['./licao-aprendida-form.component.scss']
})
export class LicaoAprendidaFormComponent implements OnInit {
  @Input() licaoAprendida: LicaoAprendidaVm
  @Input() projetoId: number

  form: UntypedFormGroup;
  saving: boolean;

  faseProjeto = FaseProjeto;

  formSubscription: Subscription;

  departamentos: DepartamentoVm[];
  
  constructor(
    private licaoAprendidaClient: LicaoAprendidaClient,
    private departamentosClient: DepartamentosClient,
    private nzModalRef: NzModalRef,
    private nzModalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.initForm()
    this.obterDepartamentos();
    this.preencherForm()
  }

  private preencherForm() {
    if (!!this.licaoAprendida) {
      this.form.patchValue({
        ...this.licaoAprendida,

        data: moment(
          this.licaoAprendida.data
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
      data: [null, Validators.required],
      fase: [null, Validators.required],
      departamentoId: [null, Validators.required],
      pontosPositivos: [null],
      pontosAtencao: [null],
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

  get requiredPontosPositivos() {
    return ((!this.form.controls['pontosPositivos'].value &&
                  !this.form.controls['pontosAtencao'].value) || 
                (!this.form.controls['pontosAtencao'].value)
            )
  }

  get requiredPontosAtencao() {
    return ((!this.form.controls['pontosPositivos'] &&
                  !this.form.controls['pontosAtencao'].value) || 
              (!this.form.controls['pontosPositivos'].value)
            )
  }

  salvar() {
    if (this.form.invalid) {
      for (const key in this.form.controls) {
        this.form.controls[key].markAsDirty();
        this.form.controls[key].updateValueAndValidity();
      }
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente os campos obrigatórios!',
      });
      return;
    }

    if(!this.form.controls['pontosPositivos'].value && !this.form.controls['pontosAtencao'].value){
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Preencha pontos positivos ou pontos de atenção!',
      });
      return;
    }

    if (!this.licaoAprendida) {
      this.criar()
    } else {
      this.alterar()
    }
  }

  criar() {
    let fValue = this.form.value;

    let req = <LicaoAprendidaCriarCommand>{
      ...fValue
    }

    req.projetoId = this.projetoId;

    this.saving = true;
    this.licaoAprendidaClient.criar(req)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe(r => {
        this.ok()
      })
  }

  alterar() {
    let fValue = this.form.value;

    let req = <LicaoAprendidaAlterarCommand>{
      ...fValue
    }

    req.id = this.licaoAprendida.id;

    this.saving = true;
    this.licaoAprendidaClient.alterar(req)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe(r => {
        this.ok()
      })
  }
}
