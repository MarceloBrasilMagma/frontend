import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgxPermissionsService } from 'ngx-permissions';
import { finalize, take } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { DeclaracaoTrabalhoSituacao, DeclaracoesTrabalhoClient, PermissaoAcessoPreProjetoTipo, PreProjetoOrcamentoVm, ProjetosPlurianuaisClient, ProjetoPlurianualVm, ProjetoPlurianualOrcamentoVm, SituacaoProjetoPlurianualOrcamento, SituacaoProjetoPlurianual, StatusProjeto } from 'web-api-client';
import { OrcamentoProjetoPlurianualFormModalComponent } from '../orcamento-projeto-plurianual-form-modal/orcamento-projeto-plurianual-form-modal.component';

@Component({
  selector: 'app-orcamento-projeto-plurianual-listar',
  templateUrl: './orcamento-projeto-plurianual-listar.component.html',
  styleUrls: ['./orcamento-projeto-plurianual-listar.component.scss']
})
export class OrcamentoProjetoPlurianualListarComponent implements OnInit {

  @Input() statusProjeto: StatusProjeto;
  @Input() projeto: ProjetoPlurianualVm;
  @Output() projetoChanged = new EventEmitter<ProjetoPlurianualVm>();

  orcamentos: ProjetoPlurianualOrcamentoVm[] = [];
  carregandoProjeto: boolean;
  excluindoOrcamento: boolean;

  opcao = 0;

  constructor(
    private nzModalService: NzModalService,
    private projetosPlurianuaisClient: ProjetosPlurianuaisClient,
    private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient,
    private permissionsService: NgxPermissionsService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.carregarOrcamentos();
  }

  private carregarProjeto() {
    this.carregandoProjeto = true;
    this.projetosPlurianuaisClient
      .obterPorId(this.projeto?.id)
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
      nzContent: OrcamentoProjetoPlurianualFormModalComponent,
      nzComponentParams: {
        projetoId: this.projeto?.id,
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

  exibirObservacoes(situacao): boolean{
    return  situacao === DeclaracaoTrabalhoSituacao.AguardandoClassificacao ||
            situacao === DeclaracaoTrabalhoSituacao.ClassificacaoRealizada ||
            situacao === DeclaracaoTrabalhoSituacao.Cancelada ||
            situacao === DeclaracaoTrabalhoSituacao.Finalizada
  }

  editarOrcamento(orcamento: ProjetoPlurianualOrcamentoVm) {
    let situacao = this.projeto?.declaracoesTrabalho.find(x => {return x.id == orcamento.declaracaoTrabalhoId})?.situacao
    const modal = this.nzModalService.create({
      nzTitle: 'Editar Orçamento',
      nzContent: OrcamentoProjetoPlurianualFormModalComponent,
      nzComponentParams: {
        projetoId: this.projeto?.id,
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
      this.projetosPlurianuaisClient
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
    || this.authenticationService.loginUsuarioLogado == this.projeto?.loginResponsavel
  }

  get possuiPermissaoClassificacaoContabilOrcamentos() : boolean {
    var permissions = this.permissionsService.getPermissions();

    return "Administrador" in permissions
    || "Projeto.ClassificacaoContabil" in permissions
  }

  getFornecedorDeclaracao(orcamento: ProjetoPlurianualOrcamentoVm) : string {
    return this.projeto.declaracoesTrabalho.find(x => {return x.id == orcamento.declaracaoTrabalhoId})?.departamentoNome
  }

  getResponsavelDeclaracao(orcamento: ProjetoPlurianualOrcamentoVm) : string {
    return this.projeto.declaracoesTrabalho.find(x => {return x.id == orcamento.declaracaoTrabalhoId})?.nomeResponsavel
  }

  getSituacao(orcamento: ProjetoPlurianualOrcamentoVm): string {
    return !orcamento.declaracaoTrabalhoId ? `(Extra) ${orcamento.situacaoDescricao}` : `(DT) ${orcamento.situacaoDtDescricao}`;
  }

  corTagSitacao(orcamento: ProjetoPlurianualOrcamentoVm) {
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
        case (SituacaoProjetoPlurianualOrcamento.EmElaboracao): return"gray";
        case (SituacaoProjetoPlurianualOrcamento.AguardandoClassificacao): return"orange";
        case (SituacaoProjetoPlurianualOrcamento.ClassificacaoRealizada): return"geekblue";
      }
    }
  }

  get projetoAprovado(): boolean {
    if(this.projeto.situacao === SituacaoProjetoPlurianual.ProjetoPlurianualValidado || this.projeto.situacao === SituacaoProjetoPlurianual.ProjetoPlurianualValidadoRessalvas) {
      return false
    } else {
      return true
    }
  }

  get desabilitaBotoes(): boolean{
    return this.statusProjeto !== StatusProjeto.Ativo;
  }

}
