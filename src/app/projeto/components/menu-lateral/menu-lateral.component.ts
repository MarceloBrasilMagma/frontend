import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import { AnosPlurianualidade, ProjetoAlterarSituacaoCommand, ProjetosClient, ProjetoVm, SituacaoProjeto } from 'web-api-client';

@Component({
  selector: 'app-menu-lateral',
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.scss']
})
export class MenuLateralComponent implements OnInit {
  @Input() projeto: ProjetoVm;
  @Input() abaSelecionada?: Abas;

  @Output() componente = new EventEmitter<Componentes>()
  @Output() recarregarProjeto = new EventEmitter<number>()
  @Output() verificarTap = new EventEmitter<void>()

  componentes = Componentes

  abas = Abas;
  constructor(
    private projetosClient: ProjetosClient,
    private nzNotificationService: NzNotificationService,
    private router: Router,
    private ano: YearReferenceService,
  ) { }

  ngOnInit(): void {
  }

  alterarComponente(c: Componentes) {
    this.componente.emit(c)
  }

  carregarProjeto() {
    if (this.projeto) {
      this.projetosClient.obterPorId(this.projeto.id, this.ano.obterAno()).subscribe(response => {
        this.projeto = response;
      });
    }
  }

  get exibirTornarPlurianual(): boolean {
    return true
  }


  tornarPlurianual() {
    this.projetosClient.tornarPlurianual(this.projeto.id).subscribe(r => {
      this.nzNotificationService.success("Sucesso", "")
      this.router.navigate(["projetos-plurianuais/editar", r])
    }, e => {
      this.nzNotificationService.success("Erro", "Erro ao tornar projeto plurianual")
    })
  }

  get exibirEnviarAprovacaoTap(): boolean {
    return this.projeto.situacao == SituacaoProjeto.ProjetoAberto
  }

  get exibirAprovarTap(): boolean {
    return this.projeto.situacao == SituacaoProjeto.AguardandoAprovacaoTap
  }

  get exibirPosTap(): boolean {
    return this.projeto.situacao == SituacaoProjeto.TapConcluido;
  }

  selecionarPlurianual(plurianualidade: AnosPlurianualidade) {
    if(this.projeto.plurianualPendenteId == plurianualidade.plurianualId && plurianualidade.plurianualId) {
      this.router.navigate(["/projetos-plurianuais/editar/", plurianualidade.plurianualId] , { queryParams: { ano: plurianualidade.ano }});
    } else {
      this.router.navigate(["/projetos/editar/", this.projeto.id] , { queryParams: { ano: plurianualidade.ano }});
      this.recarregarProjeto.emit(plurianualidade.ano)
    }
  }

  selecionarPreProjeto() {
    this.router.navigate(["pre-projetos/editar/", this.projeto.preProjetoId]);
  }

  redirecionar(plurianualidade: AnosPlurianualidade) {
    if (plurianualidade.plurianualId) {
      this.router.navigate(["/projetos-plurianuais/editar/", plurianualidade.plurianualId] , { queryParams: { ano: plurianualidade.ano }});
    } else if (plurianualidade.preProjetoId) {
      this.router.navigate(["pre-projetos/editar/", plurianualidade.preProjetoId]);
    }
  }

}

export enum Componentes {
  Capa,
  DiarioBordo,
  DadosProjeto,
  PlanoAcao,
  CentroCusto,
  Orcamentos,
  Cronograma,
  CronogramaProject,
  LicoesAprendidas
}

export enum Abas {
  menu,
  timeline,
  plurianual,
  historicoAlteracoes
}
