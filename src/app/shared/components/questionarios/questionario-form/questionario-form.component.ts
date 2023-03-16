import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import {
  QuestionarioGrupoPerguntaSalvarCommand,
  QuestionarioGrupoPerguntaVm,
  QuestionarioModeloVm,
  QuestionarioSalvarCommand,
  QuestionariosClient,
  QuestionariosModeloObterQuery,
  QuestionarioVm,
  TipoQuestionario,
} from 'web-api-client';

@Component({
  selector: 'app-questionario-form',
  templateUrl: './questionario-form.component.html',
  styleUrls: ['./questionario-form.component.scss'],
})
export class QuestionarioFormComponent implements OnInit {
  questionario: QuestionarioVm = <QuestionarioVm>{};
  questionarioId: number;
  form: UntypedFormGroup;
  carregando = false;
  questionariosModelo: QuestionarioModeloVm[];
  novoGrupo = '';
  TipoQuestionario = TipoQuestionario;
  projetoId: number;
  preProjetoId: number;
  projetoPlurianualId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionariosClient: QuestionariosClient,
    private nzNotificationService: NzNotificationService,
    private nzModalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.questionarioId = +this.route.snapshot.paramMap.get('questionarioId');

    if (this.router.url.split('/').includes('projetos'))
      this.projetoId = +this.route.snapshot.paramMap.get('id');
    else if (this.router.url.split('/').includes('pre-projetos'))
      this.preProjetoId = +this.route.snapshot.paramMap.get('id');
    else if (this.router.url.split('/').includes('projetos-plurianuais'))
      this.projetoPlurianualId = +this.route.snapshot.paramMap.get('id');

    if (this.questionarioId) {
      this.carregarQuestionario();
    }
    this.carregarQuestionariosModelo();
    this.initForm();
  }

  private carregarQuestionario() {
    this.carregando = true;

    this.questionariosClient
      .obterPorId(this.questionarioId)
      .subscribe((res) => {
        this.questionario = res;
        this.form.patchValue(res);
      })
      .add(() => (this.carregando = false));
  }

  carregarQuestionariosModelo() {
    //TODO: search dinâmico
    //pagesize temporária
    this.questionariosClient
      .obterModelo(<QuestionariosModeloObterQuery>{
        pageSize: 100,
        pageIndex: 0,
      })
      .subscribe({
        next: (qm) => (this.questionariosModelo = qm.items),
      });
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      tipo: [null, [Validators.required]],
      questionarioModeloId: [null, [Validators.required]],
      titulo: [null, [Validators.required]],
    });
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
          'Verifique o formulário e preencha corretamenta os campos obrigatórios!',
      });
    } else {
      this.carregando = true;
      const fValue = this.form.value;
      const req = QuestionarioSalvarCommand.fromJS(fValue);
      req.id = this.questionarioId ? this.questionarioId : null;
      req.projetoId = this.projetoId;
      req.preProjetoId = this.preProjetoId;
      req.projetoPlurianualId = this.projetoPlurianualId;

      this.questionariosClient
        .salvarQuestionario(req)
        .subscribe((r) => {
          this.nzNotificationService.success(
            'Questionário salvo com sucesso',
            ''
          );
          this.router.navigate(['../editar', r], { relativeTo: this.route });
        })
        .add(() => (this.carregando = false));
    }
  }

  salvarNovoGrupo() {
    var command = <QuestionarioGrupoPerguntaSalvarCommand>{
      questionarioId: this.questionarioId,
      titulo: this.novoGrupo,
    };
    this.questionariosClient
      .salvarGrupoPergunta(this.questionarioId, command)
      .subscribe((res) => {
        this.carregarQuestionario();
        this.novoGrupo = '';
      });
  }

  salvarGrupo(grupo: QuestionarioGrupoPerguntaVm) {
    var command = <QuestionarioGrupoPerguntaSalvarCommand>{
      id: grupo.id,
      ordemExibicao: grupo.ordemExibicao,
      questionarioId: this.questionarioId,
      titulo: grupo.titulo,
    };
    this.questionariosClient
      .salvarGrupoPergunta(this.questionarioId, command)
      .subscribe((res) => {});
  }

  excluir() {
    this.carregando = true;
    this.questionariosClient
      .excluirQuestionario(this.questionarioId)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: () => {
          this.nzNotificationService.success(
            'Questionário excluído com sucesso',
            ''
          );
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
      });
  }
}
