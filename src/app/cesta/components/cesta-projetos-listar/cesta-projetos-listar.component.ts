import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import {
  CestaIncluirPreProjetoProjetoOuPlurianualCommand,
  CestasClient,
  PreProjetoVm,
  ProjetoPlurianualVm,
  ProjetoSelecaoPortifolioVm,
} from 'web-api-client';

@Component({
  selector: 'app-cesta-projetos-listar',
  templateUrl: './cesta-projetos-listar.component.html',
  styleUrls: ['./cesta-projetos-listar.component.scss'],
})
export class CestaProjetosListarComponent implements OnInit {
  @Input() cestaCarregada;

  projetos: (PreProjetoVm | ProjetoPlurianualVm)[] = [];
  isVisible = false;
  buscandoProjetos = false;
  isOkLoading = false;
  pageIndex = 1;
  pageSize = 50;
  projetosNaoInclusos: ProjetoSelecaoPortifolioVm[];

  cestaId = +this.route.snapshot.paramMap.get('id');

  form: UntypedFormGroup;

  constructor(
    private route: ActivatedRoute,
    private cestasClient: CestasClient,
    private nzNotificationService: NzNotificationService,
    private nzModalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.cestaCarregada.preProjetos.forEach((projeto) => {
      Object.assign(projeto, {
        projetoDA: 0,
        projetoCusto: 0,
        projetoValorInvestimento: 0,
        projetoTotal: 0,
      });

      projeto.orcamentos.forEach((orcamento) => {
        projeto['projetoDA'] += orcamento.valorDespesaAdministrativa;
        projeto['projetoCusto'] += orcamento.valorCustoAssistencial;
        projeto['projetoValorInvestimento'] += orcamento.valorInvestimento;
        projeto['projetoTotal'] += orcamento.total;
      });
    });

    this.cestaCarregada.projetosPlurianuais.forEach((projeto) => {
      projeto['plurianual'] = true;
      Object.assign(projeto, {
        projetoDA: 0,
        projetoCusto: 0,
        projetoValorInvestimento: 0,
        projetoTotal: 0,
      });

      projeto.orcamentos.forEach((orcamento) => {
        projeto['projetoDA'] += orcamento.valorDespesaAdministrativa;
        projeto['projetoCusto'] += orcamento.valorCustoAssistencial;
        projeto['projetoValorInvestimento'] += orcamento.valorInvestimento;
        projeto['projetoTotal'] += orcamento.total;
      });
    });

    this.projetos.push(
      ...this.cestaCarregada.preProjetos,
      ...this.cestaCarregada.projetosPlurianuais
    );
  }

  initForm() {
    this.form = new UntypedFormBuilder().group({
      cestaId: [null, Validators.required],
      itens: [null, Validators.required],
    });
  }

  obterProjetosNaoInclusos() {
    this.cestasClient.obterPreProjetosParaVincular().subscribe((response) => {
      this.projetosNaoInclusos = response;
    });
  }

  obterProjetos() {
    this.buscandoProjetos = true;
    this.cestasClient.obterPorId(this.cestaId).subscribe((response) => {
      this.buscandoProjetos = false;

      response.preProjetos.forEach((projeto) => {
        projeto['plurianual'] = true;
        Object.assign(projeto, {
          projetoDA: 0,
          projetoCusto: 0,
          projetoValorInvestimento: 0,
        });

        projeto.orcamentos.forEach((orcamento) => {
          projeto['projetoDA'] += orcamento.valorDespesaAdministrativa;
          projeto['projetoCusto'] += orcamento.valorCustoAssistencial;
          projeto['projetoValorInvestimento'] += orcamento.valorInvestimento;
        });
      });

      response.projetosPlurianuais.forEach((projeto) => {
        projeto['plurianual'] = true;
        Object.assign(projeto, {
          projetoDA: 0,
          projetoCusto: 0,
          projetoValorInvestimento: 0,
          projetoTotal: 0,
        });

        projeto.orcamentos.forEach((orcamento) => {
          projeto['projetoDA'] += orcamento.valorDespesaAdministrativa;
          projeto['projetoCusto'] += orcamento.valorCustoAssistencial;
          projeto['projetoValorInvestimento'] += orcamento.valorInvestimento;
        });
      });

      this.projetos = [];

      this.projetos.push(
        ...response.preProjetos,
        ...response.projetosPlurianuais
      );
    });
  }

  incluirProjeto(): void {
    let itens = this.form.get('itens').value;

    if (this.form.get('itens').value == null) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent: 'Selecione pelo menos um projeto.',
      });
    }

    this.cestasClient
      .incluirPreProjetosPlurianuais(
        new CestaIncluirPreProjetoProjetoOuPlurianualCommand({
          cestaId: this.cestaId,
          itens: [...itens],
        })
      )
      .pipe(
        finalize(() => {
          this.isVisible = false;
          this.isOkLoading = false;
        })
      )
      .subscribe(() => {
        if (itens.length > 1) {
          this.nzNotificationService.success(
            'Projetos adicionados com sucesso!',
            ''
          );
        } else if (itens.length == 1) {
          this.nzNotificationService.success(
            'Projeto adicionado com sucesso!',
            ''
          );
        }
        this.obterProjetos();
        this.initForm();
      });
  }

  showModal(): void {
    this.isVisible = true;
    this.obterProjetosNaoInclusos();
  }

  handleCancel(): void {
    this.isVisible = false;
  }
}
