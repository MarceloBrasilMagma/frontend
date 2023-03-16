import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import { EquipeProjetoFuncaoClient, EquipeProjetoFuncaoObterTodosQuery, EquipeProjetoFuncaoVm, PaginatedListOfEquipeProjetoFuncaoVm } from 'web-api-client';
import { EquipesProjetosEditarComponent } from '../equipes-projetos-editar/equipes-projetos-editar.component';

@Component({
  selector: 'app-equipes-projetos-listar',
  templateUrl: './equipes-projetos-listar.component.html',
  styleUrls: ['./equipes-projetos-listar.component.scss']
})
export class EquipesProjetosListarComponent implements OnInit {
  funcaoProjeto: PaginatedListOfEquipeProjetoFuncaoVm;

  pageIndex: number = 1;
  pageSize: number = 10;

  carregando: boolean = false;

  constructor(
    private funcaoClient: EquipeProjetoFuncaoClient,
    private nzModalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.carregarFuncao(1, this.pageSize);
  }

  carregarFuncao(pageIndex: number, pageSize: number) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    let req = <EquipeProjetoFuncaoObterTodosQuery>{
      pageIndex: pageIndex,
      pageSize: pageSize,
    }

    this.funcaoClient.obter(req)
      .subscribe(r => {
        this.funcaoProjeto = r
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.carregarFuncao(pageIndex, pageSize);
  }

  excluirFuncaoProjeto(funcaoProjeto?: EquipeProjetoFuncaoVm) {
    this.carregando = true
    this.funcaoClient
      .excluir(funcaoProjeto.id)
      .pipe(finalize(() => {
        this.carregando = false;
      }))
      .subscribe(r => {
        this.carregarFuncao(1, this.pageSize)
      })
  }

  exibirModalEditar(funcaoProjeto?: EquipeProjetoFuncaoVm) {
    const modal = this.nzModalService.create({
      nzContent: EquipesProjetosEditarComponent,
      nzTitle: !funcaoProjeto ? "Criar registro" : "Editar registro",
      nzComponentParams: {
        funcaoProjeto: funcaoProjeto,
      },
      nzMaskClosable: false,
      nzClosable: false,
      nzWidth: '50%'
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.carregarFuncao(1, this.pageSize)
      }
      else {
      }
    });
  }
}
