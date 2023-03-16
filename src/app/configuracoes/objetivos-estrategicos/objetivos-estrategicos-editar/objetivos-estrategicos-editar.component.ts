import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ObjetivoEstrategicoAlterarCommand, ObjetivoEstrategicoClassificacao, ObjetivoEstrategicoCriarCommand, ObjetivoEstrategicoPerspectiva, ObjetivoEstrategicoVm, ObjetivosEstrategicosClient } from 'web-api-client';

@Component({
  selector: 'app-objetivos-estrategicos-editar',
  templateUrl: './objetivos-estrategicos-editar.component.html',
  styleUrls: ['./objetivos-estrategicos-editar.component.scss']
})
export class ObjetivosEstrategicosEditarComponent implements OnInit {
  @Input() objetivo: ObjetivoEstrategicoVm
  @Input() objetivos: ObjetivoEstrategicoVm[]

  form: UntypedFormGroup = <UntypedFormGroup>{};
  saving: boolean;

  formSubscription: Subscription;

  objetivoEstrategicoPerspectiva = ObjetivoEstrategicoPerspectiva;
  objetivoEstrategicoClassificacao = ObjetivoEstrategicoClassificacao;

  constructor(
    private objetivosEstrategicosClient: ObjetivosEstrategicosClient,
    private nzModalRef: NzModalRef,
    private nzModalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.initForm()
    this.preencherForm()

    this.objetivos = this.objetivos.filter(x => {return x.id != this.objetivo.id})
  }

  private preencherForm() {
    if (!!this.objetivo) {
      this.form.patchValue({
        ...this.objetivo,
      })
    }
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      descricao: [null, Validators.required],

      objetivoEstrategicoPerspectiva: [null],
      objetivoEstrategicoClassificacao: [null],

      CorFundo: ["red", Validators.required],
      CorTexto: ["white", Validators.required],

      porcentagem: [null, Validators.required],

      objetivoEstrategicoPaiId: [null],

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

    let fValue = this.form.value;

    if(this.validarObjetivoEstrategico(fValue)){
      if (!this.objetivo) {
        this.criar()
      } else {
        this.alterar()
      }
    }
  }

  validarObjetivoEstrategico(form: ObjetivoEstrategicoVm): boolean {

    if(
      !form.descricao ||
      form.objetivoEstrategicoClassificacao == null ||
      form.objetivoEstrategicoPerspectiva == null ||
      !form.porcentagem
    ) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Preencha os dados para registrar o Objetivo Estratégico',
      });
      return false
    }
    return true
  }

  criar() {
    let fValue = this.form.value;

    let req = <ObjetivoEstrategicoCriarCommand>{
      ...fValue
    }

    this.saving = true;
    this.objetivosEstrategicosClient.criar(req)
    .pipe(finalize(() => {
      this.saving = false;
    }))
    .subscribe(r => {
      this.ok()
    })
  }

  alterar() {
    let fValue = this.form.value;

    let req = <ObjetivoEstrategicoAlterarCommand>{
      ...fValue
    }

    req.id = this.objetivo.id;

    this.saving = true;
    this.objetivosEstrategicosClient.alterar(req)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe(r => {

        this.ok()
      })
  }
}
