import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import { Componentes } from 'src/app/projeto/components/menu-lateral/menu-lateral.component';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import {
  PaginatedListOfQuestionarioVm,
  QuestionariosClient,
  QuestionariosObterQuery,
  QuestionarioVm,
  TipoQuestionario,
} from 'web-api-client';

@Component({
  selector: 'app-questionario-listar',
  templateUrl: './questionario-listar.component.html',
  styleUrls: ['./questionario-listar.component.scss'],
})
export class QuestionarioListarComponent implements OnInit {
  pageIndex = 1;
  pageSize = 10;
  questionarios = new PaginatedListOfQuestionarioVm();
  carregando = false;
  TipoQuestionario = TipoQuestionario;
  projetoId: number;
  preProjetoId: number;
  projetoPlurianualId: number;

  constructor(
    private questionariosClient: QuestionariosClient,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.router.url.split('/').includes('projetos'))
      this.projetoId = +this.route.snapshot.paramMap.get('id');
    else if (this.router.url.split('/').includes('pre-projetos'))
      this.preProjetoId = +this.route.snapshot.paramMap.get('id');
    else if (this.router.url.split('/').includes('projetos-plurianuais'))
      this.projetoPlurianualId = +this.route.snapshot.paramMap.get('id');
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
    this.questionariosClient
      .obter(<QuestionariosObterQuery>{
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        projetoId: this.projetoId,
        preProjetoId: this.preProjetoId,
        projetoPlurianualId: this.projetoPlurianualId,
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

  desabilitarPreenchimento(questionario: QuestionarioVm) {
    if (
      questionario.tipo === TipoQuestionario.Unico &&
      questionario.questionarioPreenchimentos.length > 0
    )
      return true;

    if (
      questionario.questionarioPreenchimentos.filter(
        (x) => x.usuario.login === this.authenticationService.loginUsuarioLogado
      ).length > 0
    )
      return true;

    return false;
  }
}
