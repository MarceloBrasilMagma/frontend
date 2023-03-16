import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import {
  PaginatedListOfQuestionarioModeloVm,
  QuestionariosClient,
  QuestionariosModeloObterQuery,
} from 'web-api-client';

@Component({
  templateUrl: './questionario-modelo-listar.component.html',
  styleUrls: ['./questionario-modelo-listar.component.scss'],
})
export class QuestionarioModeloListarComponent implements OnInit {
  pageIndex = 1;
  pageSize = 10;
  questionarios = new PaginatedListOfQuestionarioModeloVm();
  carregando = false;

  constructor(private questionariosClient: QuestionariosClient) {}

  ngOnInit(): void {}

  carregarQuestionarios(
    pageIndex: number = this.pageIndex,
    pageSize: number = this.pageSize
  ): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    // if (this.filtrosForm.invalid) {
    //   for (const key in this.filtrosForm.controls) {
    //     this.filtrosForm.controls[key].markAsDirty();
    //     this.filtrosForm.controls[key].updateValueAndValidity();
    //   }
    //   this.modalService.warning({
    //     nzTitle: 'Atenção',
    //     nzContent:
    //       'Verifique o formulário e preencha corretamente os campos',
    //   });
    //   return;
    // }

    //let filtros = this.filtrosForm.value;

    // let req = new QuestionariosObterQuery({
    //   pageIndex,
    //   pageSize,
    //   ...(filtros as any),
    // });

    this.carregando = true;
    this.questionariosClient
      .obterModelo(<QuestionariosModeloObterQuery>{
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
      })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe((r) => {
        this.questionarios = r;
      });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.carregarQuestionarios(pageIndex, pageSize);
  }
}
