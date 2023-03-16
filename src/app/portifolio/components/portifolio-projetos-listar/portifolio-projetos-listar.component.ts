import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { finalize } from 'rxjs/operators';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import { PaginatedListOfProjetoVm, PortifolioIncluirPreProjetoProjetoOuPlurianualCommand, PortifolioIncluirPreProjetoProjetoOuPlurianualDto, PortifoliosClient, PreProjetoVm, ProjetoPlurianualVm, ProjetosClient, StatusCronograma } from 'web-api-client';

@Component({
  selector: 'app-portifolio-projetos-listar',
  templateUrl: './portifolio-projetos-listar.component.html',
  styleUrls: ['./portifolio-projetos-listar.component.scss']
})
export class PortifolioProjetosListarComponent implements OnInit {

  projetos: (PreProjetoVm|ProjetoPlurianualVm)[] = [];
  @Input() portifolioCarregado;
    
  buscandoProjetos = false;
      
  portifolioId = +this.route.snapshot.paramMap.get('id');

  form: UntypedFormGroup;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portifoliosClient: PortifoliosClient,
    private ano: YearReferenceService
  ) { }

  ngOnInit(): void {
    this.obterProjetos()
  }
  
  obterProjetos() {
    this.portifolioCarregado.projetosPlurianuais.forEach(projeto => {
      projeto['plurianual'] = true;
      Object.assign(projeto, {
        totalDA: 0,
        totalCustoAssistencial: 0,
        totalInvestimento: 0
      });
      projeto.orcamentos.forEach(orcamento => {
        projeto.totalDA += orcamento.valorDespesaAdministrativa;
        projeto.totalCustoAssistencial += orcamento.valorCustoAssistencial;
        projeto.totalInvestimento += orcamento.valorInvestimento;
      });
    });

    this.portifolioCarregado.preProjetos.forEach(projeto => {
      Object.assign(projeto, {
        totalDA: 0,
        totalCustoAssistencial: 0,
        totalInvestimento: 0
      });
      projeto.orcamentos.forEach(orcamento => {
        projeto.totalDA += orcamento.valorDespesaAdministrativa;
        projeto.totalCustoAssistencial += orcamento.valorCustoAssistencial;
        projeto.totalInvestimento += orcamento.valorInvestimento;
      });
    });

    this.projetos.push(...this.portifolioCarregado.preProjetos, ...this.portifolioCarregado.projetosPlurianuais);
  }

  irParaProjeto(projeto) {
    if(projeto.plurianual == true) {
      this.router.navigate(["/projetos-plurianuais/editar/", projeto.id]);
    } else {
      this.router.navigate(["/projetos/editar/", projeto.projetoId], {queryParams: { ano: this.ano.obterAno() }});
    }
  }

  exibirStatusCronograma(statusCronograma: StatusCronograma){
    switch (statusCronograma) {
      case StatusCronograma.Vermelho:
        return "Fora do Prazo";
        break;
      case StatusCronograma.Amarelo:
        return "Atrasado";
        break;
      case StatusCronograma.Verde:
        return "Dentro do Prazo";
        break;
      default:
        return "Iniciação Futura";
        break;
    }
  }

}
