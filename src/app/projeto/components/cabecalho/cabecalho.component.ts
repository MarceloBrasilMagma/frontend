import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgxPermissionsService } from 'ngx-permissions';
import { finalize } from 'rxjs/operators';
import { PermissaoProjetoModalComponent } from 'src/app/preprojeto/components/permissao-projeto-modal/permissao-projeto-modal.component';
import { ModalConfirmacaoComponent } from 'src/app/shared/components/modal-confirmacao/modal-confirmacao.component';
import { PausarCancelarProjetoModalComponent } from 'src/app/shared/components/pausar-cancelar-projeto-modal/pausar-cancelar-projeto-modal.component';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import { PermissaoAcessoPreProjetoTipo, ProjetoAlterarSituacaoCommand, ProjetoAlterarStatusCommand, ProjetoExcluirCommand, ProjetosClient, ProjetoVm, SituacaoCentroCusto, SituacaoProjeto, StatusProjeto } from 'web-api-client';

@Component({
  selector: 'app-cabecalho',
  templateUrl: './cabecalho.component.html',
  styleUrls: ['./cabecalho.component.scss']
})
export class CabecalhoComponent implements OnInit {
  @Input() projeto: ProjetoVm;
  @Input() possuiPermissaoEditar: boolean;

  @Output() recarregarProjeto = new EventEmitter<number>()
  @Output() verificarTap = new EventEmitter<void>()
  
  @Output() atualizaProjetoStatusEvent = new EventEmitter<StatusProjeto>();
  anoReferencia: number;
  StatusProjeto = StatusProjeto;

  carregandoProjeto: boolean = false;

  constructor(
    private router: Router,
    private nzNotificationService: NzNotificationService,
    private ano: YearReferenceService,
    private permissionsService: NgxPermissionsService,
    private nzModalService: NzModalService,
    private projetosClient: ProjetosClient
  ) { }

  ngOnInit(): void {
    this.anoReferencia = this.ano.obterAno()
  }

  abrirModalAlterarStatusProjeto(status: StatusProjeto){
    const modal = this.nzModalService.create({
      nzContent: PausarCancelarProjetoModalComponent,
      nzTitle: status === StatusProjeto.Pausado ? 'Pausar' : 'Cancelar' + 'Projeto',
      nzFooter: null,
      nzComponentParams: {
        projetoId: this.projeto?.id,
        status: status
      },
      nzWidth: "50%"
    });

    modal.afterClose.subscribe((r: ProjetoVm) => {
      if(r){
        this.projeto.status = r.status;
        this.projeto.statusDescricao = r.statusDescricao;
        this.projeto.motivoPausaCancelamento = r.motivoPausaCancelamento;

        this.atualizaProjetoStatusEvent.emit(r.status);
        console.log({respostaModal: r});
      }
    });
  }

  abrirModalVisualizarMotivoPausaCancelamento(){
    const modal = this.nzModalService.create({
      nzContent: PausarCancelarProjetoModalComponent,
      nzTitle: 'Visualizar Motivo Pausa/Cancelamento',
      nzFooter: null,
      nzComponentParams: {
        projetoId: this.projeto.id,
        motivoPausaCancelamento: this.projeto.motivoPausaCancelamento
      },
      nzWidth: "50%"
    });
  }

  alterarStatusProjeto(status: StatusProjeto){
    var req = <ProjetoAlterarStatusCommand>{
      projetoId: this.projeto?.id,
      status: status
    };
    this.projetosClient.alterarStatus(req)
      .subscribe({
        next: res => {
          this.projeto.status = res.status;
          this.projeto.statusDescricao = res.statusDescricao;
          this.atualizaProjetoStatusEvent.emit(res.status);
        },
        error: error => {
          this.nzModalService.error({
            nzTitle: 'Erro',
            nzContent:
              'Não foi possível alterar o status do projeto'
          });
          console.log(error);
        }
      });
  }

  get corSituacao(): string {
    switch (this.projeto.situacao) {
      case SituacaoProjeto.ProjetoAberto:
        return "gray";
      case SituacaoProjeto.AguardandoAprovacaoTap:
        return "gold";
      case SituacaoProjeto.TapConcluido:
        return "green";
    }
  }

