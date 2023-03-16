import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  QuestionarioGrupoPerguntaVm,
  QuestionarioPerguntaOpcaoVm,
  QuestionarioPreenchimentoRespostaSalvar,
  QuestionarioPreenchimentosClient,
  QuestionarioPreenchimentoVm,
  QuestionariosClient,
  QuestionarioModeloVm,
  QuestionarioTipoResposta,
  SituacaoQuestionarioPreenchimento,
  QuestionarioPreenchimentoRespostaSalvarCommand,
  ProjetoVm,
} from 'web-api-client';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-questao',
  templateUrl: './questao.component.html',
  styleUrls: ['./questao.component.scss'],
})
export class QuestaoComponent implements OnInit {
  @Input() questionarioIdInput: number;
  @Input() preenchimentoIdInput: number;

  carregando = false;
  formDesabilitado: boolean;
  preenchimentoId: number;
  grupoId: number;
  indiceGrupoAtual: number;
  //empresaId: number;
  questionarioId: number;

  projeto: ProjetoVm;

  grupo = <QuestionarioGrupoPerguntaVm>{
    perguntas: [],
  };

  questionario: QuestionarioModeloVm = <QuestionarioModeloVm>{
    gruposPerguntas: [],
  };

  preenchimento: QuestionarioPreenchimentoVm = <QuestionarioPreenchimentoVm>{
    situacaoQuestionarioPreenchimento: null,
  };

  form: UntypedFormGroup;
  tipoRespostaEnum = QuestionarioTipoResposta;
  situacaoQuestionarioPreenchimentoEnum = SituacaoQuestionarioPreenchimento;

  respostas: QuestionarioPreenchimentoRespostaSalvar[] = [];
  listaCommandsRespostas: QuestionarioPreenchimentoRespostaSalvar[] = [];

