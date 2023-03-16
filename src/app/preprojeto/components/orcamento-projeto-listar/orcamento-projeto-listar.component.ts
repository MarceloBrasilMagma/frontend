import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgxPermissionsService } from 'ngx-permissions';
import { finalize, take } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { DeclaracaoTrabalhoSituacao, DeclaracoesTrabalhoClient, PermissaoAcessoPreProjetoTipo, PreProjetoOrcamentoVm, PreProjetosClient, PreProjetoVm, SituacaoPreProjeto, SituacaoPreProjetoOrcamento } from 'web-api-client';
import { OrcamentoProjetoFormModalComponent } from '../orcamento-projeto-form-modal/orcamento-projeto-form-modal.component';

@Component({
  selector: 'app-orcamento-projeto-listar',
  templateUrl: './orcamento-projeto-listar.component.html',
  styleUrls: ['./orcamento-projeto-listar.component.scss']
})
export class OrcamentoProjetoListarComponent implements OnInit {

  @Input() projeto: PreProjetoVm;
  @Output() projetoChanged = new EventEmitter<PreProjetoVm>();

  orcamentos: PreProjetoOrcamentoVm[] = [];
  carregandoProjeto: boolean;
  excluindoOrcamento: boolean;

  opcao = 0;

  constructor(
    private nzModalService: NzModalService,
    private PreProjetosClient: PreProjetosClient,
    private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient,
    private permissionsService: NgxPermissionsService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.carregarOrcamentos();
  }

  private carregarProjeto() {
    this.carregandoProjeto = true;
    this.PreProjetosClient
      .obterPorId(this.projeto.id)
      .pipe(
        finalize(() => {
          this.carregandoProjeto = false;
        })
      )
      .subscribe((r) => {
        this.projeto = r;
        this.projetoChanged.emit(r);
        this.carregarOrcamentos();
      });
  }

  carregarOrcamentos(){
    if(this.opcao == 1){
      this.orcamentos = this.projeto.orcamentos.filter(x => !x.declaracaoTrabalhoId);
    }
    else if(this.opcao == 2){
      this.orcamentos = this.projeto.orcamentos.filter(x => !!x.declaracaoTrabalhoId);
    }
    else {
      this.orcamentos = this.projeto.orcamentos;
    }

  }
  abrirModalCadastrarOrcamento() {
    const modal = this.nzModalService.create({
      nzTitle: 'Cadastrar Orçamento',
      nzContent: OrcamentoProjetoFormModalComponent,
      nzComponentParams: {
        projetoId: this.projeto.id,
        orcamento: null,
      },
      nzWidth: "50%",
      nzMaskClosable: false,
    });

    modal.afterClose.pipe(take(1)).subscribe((r) => {
      if (r?.ocorreuAlteracao) {
        this.carregarProjeto();
      }
    });
  }

  exibirObservacoes(situacao: DeclaracaoTrabalhoSituacao, orcamento: PreProjetoOrcamentoVm): boolean{
    return  situacao === DeclaracaoTrabalhoSituacao.AguardandoClassificacao ||
            situacao === DeclaracaoTrabalhoSituacao.ClassificacaoRealizada ||
            situacao === DeclaracaoTrabalhoSituacao.Cancelada ||
            situacao === DeclaracaoTrabalhoSituacao.Finalizada ||
            orcamento.situacao === SituacaoPreProjetoOrcamento.AguardandoClassificacao ||
            orcamento.situacao === SituacaoPreProjetoOrcamento.ClassificacaoRealizada
  }

  editarOrcamento(orcamento: PreProjetoOrcamentoVm) {
    let situacao = this.projeto.declaracoesTrabalho.find(x => {return x.id == orcamento.declaracaoTrabalhoId})?.situacao
    const modal = this.nzModalService.create({
      nzTitle: 'Editar Orçamento',
      nzContent: OrcamentoProjetoFormModalComponent,
      nzComponentParams: {
        projetoId: this.projeto.id,
        orcamento: orcamento,
        declaracaoSituacao: situacao
      },
      nzWidth: "50%",
      nzMaskClosable: false,
    });

    modal.afterClose.pipe(take(1)).subscribe((r) => {
      if (r?.ocorreuAlteracao) {
        this.carregarProjeto();
      }
    });
  }

