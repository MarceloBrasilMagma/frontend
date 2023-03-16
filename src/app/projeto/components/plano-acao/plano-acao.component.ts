import { Component, Input, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import { AnosPlurianualidade, FollowUp, PaginatedListOfPlanoAcaoVm, PlanoAcaoObterPorProjetoQuery, PlanoAcaoVm, PlanosAcaoClient, StatusProjeto } from 'web-api-client';
import { PlanoAcaoFormComponent } from './plano-acao-form/plano-acao-form.component';

@Component({
  selector: 'app-plano-acao',
  templateUrl: './plano-acao.component.html',
  styleUrls: ['./plano-acao.component.scss']
})
export class PlanoAcaoComponent implements OnInit {
  @Input() projetoId: number;
  @Input() statusProjeto: StatusProjeto;
  @Input() possuiPermissaoEditar: boolean;

  planosAcao: PaginatedListOfPlanoAcaoVm;

  pageIndex: number = 1;
  pageSize: number = 10;

  carregando: boolean = false;

  constructor(
    private planosAcaoClient: PlanosAcaoClient,
    private nzModalService: NzModalService,
    private ano: YearReferenceService
  ) { }

  ngOnInit(): void {
    this.carregarPlanosAcao(1, this.pageSize);
  }

  carregarPlanosAcao(pageIndex: number, pageSize: number) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    let anoReferencia: number = this.ano.obterAno()

    let req = <PlanoAcaoObterPorProjetoQuery>{
      pageIndex: pageIndex,
      pageSize: pageSize,
      projetoId: this.projetoId,
      ano: anoReferencia
    }

    this.planosAcaoClient.obterPorProjetoId(req)
      .subscribe(r => {
        this.planosAcao = r
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.carregarPlanosAcao(pageIndex, pageSize);
  }

  excluirPlanosAcao(planoAcao?: PlanoAcaoVm) {
    this.carregando = true;
    this.planosAcaoClient
      .excluir(planoAcao.id)
      .pipe(finalize(() => {
        this.carregando = false;
      }))
      .subscribe(r => {
        this.carregarPlanosAcao(1, this.pageSize)
      })
  }

  exibirModalEditar(planoAcao?: PlanoAcaoVm) {
    const modal = this.nzModalService.create({
      nzContent: PlanoAcaoFormComponent,
      nzTitle: !planoAcao ? "Criar registro" : "Editar registro",
      nzComponentParams: {
        planoAcao: planoAcao,
        projetoId: this.projetoId
      },
      nzMaskClosable: false,
      nzClosable: false,
      nzWidth: '50%'
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.carregarPlanosAcao(1, this.pageSize)
      }
      else {
      }
    });
  }

  corStatus(planosAcao: PlanoAcaoVm): string {
    switch (planosAcao.followUp) {
      case FollowUp.Atrasado:
        return "red";
      case FollowUp.Cancelado:
        return "gray";
      case FollowUp.EmAndamento:
        return "gold";
      case FollowUp.Realizado:
        return "green";
    }
  }

  get desabilitaBotoes(): boolean{
    return this.statusProjeto !== StatusProjeto.Ativo;
  }
}
