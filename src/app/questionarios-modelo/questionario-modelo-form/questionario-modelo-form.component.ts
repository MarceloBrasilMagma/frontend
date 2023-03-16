import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  QuestionarioGrupoPerguntaSalvarCommand,
  QuestionarioGrupoPerguntaVm,
  QuestionarioSalvarCommand,
  QuestionariosClient,
  QuestionarioModeloVm,
} from 'web-api-client';

@Component({
  templateUrl: './questionario-modelo-form.component.html',
  styleUrls: ['./questionario-modelo-form.component.scss'],
})
export class QuestionarioModeloFormComponent implements OnInit {
  questionarioId: number;
  questionario: QuestionarioModeloVm = <QuestionarioModeloVm>{};
  form: UntypedFormGroup;
  carregando = false;
  novoGrupo = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionariosClient: QuestionariosClient,
    private nzNotificationService: NzNotificationService,
    private nzModalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.questionarioId = +this.route.snapshot.paramMap.get('id');

    if (this.questionarioId) {
      this.carregarQuestionario();
    }

    this.initForm();
  }

  private carregarQuestionario() {
    this.carregando = true;

    this.questionariosClient
      .obterModeloPorId(this.questionarioId)
      .subscribe((res) => {
        this.questionario = res;
        this.form.patchValue(res);
      })
      .add(() => (this.carregando = false));
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
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
      this.questionarioId
        ? this.salvarQuestionario()
        : this.criarQuestionario();
    }
  }

  salvarQuestionario() {
    this.carregando = true;
    const fValue = this.form.value;
    const req = QuestionarioSalvarCommand.fromJS(fValue);
    req.id = this.questionarioId;

    this.questionariosClient
      .salvarQuestionarioModelo(req)
      .subscribe((r) => {
        this.nzNotificationService.success(
          'Questionário salvo com sucesso',
          ''
        );
        this.router.navigate(['/questionarios-modelo']);
      })
      .add(() => (this.carregando = false));
  }

  criarQuestionario() {
    this.carregando = true;
    const fValue = this.form.value;
    const req = QuestionarioSalvarCommand.fromJS(fValue);

    this.questionariosClient
      .salvarQuestionarioModelo(req)
      .subscribe((r) => {
        this.nzNotificationService.success(
          'Questionário criado com sucesso',
          ''
        );
        this.router.navigate(['/questionarios-modelo', 'editar', r]);
      })
      .add(() => (this.carregando = false));
  }

  salvarNovoGrupo() {
    var command = <QuestionarioGrupoPerguntaSalvarCommand>{
      questionarioModeloId: this.questionarioId,
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

  excluirQuestionarioModelo() {
    this.questionariosClient
      .excluirQuestionarioModelo(this.questionarioId)

      .subscribe({
        next: () => {
          this.nzNotificationService.success(
            'Questionário excluído com sucesso',
            ''
          );
          this.router.navigate(['/questionarios-modelo']);
        },
      });
  }
}
