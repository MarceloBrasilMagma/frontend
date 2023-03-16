import {
  Component,
  DoCheck,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
  DeclaracaoTrabalhoSituacao,
  DepartamentosClient,
  DepartamentoVm,
} from '../../../../../web-api-client';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PaginatedListOfPortifolioRasoVm,
  PortifoliosClient,
} from '../../../../../web-api-client';

@Component({
  selector: 'app-header-relatorios',
  templateUrl: './header-relatorios.component.html',
  styleUrls: ['./header-relatorios.component.scss'],
})
export class HeaderRelatoriosComponent implements OnInit, DoCheck {
  @Output() filtro = new EventEmitter<UntypedFormGroup>();
  filtrosForm: UntypedFormGroup;
  DeclaracaoTrabalhoSituacao = DeclaracaoTrabalhoSituacao;
  carregandoDts: boolean;
  departamentos: DepartamentoVm[];
  @Output() filtroOrcamento: EventEmitter<UntypedFormGroup> =
    new EventEmitter<UntypedFormGroup>();
  portifolioId: number;
  pageIndex = 1;
  pageSize = 50;
  carregando = false;
  filtroOrcamentoForm: UntypedFormGroup;

  portifolios = new PaginatedListOfPortifolioRasoVm();

  constructor(
    public router: Router,
    private departamentosClient: DepartamentosClient,
    private route: ActivatedRoute,
    private portifoliosClient: PortifoliosClient,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    if (!this.headerDt) {
      if (this.router.url.includes('/relatorios/orcamento')) {
        this.carregarPortifoliosOrcamento(this.pageIndex, this.pageSize);
      } else {
        this.carregarPortifolios(this.pageIndex, this.pageSize);
      }
    } else {
      this.obterDepartamentos();
      this.criarFiltrosForm();
    }
  }

  ngDoCheck(): void {
    this.portifolioId = +this.route.snapshot.queryParams['id'];
  }

  initfiltroOrcamentoForm() {
    this.filtroOrcamentoForm = this.fb.group({
      periodo: [
        [
          new Date(new Date().getFullYear(), 0, 1),
          new Date(new Date().getFullYear(), 11, 31),
        ],
      ],
      portifolioId: this.portifolios.items[0].id,
    });
    this.filtroOrcamento.emit(this.filtroOrcamentoForm.value);
    this.filtroOrcamentoForm.valueChanges.subscribe({
      next: (f) => this.filtroOrcamento.emit(f),
    });
  }

  carregarPortifolios(pageIndex: number, pageSize: number): void {
    this.carregando = true;
    this.portifoliosClient.obter(pageSize, pageIndex).subscribe({
      next: (response) => {
        this.portifolios = response;
        if (isNaN(this.portifolioId)) {
          this.portifolioId = this.portifolios.items[0].id;
        }
      },
      complete: () => {
        this.carregando = false;
        this.router.navigate([this.router.url], {
          queryParams: { id: this.portifolioId },
        });
      },
      error: (error) => console.log(error),
    });
  }
  carregarPortifoliosOrcamento(pageIndex: number, pageSize: number): void {
    this.carregando = true;
    this.portifoliosClient.obter(pageSize, pageIndex).subscribe({
      next: (response) => {
        this.portifolios = response;
        if (isNaN(this.portifolioId)) {
          this.portifolioId = this.portifolios.items[0].id;
        }
      },
      complete: () => {
        this.carregando = false;
        this.router.navigate([this.router.url], {
          queryParams: { id: this.portifolioId },
        });
        this.initfiltroOrcamentoForm();
      },
      error: (error) => console.log(error),
    });
  }

  portifolioSelecionado(portifolioId: number) {
    let portifolioDescricao = this.portifolios.items.filter(
      (p) => p.id == portifolioId
    )[0].descricao;
    return portifolioDescricao;
  }

  get headerDisplay(): boolean {
    return (
      this.router.url.includes('/relatorios/plano-acao') ||
      this.router.url.includes('/relatorios/orcamento') ||
      this.router.url.includes('/relatorios/cronograma') ||
      this.router.url.includes('/relatorios/abrangencia')
    );
  }

  get headerDt(): boolean {
    return this.router.url.includes(
      '/relatorios/declaracoes-trabalho-relatorio'
    );
  }

  criarFiltrosForm() {
    this.filtrosForm = new UntypedFormBuilder().group({
      id: [null],
      projetoNome: [null],
      departamentoId: [null],
      loginResponsavel: [null],
      nomeResponsavel: [null],
      situacao: [null],
      intervaloData: [
        [
          new Date(new Date().getFullYear(), 0, 1),
          new Date(new Date().getFullYear(), 11, 31),
        ],
      ],
    });
  }

  carregarDTs(): void {
    this.filtro.emit(this.filtrosForm);
  }

  resetForm(): void {
    sessionStorage.removeItem('filtroDT');
    this.filtrosForm.reset();
  }

  private obterDepartamentos() {
    this.departamentosClient.obter().subscribe((r) => {
      this.departamentos = r;
    });
  }

  salvarFiltro() {
    this.filtrosForm.removeControl('intervaloData');
    sessionStorage.setItem('filtroDT', JSON.stringify(this.filtrosForm.value));
  }
}
