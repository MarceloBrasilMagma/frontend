import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { IndicadoresAvaliacaoClient, PerguntaIndicadoresAlterarCommand, PerguntaIndicadoresCriarCommand, PerguntaIndicadorVm, Respostas } from 'web-api-client';

@Component({
  selector: 'app-indicadores-form',
  templateUrl: './indicadores-form.component.html',
  styleUrls: ['./indicadores-form.component.scss']
})
export class IndicadoresFormComponent implements OnInit {
  @Input() perguntaIndicador: PerguntaIndicadorVm

  form: UntypedFormGroup;
  saving: boolean;


  listaRespostas: { valor: string, nome: string, peso: number }[];

  constructor(
    private indicadorClient: IndicadoresAvaliacaoClient,
    private nzModalRef: NzModalRef
  ) { }

  ngOnInit(): void {
    this.initForm()
    this.preencherForm()
  }

  private preencherForm() {
    if (!!this.perguntaIndicador) {
      this.form.patchValue({
        ...this.perguntaIndicador,
      })

      this.listaRespostas = Object.keys(Respostas)
        .filter(k => typeof Respostas[k as any] === "number")
        .map(k => {
          return {
            valor: Respostas[k as any],
            nome: k,
            peso: this.perguntaIndicador.pesosRespostas.find(x => { return x.resposta === Respostas[k] })?.peso
          }
        });
    }
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
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
    if (!this.perguntaIndicador) {
      this.criar()
    } else {
      this.alterar()
    }
  }

  criar() {
    let fValue = this.form.value;

    let req = <PerguntaIndicadoresCriarCommand>{
      ...fValue
    }
    this.saving = true;
    this.indicadorClient.criarPergunta(req)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe(r => {
        this.ok()
      })
  }

  alterar() {
    let fValue = this.form.value;

    let req = <PerguntaIndicadoresAlterarCommand>{
      ...fValue
    }

    req.id = this.perguntaIndicador.id;

    this.saving = true;
    this.indicadorClient.alterarPergunta(req)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe(r => {
        this.ok()
      })
  }
}
