import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import {
  PaginatedListOfQuestionarioPreenchimentoVm,
  QuestionarioPreenchimentoObterQuery,
  QuestionarioPreenchimentosClient,
} from 'web-api-client';

@Component({
  selector: 'app-questionario-preenchimento-listar',
  templateUrl: './questionario-preenchimento-listar.component.html',
  styleUrls: ['./questionario-preenchimento-listar.component.scss'],
})
export class QuestionarioPreenchimentoListarComponent implements OnInit {
  pageIndex = 1;
  pageSize = 10;
  questionariosPreenchimento = new PaginatedListOfQuestionarioPreenchimentoVm();
  carregando = false;
  questionarioId: number;

  constructor(
    private questionarioPreenchimentosClient: QuestionarioPreenchimentosClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.questionarioId = +this.route.snapshot.paramMap.get('questionarioId');
  }

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
    //       'Verifique o formulário e preencha corretamenta os campos',
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
    this.questionarioPreenchimentosClient
      .obter(<QuestionarioPreenchimentoObterQuery>{
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        questionarioId: this.questionarioId,
      })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe((r) => {
        this.questionariosPreenchimento = r;
      });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.carregarQuestionarios(pageIndex, pageSize);
  }
}
