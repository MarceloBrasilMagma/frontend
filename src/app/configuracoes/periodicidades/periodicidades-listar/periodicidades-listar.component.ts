import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import { PeriodicidadesClient, PeriodicidadeVm } from 'web-api-client';
import { PeriodicidadesEditarComponent } from '../periodicidades-editar/periodicidades-editar.component';

@Component({
  selector: 'app-periodicidades-listar',
  templateUrl: './periodicidades-listar.component.html',
  styleUrls: ['./periodicidades-listar.component.scss']
})
export class PeriodicidadesListarComponent implements OnInit {
  periodicidade: PeriodicidadeVm[];

  carregando: boolean = false;

  constructor(
    private periodicidadeClient: PeriodicidadesClient,
    private nzModalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.carregarPeriodicidade();
  }

  carregarPeriodicidade() {
    this.periodicidadeClient.obter()
      .subscribe(r => {
        this.periodicidade = r
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.carregarPeriodicidade();
  }

  excluirPeriodicidade(periodicidade?: PeriodicidadeVm) {
    this.carregando = true
    this.periodicidadeClient
      .excluir(periodicidade.id)
      .pipe(finalize(() => {
        this.carregando = false;
      }))
      .subscribe(r => {
        this.carregarPeriodicidade()
      })
  }

  exibirModalEditar(periodicidade?: PeriodicidadeVm) {
    const modal = this.nzModalService.create({
      nzContent: PeriodicidadesEditarComponent,
      nzTitle: !periodicidade ? "Criar registro" : "Editar registro",
      nzComponentParams: {
        periodicidade: periodicidade,
      },
      nzMaskClosable: false,
      nzClosable: false,
      nzWidth: '50%'
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.carregarPeriodicidade()
      }
      else {
      }
    });
  }
}
