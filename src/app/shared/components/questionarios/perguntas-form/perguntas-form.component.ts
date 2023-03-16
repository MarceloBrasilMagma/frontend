import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  QuestionariosClient,
  QuestionarioVm,
  QuestionarioTipoResposta,
  SelectItemEnum,
  QuestionarioPerguntaOpcaoVm,
  QuestionarioPerguntaOpcaoSalvarCommand,
  QuestionarioPerguntaOpcaoSalvarOrdemCommand,
  QuestionarioPerguntaVm,
  QuestionarioPerguntaSalvarOrdemCommand,
  QuestionarioPerguntaSalvarCommand,
  QuestionarioGrupoPerguntaVm,
} from 'web-api-client';

@Component({
  templateUrl: './perguntas-form.component.html',
  styleUrls: ['./perguntas-form.component.scss'],
})
export class PerguntasFormComponent implements OnInit {
  novaPerguntaTitulo: string = '';
  tiposRespostas: SelectItemEnum[] = [];
  questionario: QuestionarioVm = <QuestionarioVm>{
    gruposPerguntas: [],
  };

  questionarioId: number;
  grupoId = 0;
  empresaId: number;
  grupo: QuestionarioGrupoPerguntaVm = <QuestionarioGrupoPerguntaVm>{};

  QuestionarioTipoRespostaEnum = QuestionarioTipoResposta;

  constructor(
    private questionariosClient: QuestionariosClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.questionarioId = +this.route.snapshot.paramMap.get('questionarioId');
    this.grupoId = +this.route.snapshot.paramMap.get('grupoId');
    //this.empresaId = +this.route.snapshot.paramMap.get('empresaId');

    this.questionariosClient
      .obterTiposRespostas()
      .subscribe((res) => (this.tiposRespostas = res));

    this.carregarQuestionario();
  }

  carregarQuestionario() {
    this.questionariosClient
      .obterPorId(this.questionarioId)
      .subscribe((res) => {
        this.questionario = res;
        this.grupo = this.questionario.gruposPerguntas.filter(
          (x) => x.id == this.grupoId
        )[0];
      });
  }

  dropOpcao(
    event: CdkDragDrop<string[]>,
    opcoes: QuestionarioPerguntaOpcaoVm[]
  ) {
    moveItemInArray(opcoes, event.previousIndex, event.currentIndex);

    let command = new QuestionarioPerguntaOpcaoSalvarOrdemCommand();
    command.opcoes = opcoes;

    this.questionariosClient
      .salvarOrdemOpcoes(this.questionarioId, command)
      .subscribe((res) => {});
  }

  dropPergunta(
    event: CdkDragDrop<string[]>,
    perguntas: QuestionarioPerguntaVm[]
  ) {
    moveItemInArray(perguntas, event.previousIndex, event.currentIndex);
    let command = new QuestionarioPerguntaSalvarOrdemCommand();
    command.perguntas = perguntas;

    this.questionariosClient
      .salvarOrdemPerguntas(this.questionarioId, command)
      .subscribe((res) => {});
  }

  novaPergunta() {
    let command = <QuestionarioPerguntaSalvarCommand>{
      titulo: this.novaPerguntaTitulo,
      tipoResposta: 0,
      questionarioGrupoPerguntaId: this.grupoId,
    };

    this.questionariosClient
      .salvarPergunta(this.questionarioId, command)
      .subscribe((res) => {
        console.log(res);
        this.novaPerguntaTitulo = '';
        this.carregarQuestionario();
      });
  }

  alterarPergunta(pergunta: QuestionarioPerguntaVm) {
    let command = <QuestionarioPerguntaSalvarCommand>{
      id: pergunta.id,
      obrigatoria: pergunta.obrigatoria,
      ordemExibicao: pergunta.ordemExibicao,
      questionarioGrupoPerguntaId: pergunta.questionarioGrupoPerguntaId,
      subtitulo: pergunta.subtitulo,
      tipoResposta: pergunta.tipoResposta,
      titulo: pergunta.titulo,
      exibirOpcaoEditavel: pergunta.exibirOpcaoEditavel,
      labelOpcaoEditavel: pergunta.labelOpcaoEditavel,
    };
    //command.op
    this.questionariosClient
      .salvarPergunta(this.questionarioId, command)
      .subscribe((res) => {
        console.log(res);
        //temp
        if (command.tipoResposta == QuestionarioTipoResposta.SimNao)
          this.carregarQuestionario();
      });
  }

  alterarOpcao(opcao: QuestionarioPerguntaOpcaoVm) {
    let opcaoCommand = opcao as QuestionarioPerguntaOpcaoSalvarCommand;
    this.questionariosClient
      .salvarOpcao(this.questionarioId, opcaoCommand)
      .subscribe((res) => {});
  }

  excluirOpcao(
    opcaoId: number,
    index: number,
    opcoes: QuestionarioPerguntaOpcaoVm[]
  ) {
    console.log(index);
    this.questionariosClient
      .excluirOpcao(this.questionarioId, opcaoId)
      .subscribe((res) => {
        opcoes.splice(index, 1);
      });
  }

  novaOpcao(event, pergunta: QuestionarioPerguntaVm) {
    var command = <QuestionarioPerguntaOpcaoSalvarCommand>{
      titulo: event.target.value,
      ordemExibicao: pergunta.opcoes.length,
      questionarioPerguntaId: pergunta.id,
    };

    this.questionariosClient
      .salvarOpcao(this.questionarioId, command)
      .subscribe((res) => {
        command.id = res;
        pergunta.opcoes.push(command);
        event.target.value = '';
        event.target.focus();
      });
  }
}
