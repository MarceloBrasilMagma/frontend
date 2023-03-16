import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { EquipeProjetoFuncaoAlterarCommand, EquipeProjetoFuncaoClient, EquipeProjetoFuncaoCriarCommand, EquipeProjetoFuncaoVm, EquipeProjetoVm } from 'web-api-client';

@Component({
  selector: 'app-equipes-projetos-editar',
  templateUrl: './equipes-projetos-editar.component.html',
  styleUrls: ['./equipes-projetos-editar.component.scss']
})
export class EquipesProjetosEditarComponent implements OnInit {
  @Input() funcaoProjeto: EquipeProjetoFuncaoVm

  form: UntypedFormGroup;
  saving: boolean;

  formSubscription: Subscription;

  constructor(
    private equipeProjetoFuncaoClient: EquipeProjetoFuncaoClient,
    private nzModalRef: NzModalRef
  ) { }

  ngOnInit(): void {
    this.initForm()
    this.preencherForm()
  }

  private preencherForm() {
    if (!!this.funcaoProjeto) {
      this.form.patchValue({
        ...this.funcaoProjeto,
      })
    }
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      descricao: [null, Validators.required],
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
    if (!this.funcaoProjeto) {
      this.criar()
    } else {
      this.alterar()
    }
  }

  criar() {
    let fValue = this.form.value;

    let req = <EquipeProjetoFuncaoCriarCommand>{
      ...fValue
    }
    this.saving = true;
    this.equipeProjetoFuncaoClient.criar(req)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe(r => {
        this.ok()
      })
  }

  alterar() {
    let fValue = this.form.value;

    let req = <EquipeProjetoFuncaoAlterarCommand>{
      ...fValue
    }

    req.id = this.funcaoProjeto.id;

    this.saving = true;
    this.equipeProjetoFuncaoClient.alterar(req)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe(r => {
        this.ok()
      })
  }
}
