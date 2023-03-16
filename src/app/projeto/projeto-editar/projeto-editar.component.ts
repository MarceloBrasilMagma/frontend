import { NzModalService } from 'ng-zorro-antd/modal';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import {
  PermissaoAcessoPreProjetoTipo,
  ProjetoAlterarSituacaoCommand,
  ProjetosClient,
  ProjetoVm,
  SituacaoProjeto,
  StatusProjeto,
} from 'web-api-client';
import {
  Abas,
  Componentes,
} from '../components/menu-lateral/menu-lateral.component';
import { YearReferenceService } from '../../shared/services/year-reference.service';
import { CapaComponentes } from '../components/capa/capa.component';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-projeto-editar',
  templateUrl: './projeto-editar.component.html',
  styleUrls: ['./projeto-editar.component.scss'],
})
export class ProjetoEditarComponent implements OnInit {
  projetoId: number;
  projeto: ProjetoVm;
  carregandoProjeto: boolean = false;

  exibirMenuLateral: boolean = false;

  ativoCapa: CapaComponentes = CapaComponentes.Capa;

  componenteAtivo: Componentes = Componentes.Capa;

  abas = Abas;

  abaSelecionada: Abas;

  componentes = Componentes;

  constructor(
    private route: ActivatedRoute,
    private projetosClient: ProjetosClient,
    private ano: YearReferenceService,
    private permissionsService: NgxPermissionsService,
    private nzModalService: NzModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.projetoId = +this.route.snapshot.paramMap.get('id');
    this.carregarProjeto();
  }

  atualizaProjetoStatus(status: StatusProjeto) {
    this.projeto.status = status;

    //para que os componentes filhos detectem a mudança no objeto de input
    this.projeto = <ProjetoVm>{ ...this.projeto };
  }

  carregarProjeto() {
    let anoReferencia: number = this.ano.obterAno();

    if (this.projetoId) {
      this.carregandoProjeto = true;
      this.projetosClient
        .obterPorId(this.projetoId, anoReferencia)
        .pipe(
          finalize(() => {
            this.carregandoProjeto = false;
          })
        )
        .subscribe((r) => {
          this.projeto = r;
        });
    }
  }

  fecharMenuLateral() {
    this.exibirMenuLateral = false;
  }

  abrirMenuLateral(aba: Abas) {
    this.abaSelecionada = aba;
    this.exibirMenuLateral = true;
  }

  alterarComponente(c: Componentes) {
    this.componenteAtivo = c;
    this.fecharMenuLateral();
  }

  alterarCapa(c: CapaComponentes) {
    this.ativoCapa = c;
    this.fecharMenuLateral();
  }

  get exibirCapa(): boolean {
    return this.componenteAtivo === Componentes.Capa;
  }

  get exibirDiarioBordo(): boolean {
    return this.componenteAtivo === Componentes.DiarioBordo;
  }

  get exibirDadosProjeto(): boolean {
    return this.componenteAtivo === Componentes.DadosProjeto;
  }

  get exibirPlanoAcao(): boolean {
    return this.componenteAtivo === Componentes.PlanoAcao;
  }

  get exibirCentroCusto(): boolean {
    return this.componenteAtivo === Componentes.CentroCusto;
  }

  get exibirOrcamentos(): boolean {
    return this.componenteAtivo === Componentes.Orcamentos;
  }

  get exibirCronograma(): boolean {
    return this.componenteAtivo === Componentes.Cronograma;
  }

  get exibirCronogramaProject(): boolean {
    return this.componenteAtivo === Componentes.CronogramaProject;
  }

  get exibirLicoesAprendidas(): boolean {
    return this.componenteAtivo === Componentes.LicoesAprendidas;
  }

  get mostrarCronograma(): boolean {
    return this.ativoCapa === CapaComponentes.Cronograma;
  }

  get mostrarOrcamentos(): boolean {
    return this.ativoCapa === CapaComponentes.Orcamentos;
  }

  possuiPermissaoEditar(permissoes: string[]): boolean {
    if (
      this.projeto?.preProjeto?.permissaoUsuarioLogado ==
      PermissaoAcessoPreProjetoTipo.AcessoTotal
    ) {
      return true;
    }

    let possuiPermissao = false;

    if (permissoes == null) possuiPermissao;

    let permissions = this.permissionsService.getPermissions();

    permissoes.forEach((element) => {
      if (element in permissions) {
        possuiPermissao = true;
        return;
      }
    });

    return possuiPermissao;
  }

  alterarSituacaoProjeto(situacao: SituacaoProjeto) {
    let req = <ProjetoAlterarSituacaoCommand>{
      id: this.projeto.id,
      situacao: situacao,
    };
    this.projetosClient.alterarSituacao(req).subscribe((r) => {
      this.projeto.situacao = r.situacao;
      this.carregarProjeto();
    });
  }

  verificarTap() {
    {
      if (this.projeto.situacao == SituacaoProjeto.ProjetoAberto) {
        this.validarAprovacaoTap();
      } else if (
        this.projeto.situacao == SituacaoProjeto.AguardandoAprovacaoTap
      ) {
        this.nzModalService.confirm({
          nzTitle: 'Deseja aprovar a TAP?',
          nzContent: '',
          nzOnOk: () => {
            this.alterarSituacaoProjeto(SituacaoProjeto.TapConcluido);
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this.router.navigate(['projetos/editar', this.projeto.id]);
              });
          },
        });
      }
    }
  }

  validarAprovacaoTap() {
    if (
      !this.projeto.escopoDoProjeto &&
      !this.projeto.objetivoDoProjeto &&
      !this.projeto.premissasDoProjeto &&
      !this.projeto.restricoesDoProjeto &&
      !this.projeto.riscosDoProjeto &&
      !this.projeto.comentarios
    ) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Preencha os dados de projeto para solicitar a Aprovação da TAP',
      });
    } else if (this.projeto.riscoVm.length == 0) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Preencha os riscos do projeto para solicitar a Aprovação da TAP',
      });
    } else if (this.projeto.planoDeComunicacaoVm.length == 0) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Preencha o plano de comunicação para solicitar a Aprovação da TAP',
      });
    } else if (this.projeto.equipesProjeto.length == 0) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Preencha a equipe do projeto para solicitar a Aprovação da TAP',
      });
    } else {
      this.nzModalService.confirm({
        nzTitle: 'Deseja solicitar aprovação da TAP?',
        nzContent: '',
        nzOnOk: () => {
          this.alterarSituacaoProjeto(SituacaoProjeto.AguardandoAprovacaoTap);
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate(['projetos/editar', this.projeto.id]);
            });
        },
      });
    }
  }
}
