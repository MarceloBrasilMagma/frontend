import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import { IndicadoresAvaliacaoClient, PaginatedListOfPerguntaIndicadorVm, PerguntaIndicadorObterTodosQuery, PerguntaIndicadorVm } from 'web-api-client';
import { IndicadoresFormComponent } from '../indicadores-form/indicadores-form.component';

@Component({
  selector: 'app-indicadores-listar',
  templateUrl: './indicadores-listar.component.html',
  styleUrls: ['./indicadores-listar.component.scss']
})
export class IndicadoresListarComponent implements OnInit {

  perguntas: PaginatedListOfPerguntaIndicadorVm
  pageIndex: number = 1;
  pageSize: number = 10;

  carregando: boolean = false;

  constructor(
    private indicadoresClient: IndicadoresAvaliacaoClient,
    private nzModalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.carregarindicadores(1, this.pageSize);
  }

  carregarindicadores(pageIndex: number, pageSize: number) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    let req = <PerguntaIndicadorObterTodosQuery>{
      pageIndex: pageIndex,
      pageSize: pageSize,
    }

    this.indicadoresClient.obterTodasPerguntas(req)
      .subscribe(r => {
        this.perguntas = r
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.carregarindicadores(pageIndex, pageSize);
  }

  excluirPerguta(perguntaIndicador?: PerguntaIndicadorVm) {
    this.carregando = true
    this.indicadoresClient
      .excluirPergunta(perguntaIndicador.id)
      .pipe(finalize(() => {
        this.carregando = false;
      }))
      .subscribe(r => {
        this.carregarindicadores(1, this.pageSize)
      })
  }

  exibirModalEditar(perguntaIndicador?: PerguntaIndicadorVm) {
    const modal = this.nzModalService.create({
      nzContent: IndicadoresFormComponent,
      nzTitle: !perguntaIndicador ? "Criar registro" : "Editar registro",
      nzComponentParams: {
        perguntaIndicador: perguntaIndicador
      },
      nzMaskClosable: false,
      nzClosable: false,
      nzWidth: '50%'
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.carregarindicadores(1, this.pageSize)
      }
      else {
      }
    });
  }
}