  excluirOrcamento(orcamento: PreProjetoOrcamentoVm) {
    this.excluindoOrcamento = true;
    if(!orcamento.declaracaoTrabalhoId){
      this.PreProjetosClient
      .excluirOrcamento(orcamento.id)
      .pipe(
        finalize(() => {
          this.excluindoOrcamento = false;
        })
      )
      .subscribe((r) => {
        this.carregarProjeto();
      });
    }
    else {
      this.declaracoesTrabalhoClient
      .excluirOrcamento(orcamento.declaracaoTrabalhoId, orcamento.id)
      .pipe(
        finalize(() => {
          this.excluindoOrcamento = false;
        })
      )
      .subscribe((r) => {
        this.carregarProjeto();
      });
    }
  }

  get orcamentoSomaValoresDespesaAdministrativa(): number {
    return this.orcamentos
      ?.map((o) => o.valorDespesaAdministrativaObservacao === null  ||  o.valorDespesaAdministrativaObservacao === undefined? o.valorDespesaAdministrativa : o.valorDespesaAdministrativaObservacao)
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaValoresCustoAssistencial(): number {
    return this.orcamentos
      ?.map((o) => o.valorCustoAssistencialObservacao === null || o.valorCustoAssistencialObservacao === undefined ? o.valorCustoAssistencial : o.valorCustoAssistencialObservacao)
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaValoresInvestimento(): number {
    return this.orcamentos
      ?.map((o) => o.valorInvestimentoObservacao === null || o.valorInvestimentoObservacao === undefined? o.valorInvestimento : o.valorInvestimentoObservacao)
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaTotal(): number {
    return this.orcamentos
      .map((o) => o.total)
      .reduce((sum, current) => sum + current, 0);
  }

  get isLoading(): boolean {
    return this.carregandoProjeto || this.excluindoOrcamento;
  }

  get possuiPermissaoEditarOrcamentos() : boolean {
    var permissions = this.permissionsService.getPermissions();

    return "Administrador" in permissions
    || this.projeto.permissaoUsuarioLogado == PermissaoAcessoPreProjetoTipo.AcessoTotal
    || this.authenticationService.loginUsuarioLogado == this.projeto.loginGerenteProjeto
  }

  get possuiPermissaoClassificacaoContabilOrcamentos() : boolean {
    var permissions = this.permissionsService.getPermissions();

    return "Administrador" in permissions
    || "Projeto.ClassificacaoContabil" in permissions
  }

  getFornecedorDeclaracao(orcamento: PreProjetoOrcamentoVm) : string {
    return this.projeto.declaracoesTrabalho.find(x => {return x.id == orcamento.declaracaoTrabalhoId})?.departamentoNome
  }

  getResponsavelDeclaracao(orcamento: PreProjetoOrcamentoVm) : string {
    return this.projeto.declaracoesTrabalho.find(x => {return x.id == orcamento.declaracaoTrabalhoId})?.nomeResponsavel
  }

  getSituacao(orcamento: PreProjetoOrcamentoVm): string {
    return !orcamento.declaracaoTrabalhoId ? `(Extra) ${orcamento.situacaoDescricao}` : `(DT) ${orcamento.situacaoDtDescricao}`;
  }

  corTagSitacao(orcamento: PreProjetoOrcamentoVm) {
    if(!!orcamento?.declaracaoTrabalhoId){
      switch(orcamento?.situacaoDt){
        case (DeclaracaoTrabalhoSituacao.Elaboracao): return"gray";
        case (DeclaracaoTrabalhoSituacao.AguardandoFornecedor): return"gold";
        case (DeclaracaoTrabalhoSituacao.Respondida): return"blue";
        case (DeclaracaoTrabalhoSituacao.AguardandoClassificacao): return"orange";
        case (DeclaracaoTrabalhoSituacao.ClassificacaoRealizada): return"geekblue";
        case (DeclaracaoTrabalhoSituacao.Finalizada): return"green";
        case (DeclaracaoTrabalhoSituacao.Cancelada): return"red";
        case (DeclaracaoTrabalhoSituacao.AguardandoAjustes): return"gray";
        case (DeclaracaoTrabalhoSituacao.AjustesRealizados): return"gold";
      }
    }
    else {
      switch(orcamento?.situacao){
        case (SituacaoPreProjetoOrcamento.EmElaboracao): return"gray";
        case (SituacaoPreProjetoOrcamento.AguardandoClassificacao): return"orange";
        case (SituacaoPreProjetoOrcamento.ClassificacaoRealizada): return"geekblue";
      }
    }
  }
  get projetoAprovado(): boolean {
    if(this.projeto.situacao === SituacaoPreProjeto.ProjetoValidado || this.projeto.situacao === SituacaoPreProjeto.ProjetoValidadoRessalvas) {
      return false
    } else {
      return true
    }
  }

}
