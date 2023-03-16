import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import { ObjetivoEstrategicoVm, ObjetivosEstrategicosClient } from 'web-api-client';
import { ObjetivosEstrategicosEditarComponent } from '../objetivos-estrategicos-editar/objetivos-estrategicos-editar.component';

@Component({
  selector: 'app-objetivos-estrategicos-listar',
  templateUrl: './objetivos-estrategicos-listar.component.html',
  styleUrls: ['./objetivos-estrategicos-listar.component.scss']
})
export class ObjetivosEstrategicosListarComponent implements OnInit {
  objetivos: ObjetivoEstrategicoVm[];

  pageIndex: number = 1;
  pageSize: number = 10;

  carregando: boolean = false;

  constructor(
    private objetivoClient: ObjetivosEstrategicosClient,
    private nzModalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.carregarObjetivo(1, this.pageSize);
  }

  carregarObjetivo(pageIndex: number, pageSize: number) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    this.objetivoClient.obter()
      .subscribe(r => {
        this.objetivos = r
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.carregarObjetivo(pageIndex, pageSize);
  }

  excluirObjetivoProjeto(objetivo?: ObjetivoEstrategicoVm) {
    this.carregando = true
    this.objetivoClient
      .excluir(objetivo.id)
      .pipe(finalize(() => {
        this.carregando = false;
      }))
      .subscribe(r => {
        this.carregarObjetivo(1, this.pageSize)
      })
  }

  exibirModalEditar(objetivo?: ObjetivoEstrategicoVm) {
    const modal = this.nzModalService.create({
      nzContent: ObjetivosEstrategicosEditarComponent,
      nzTitle: !objetivo ? "Criar registro" : "Editar registro",
      nzComponentParams: {
        objetivo: objetivo,
        objetivos: this.objetivos
      },
      nzMaskClosable: false,
      nzClosable: false,
      nzWidth: '50%'
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.carregarObjetivo(1, this.pageSize)
      }
      else {
      }
    });
  }

  getObjetivoPai(objetivoPaiId: number){
    return this.objetivos.find(x => {return x.id == objetivoPaiId})?.descricao
  }

}
