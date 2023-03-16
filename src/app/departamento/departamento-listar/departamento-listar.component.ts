import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { DepartamentosClient, DepartamentoVm } from 'web-api-client';

@Component({
  selector: 'app-departamento-listar',
  templateUrl: './departamento-listar.component.html',
  styleUrls: ['./departamento-listar.component.scss'],
})
export class DepartamentoListarComponent implements OnInit {
  filtrosForm: UntypedFormGroup;

  departamentos = <DepartamentoVm[]>[];
  departamentosFull = <DepartamentoVm[]>[];

  carregandoDepartamentos: boolean;

  pageIndex = 1;
  pageSize = 10;

  constructor(private departamentosClient: DepartamentosClient) {}

  ngOnInit(): void {
    this.initFiltrosForm();
    this.carregarDepartamentos();
  }

  private initFiltrosForm() {
    this.filtrosForm = new UntypedFormBuilder().group({
      sigla: [null],
      nome: [null],
      nomeGestor: [null],
    });
  }

  resetForm(): void {
    this.filtrosForm.reset();
    this.departamentos = this.departamentosFull;
  }

  carregarDepartamentos() {
    this.departamentosClient.obter().subscribe((r) => {
      this.departamentos = r;
      this.departamentosFull = r;
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pageIndex = params['pageIndex'];
    this.pageSize = params['pageSize'];
  }

  filtrar() {
    let fValue = this.filtrosForm.value;
    this.departamentos = this.departamentosFull;

    if (fValue['sigla'] != null)
      this.departamentos = this.departamentos.filter((x) => {
        return !x.sigla ? false : (
          x.sigla
            .toLowerCase()
            .indexOf((<string>fValue['sigla']).toLowerCase()) >= 0
        );
      });

    if (fValue['nome'] != null)
      this.departamentos = this.departamentos.filter((x) => {
        return !x.nome ? false : (
          x.nome
            .toLowerCase()
            .indexOf((<string>fValue['nome']).toLowerCase()) >= 0
        );
      });

    if (fValue['nomeGestor'] != null)
      this.departamentos = this.departamentos.filter((x) => {
        return !x.nomeGestor ? false : (
          x.nomeGestor
            .toLowerCase()
            .indexOf((<string>fValue['nomeGestor']).toLowerCase()) >= 0
        );
      });
  }
}
