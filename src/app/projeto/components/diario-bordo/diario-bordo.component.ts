import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NgxPermissionsService } from 'ngx-permissions';
import { finalize } from 'rxjs/operators';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import { DiarioBordoObterPorProjetoQuery, DiarioBordoVm, DiariosBordoClient, PaginatedListOfDiarioBordoVm, ProjetoVm, StatusCronograma, StatusProjeto, TipoDiario } from 'web-api-client';
import { DiarioBordoFormComponent } from './diario-bordo-form/diario-bordo-form.component';

@Component({
  selector: 'app-diario-bordo',
  templateUrl: './diario-bordo.component.html',
  styleUrls: ['./diario-bordo.component.scss']
})
export class DiarioBordoComponent implements OnInit, OnDestroy, OnChanges {

  @Input() projetoId: number;
  @Input() projeto: ProjetoVm;
  @Input() possuiPermissaoEditar: boolean;
  @Output() recarregarEvent = new EventEmitter<void>();

  diariosBordo: PaginatedListOfDiarioBordoVm;

  pageIndex: number = 1;
  pageSize: number = 10;

  carregando: boolean = false;

  tipoDiario = TipoDiario
  constructor(
    private diariosBordoClient: DiariosBordoClient,
    private nzModalService: NzModalService,
    private ano: YearReferenceService,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnInit(): void {
    this.carregarDiarios(1, this.pageSize)
  }

  ngOnDestroy(): void { }

  carregarDiarios(pageIndex: number, pageSize: number) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    let anoReferencia: number = this.ano.obterAno()

    let req = <DiarioBordoObterPorProjetoQuery>{
      pageIndex,
      pageSize,
      projetoId: this.projetoId,
      anoReferencia
    }
        
    this.carregando = true;

    this.diariosBordoClient.obterPorProjetoId(req)
      .pipe(finalize(() => {
        this.carregando = false;
      }))
      .subscribe(r => {
        this.diariosBordo = r
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.carregarDiarios(pageIndex, pageSize);
  }

  excluirDiario(diarioBordo?: DiarioBordoVm) {
    this.carregando = true;
    this.diariosBordoClient
      .excluir(diarioBordo.id)
      .pipe(finalize(() => {
        this.carregando = false;
      }))
      .subscribe(r => {
        this.recarregarEvent.emit()
      })
  }

  exibirModalEditar(diarioBordo?: DiarioBordoVm) {
    const modal = this.nzModalService.create({
      nzContent: DiarioBordoFormComponent,
      nzTitle: !diarioBordo ? "Criar evento" : "Editar evento",
      nzComponentParams: {
        diario: diarioBordo,
        projetoId: this.projetoId,
        projeto: this.projeto
      },
      nzMaskClosable: false,
      nzClosable: false,
      nzWidth: '50%'
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.recarregarEvent.emit()
      }
      else {
      }
    });
  }

  corStatus(diario: DiarioBordoVm): string {
    switch (diario.cronograma.status) {
      case StatusCronograma.Vermelho:
        return "red";
      case StatusCronograma.Amarelo:
        return "gold";
      case StatusCronograma.Verde:
        return "green";
      default:
        return "green";
    }
  }

  get desabilitarEdicao(): boolean{
    return !this.possuiPermissaoEditar || this.projeto.status !== StatusProjeto.Ativo;
  }
}