  get corStatus(): string {
    switch (this.projeto?.status) {
      case StatusProjeto.Ativo:
        return 'blue';
      case StatusProjeto.Pausado:
        return 'gray';
      case StatusProjeto.Cancelado:
        return 'gray';
      case StatusProjeto.Concluido:
        return 'green'
    }
  }

  get corSituacaoCentroCusto(): string {
    switch (this.projeto.centroCusto?.situacao) {
      case SituacaoCentroCusto.EmElaboracao:
        return "gray";
      case SituacaoCentroCusto.AguardandoCriacao:
        return "gold";
      case SituacaoCentroCusto.CentroCustoCriado:
        return "green";
    }
  }

  get podeEditarPermissoes(): boolean {
    return this.possuiPermissaoEditar
  }

  exibirModalPermissoes() {
    this.nzModalService.create({
      nzContent: PermissaoProjetoModalComponent,
      nzTitle: 'Permissões',
      nzComponentParams: {
        preProjetoId: this.projeto.preProjeto.id,
      },
      nzMaskClosable: true,
      nzClosable: true,
      nzWidth: '50%',
      nzBodyStyle: { height: '500px' },
    });
  }

  excluirProjeto() {
    const modal = this.nzModalService.create({
      nzContent: ModalConfirmacaoComponent,
      nzTitle: 'Confirmação',
      nzComponentParams: {
        mensagem: 'Deseja excluir o projeto?',
        textoOk: 'Excluir',
        textoCancelar: 'Cancelar',
        corCancelar: '#ff3b3b',
      },
      nzMaskClosable: false,
      nzClosable: false,
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.carregandoProjeto = true;
        this.projetosClient
          .excluir(new ProjetoExcluirCommand({ id: this.projeto.id }))
          .pipe(
            finalize(() => {
              this.carregandoProjeto = false;
            })
          )
          .subscribe((r) => {
            this.nzNotificationService.success(
              'Projeto excluido com sucesso!',
              ''
            );
            this.router.navigateByUrl('projetos');
          });
      }
    });
  }

  get exibirTornarPlurianual(): boolean {
    return true
  }

  get exibirRetomarProjeto(): boolean{
    return this.projeto?.status === StatusProjeto.Pausado || this.projeto?.status === StatusProjeto.Cancelado;
  }

  tornarPlurianual() {
    this.projetosClient.tornarPlurianual(this.projeto.id).subscribe(r => {
      this.nzNotificationService.success("Sucesso", "")
      this.router.navigate(["projetos-plurianuais/editar", r])
    }, e => {
      this.nzNotificationService.success("Erro", "Erro ao tornar projeto plurianual")
    })
  }

  alterarSituacaoProjeto(situacao: SituacaoProjeto) {
    let req = <ProjetoAlterarSituacaoCommand>{
      id: this.projeto.id,
      situacao: situacao
    }
    this.projetosClient.alterarSituacao(req).subscribe(r => {
      this.projeto.situacao = r.situacao;
      this.recarregarProjeto.emit(null);
    })
  }

  enviarAprovacaoTap() {
    this.alterarSituacaoProjeto(SituacaoProjeto.AguardandoAprovacaoTap)
  }

  aprovarTap() {
    this.alterarSituacaoProjeto(SituacaoProjeto.TapConcluido)
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

  selecionarPreProjeto() {
    this.router.navigate(["pre-projetos/editar/", this.projeto.preProjetoId]);
  }

  get exibirPausarCancelarProjeto(): boolean{
    return this.projeto?.status === StatusProjeto.Ativo;
  }

  get exibirConcluirProjeto(): boolean{
    return this.projeto?.status === StatusProjeto.Ativo;
  }
  
  get desabilitaBotoes(): boolean{
    return this.projeto?.status !== StatusProjeto.Ativo;
  }

  get habilitarBotaoVisualizarModalMotivoPausaCancelamento(){
    return this.projeto.status === StatusProjeto.Pausado || this.projeto.status === StatusProjeto.Cancelado;
  }

}
