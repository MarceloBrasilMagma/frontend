import { Component, Input, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import { AnosPlurianualidade, LicaoAprendidaClient, LicaoAprendidaObterPorProjetoQuery, LicaoAprendidaVm, PaginatedListOfLicaoAprendidaVm, StatusProjeto } from 'web-api-client';
import { LicaoAprendidaFormComponent } from './licao-aprendida-form/licao-aprendida-form.component';

@Component({
  selector: 'app-licao-aprendida',
  templateUrl: './licao-aprendida.component.html',
  styleUrls: ['./licao-aprendida.component.scss']
})
export class LicaoAprendidaComponent implements OnInit {
  @Input() projetoId: number;
  @Input() statusProjeto: StatusProjeto;
  @Input() possuiPermissaoEditar: boolean;

  licoesAprendidas: PaginatedListOfLicaoAprendidaVm;

  pageIndex: number = 1;
  pageSize: number = 10;

  carregando: boolean = false;

  constructor(
    private licoesClient: LicaoAprendidaClient,
    private nzModalService: NzModalService,
    private ano: YearReferenceService
  ) { }

  ngOnInit(): void {
    this.carregarLicoes(1, this.pageSize);
  }

  carregarLicoes(pageIndex: number, pageSize: number) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    let anoReferencia = this.ano.obterAno()

    let req = <LicaoAprendidaObterPorProjetoQuery>{
      pageIndex,
      pageSize,
      projetoId: this.projetoId,
      ano: anoReferencia
    }

    this.licoesClient.obterPorProjetoId(req)
      .subscribe(r => {
        this.licoesAprendidas = r
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.carregarLicoes(pageIndex, pageSize);
  }

  excluirLicoesAprendidas(licaoAprendida?: LicaoAprendidaVm) {
    this.carregando = true
    this.licoesClient
      .excluir(licaoAprendida.id)
      .pipe(finalize(() => {
        this.carregando = false;
      }))
      .subscribe(r => {
        this.carregarLicoes(1, this.pageSize)
      })
  }

  exibirModalEditar(licaoAprendida?: LicaoAprendidaVm) {
    const modal = this.nzModalService.create({
      nzContent: LicaoAprendidaFormComponent,
      nzTitle: !licaoAprendida ? "Criar registro" : "Editar registro",
      nzComponentParams: {
        licaoAprendida: licaoAprendida,
        projetoId: this.projetoId
      },
      nzMaskClosable: false,
      nzClosable: false,
      nzWidth: '50%'
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.carregarLicoes(1, this.pageSize)
      }
      else {
      }
    });
  }

  get desabilitaBotoes(): boolean{
    return this.statusProjeto !== StatusProjeto.Ativo;
  }
}