  respostaNps: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private nzNotificationService: NzNotificationService,
    private questionarioClient: QuestionariosClient,
    private questionarioPreenchimentoClient: QuestionarioPreenchimentosClient
  ) {}

  async ngOnInit() {
    this.carregando = true;

    if (this.questionarioIdInput && this.preenchimentoIdInput) {
      this.preenchimentoId = this.preenchimentoIdInput;
      this.questionarioId = this.questionarioIdInput;
    } else {
      if (this.route.snapshot.paramMap.get('grupoId'))
        this.grupoId = +this.route.snapshot.paramMap.get('grupoId');

      if (this.route.snapshot.paramMap.get('preenchimentoId'))
        this.preenchimentoId =
          +this.route.snapshot.paramMap.get('preenchimentoId');

      this.questionarioId = +this.route.snapshot.paramMap.get('questionarioId');
    }

    this.form = new UntypedFormBuilder().group([]);

    // if (!this.preenchimentoId) {
    //   this.preenchimentoId = await this.questionarioPreenchimentoClient.salvarCabecalhoPreenchimento(<QuestionarioPreenchimentoSalvarCommand>{
    //     questionarioId: this.questionarioId,
    //     situacaoQuestionarioPreenchimento: SituacaoQuestionarioPreenchimento.Enviado,
    //   }).toPromise();
    // }

    if (!!this.preenchimentoId) {
      this.preenchimento = await this.questionarioPreenchimentoClient
        .obterPorId(this.preenchimentoId)
        .toPromise();
    }

    this.questionarioClient
      .obterPorId(this.questionarioId)
      .subscribe((res) => {
        this.questionario = res;

        this.questionario.gruposPerguntas =
          res.questionarioModelo.gruposPerguntas.concat(res.gruposPerguntas);

        if (!this.grupoId)
          this.grupoId = this.questionario.gruposPerguntas[0].id;

        this.indiceGrupoAtual = this.questionario.gruposPerguntas
          .map((e) => e.id)
          .indexOf(this.grupoId);

        this.grupo = this.questionario.gruposPerguntas[this.indiceGrupoAtual];

        this.form = this.toFormGroup();

        if (!!this.preenchimentoId) {
          this.preenchimento.respostas.forEach((item) => {
            this.respostas[item.questionarioPerguntaId] =
              new QuestionarioPreenchimentoRespostaSalvar();

            switch (item.questionarioPerguntaTipoResposta) {
              case QuestionarioTipoResposta.UnicaEscolha:
              case QuestionarioTipoResposta.SimNao:
                this.respostas[item.questionarioPerguntaId].opcaoIdSelecionada =
                  item.opcaoIdSelecionada;
                this.respostas[item.questionarioPerguntaId].respostaTexto =
                  item.respostaTexto;
                this.form.controls[
                  `pergunta_${item.questionarioPerguntaId}`
                ].setValue(item.opcaoIdSelecionada);
                break;
              case QuestionarioTipoResposta.MultiplaEscolha:
                this.respostas[item.questionarioPerguntaId].opcoesSelecionadas =
                  item.opcoesSelecionadas;
                this.respostas[item.questionarioPerguntaId].respostaTexto =
                  item.respostaTexto;

                item.opcoesSelecionadas.forEach((opcao) => {
                  if (
                    this.form.controls[
                      `pergunta_${item.questionarioPerguntaId}_${opcao}`
                    ]
                  )
                    this.form.controls[
                      `pergunta_${item.questionarioPerguntaId}_${opcao}`
                    ].setValue(true);
                });
                break;
              case QuestionarioTipoResposta.Texto:
                this.respostas[item.questionarioPerguntaId].respostaTexto =
                  item.respostaTexto;
                this.form.controls[
                  `pergunta_${item.questionarioPerguntaId}`
                ].setValue(item.respostaTexto);
                break;
              case QuestionarioTipoResposta.NPS:
                this.respostaNps = item.respostaTexto;
                this.form.controls[
                  `pergunta_${item.questionarioPerguntaId}`
                ].setValue(item.respostaTexto);
                break;
              default:
                break;
            }
          });
        }
      })
      .add(() => (this.carregando = false));
  }

  toFormGroup() {
    const group: any = {};

    this.formDesabilitado =
      this.preenchimento.situacaoQuestionarioPreenchimento ===
      SituacaoQuestionarioPreenchimento.Respondido;

    this.questionario.gruposPerguntas.forEach((grupo) => {
      grupo.perguntas.forEach((pergunta) => {
        if (pergunta.tipoResposta == QuestionarioTipoResposta.MultiplaEscolha) {
          var opcoes = [];

          pergunta.opcoes.forEach((o) => {
            group[`pergunta_${pergunta.id}_${o.id}`] = new UntypedFormControl({
              value: false,
              disabled: this.formDesabilitado,
            });
            opcoes.push({ label: o.titulo, value: o.id });
          });

          if (pergunta.exibirOpcaoEditavel) {
            group[`pergunta_${pergunta.id}_-1`] = new UntypedFormControl({
              value: false,
              disabled: this.formDesabilitado,
            });

            const titulo = pergunta.labelOpcaoEditavel
              ? pergunta.labelOpcaoEditavel
              : 'Outro';

            opcoes.push({ label: titulo, value: -1 });
            pergunta.opcoes.push(<QuestionarioPerguntaOpcaoVm>{
              id: -1,
              titulo: titulo,
            });
          }
        } else {
          group[`pergunta_${pergunta.id}`] = pergunta.obrigatoria
            ? new UntypedFormControl(
                { value: '', disabled: this.formDesabilitado },
                Validators.required
              )
            : new UntypedFormControl({
                value: '',
                disabled: this.formDesabilitado,
              });
        }
      });
    });
    return new UntypedFormGroup(group);
  }

  alterouOpcao(event: number, perguntaId: number, textoAdicional: string) {
    if (this.respostas[perguntaId] === undefined) {
      this.respostas[perguntaId] =
        new QuestionarioPreenchimentoRespostaSalvar();
    }

    this.respostas[perguntaId].opcaoIdSelecionada = event;
    this.respostas[perguntaId].respostaTexto = textoAdicional;

    var command = <QuestionarioPreenchimentoRespostaSalvar>{
      opcaoIdSelecionada: event,
      questionarioPerguntaId: perguntaId,
      // questionarioPreenchimentoId: this.preenchimentoId,
      respostaTexto: textoAdicional,
    };

    // this.questionarioPreenchimentoClient.responderOpcao(command)
    //   .subscribe(r => { });
    if (
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      ).length > 0
    ) {
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      )[0] = command;
    } else {
      this.listaCommandsRespostas.push(command);
    }
  }

  alterouOpcaoTexto(event, perguntaId: number) {
    var command = <QuestionarioPreenchimentoRespostaSalvar>{
      respostaTexto: event.target.value,
      questionarioPerguntaId: perguntaId,
      // questionarioPreenchimentoId: this.preenchimentoId
    };

    // this.questionarioPreenchimentoClient.responderOpcao(command)
    //   .subscribe(r => { });
    if (
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      ).length > 0
    ) {
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      )[0] = command;
    } else {
      this.listaCommandsRespostas.push(command);
    }
  }

  alterouOpcaoNps(event, perguntaId: number) {
    var command = <QuestionarioPreenchimentoRespostaSalvar>{
      respostaTexto: this.form.controls[`pergunta_${perguntaId}`].value,
      questionarioPerguntaId: perguntaId,
      // questionarioPreenchimentoId: this.preenchimentoId
    };

    // this.questionarioPreenchimentoClient.responderOpcao(command)
    //   .subscribe(r => { });
    if (
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      ).length > 0
    ) {
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      )[0] = command;
    } else {
      this.listaCommandsRespostas.push(command);
    }
  }

  alterouOpcaoCheckbox(event, perguntaId: number) {
    if (this.respostas[perguntaId] === undefined) {
      this.respostas[perguntaId] =
        new QuestionarioPreenchimentoRespostaSalvar();
    }

    this.respostas[perguntaId].opcoesSelecionadas = event;

    var command = <QuestionarioPreenchimentoRespostaSalvar>{
      questionarioPerguntaId: perguntaId,
      // questionarioPreenchimentoId: this.preenchimentoId,
      opcoesSelecionadas: event,
      respostaTexto: this.respostas[perguntaId].respostaTexto,
    };

    // this.questionarioPreenchimentoClient.responderOpcao(command)
    //   .subscribe(r => { });
    if (
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      ).length > 0
    ) {
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      )[0] = command;
    } else {
      this.listaCommandsRespostas.push(command);
    }
  }

  alterouTextoAdicionalCheckbox(perguntaId: number, textoAdicional: string) {
    if (this.respostas[perguntaId] === undefined) {
      this.respostas[perguntaId] =
        new QuestionarioPreenchimentoRespostaSalvar();
    }

    this.respostas[perguntaId].respostaTexto = textoAdicional;

    var command = <QuestionarioPreenchimentoRespostaSalvar>{
      questionarioPerguntaId: perguntaId,
      // questionarioPreenchimentoId: this.preenchimentoId,
      opcoesSelecionadas: this.respostas[perguntaId].opcoesSelecionadas,
      respostaTexto: this.respostas[perguntaId].respostaTexto,
    };

    // this.questionarioPreenchimentoClient.responderOpcao(command)
    //   .subscribe(r => { });
    if (
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      ).length > 0
    ) {
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      )[0] = command;
    } else {
      this.listaCommandsRespostas.push(command);
    }
  }

  salvarRespostaUnicaOpcao(event: number, perguntaId: number) {
    var resposta = <QuestionarioPreenchimentoRespostaSalvar>{
      opcaoIdSelecionada: event,
      questionarioPerguntaId: perguntaId,
    };
    if (
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      ).length > 0
    ) {
      this.listaCommandsRespostas.filter(
        (x) => x.questionarioPerguntaId === perguntaId
      )[0] = resposta;
    } else {
      this.listaCommandsRespostas.push(resposta);
    }
  }

  avancarGrupo() {
    this.indiceGrupoAtual = this.indiceGrupoAtual + 1;
    this.grupo = this.questionario.gruposPerguntas[this.indiceGrupoAtual];
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  retornarGrupo() {
    this.indiceGrupoAtual = this.indiceGrupoAtual - 1;
    this.grupo = this.questionario.gruposPerguntas[this.indiceGrupoAtual];
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  finalizar() {
    // this.questionarioPreenchimentoClient.finalizar(this.preenchimentoId)
    //   .subscribe(res => {
    //     this.nzNotificationService.success("Sucesso", "Questionário preenchido com sucesso");
    //     //this.router.navigate(['/empresas', 'editar', this.empresaId]);
    //   })
    var command = <QuestionarioPreenchimentoRespostaSalvarCommand>{
      questionarioId: this.questionarioId,
      respostas: this.listaCommandsRespostas,
    };
    this.questionarioPreenchimentoClient
      .responderOpcao(command)
      .subscribe((res) => {
        this.nzNotificationService.success(
          'Sucesso',
          'Questionário preenchido com sucesso'
        );
        this.router.navigate(['../', 'preenchimentos'], {
          relativeTo: this.route,
        });
      });
  }

  imprimirSalvarPdf() {
    window.print();
  }
}
