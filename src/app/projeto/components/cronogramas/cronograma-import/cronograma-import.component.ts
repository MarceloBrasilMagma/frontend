import { Component, Input, OnInit } from '@angular/core';
import { CronogramasClient, TarefaVm } from 'web-api-client';

@Component({
  selector: 'app-cronograma-import',
  templateUrl: './cronograma-import.component.html',
  styleUrls: ['./cronograma-import.component.scss'],
})
export class CronogramaImportComponent implements OnInit {
  @Input() projetoId: number;
  @Input() tarefasInput: TarefaVm[];

  enviandoArquivo: boolean;

  tarefas: Tarefa;

  tarefasResponse: TarefaVm[];
  tarefasOrdenadas: Tarefa[];

  count = 0;

  carinha: string;

  constructor(private cronogramasClient: CronogramasClient) {}

  ngOnInit(): void {
    if (!!this.tarefasInput) {
      this.tarefas = new Tarefa();
      this.tarefas.tarefa = this.tarefasInput.find((x) => {
        return !x.tarefaPaiId;
      });
      this.preencherTarefas(this.tarefasInput, this.tarefas, 0);
      this.tarefasOrdenadas = this.ordenar(this.tarefas);
      this.preencherPredecessor();
    } else {
      this.carregarCronogramas();
    }
  }

  carregarCronogramas() {
    this.cronogramasClient
      .obterTarefaPorProjetoId(this.projetoId)
      .subscribe((r) => {
        this.tarefasResponse = r;
        if (r.length > 0) {
          this.tarefas = new Tarefa();
          this.tarefas.tarefa = r.find((x) => {
            return !x.tarefaPaiId;
          });
          this.preencherTarefas(r, this.tarefas, 0);
          this.tarefasOrdenadas = this.ordenar(this.tarefas);
          this.preencherPredecessor();
        }
      });
  }

  preencherTarefas(t: TarefaVm[], tarefa: Tarefa, depth: number) {
    tarefa.depth = depth++;
    tarefa.childs = t
      .filter((x) => {
        return x.tarefaPaiId === tarefa.tarefa.id;
      })
      .map((y) => {
        return <Tarefa>{ tarefa: y, childs: [] };
      });
    for (let tar of tarefa.childs) {
      this.preencherTarefas(t, tar, depth);
    }
  }

  ordenar(tarefa: Tarefa): Tarefa[] {
    tarefa.numero = ++this.count;
    let list = [tarefa];
    for (let t of tarefa.childs) {
      list = list.concat(this.ordenar(t));
    }
    return list;
  }

  preencherPredecessor() {
    for (let t of this.tarefasOrdenadas) {
      t.predecessor = this.tarefasOrdenadas.find((x) => {
        return x.tarefa.id === t.tarefa.predecessorId;
      })?.numero;
    }
  }

  getArray(depth) {
    return new Array(depth * 3);
  }

  getCorIndicador(revisado: number, realizado: number) {
    if (revisado === 100 && realizado !== 100) {
      this.carinha = 'frown';
      return 'color: red; background-color: rgba(128, 0, 0, 0.182);';
    } else if (revisado <= realizado) {
      this.carinha = 'smile';
      return 'color: green; background-color: rgba(0, 128, 0, 0.182);';
    } else if (revisado > realizado && revisado !== 100) {
      this.carinha = 'meh';
      return 'color: rgb(121, 121, 0); background-color: rgba(255, 255, 0, 0.581);';
    }
  }
}

class Tarefa {
  tarefa: TarefaVm;
  childs: Tarefa[];
  depth: number;
  numero: number;
  predecessor: number;
}
