import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NgxPermissionsService } from 'ngx-permissions';
import { finalize, take } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { PreProjetosClient, PreProjetoVm, OrcamentoExtraVm, DeclaracoesTrabalhoClient, DeclaracaoTrabalhoSituacao, SituacaoPreProjetoOrcamento, PermissaoAcessoPreProjetoTipo, ProjetoPlurianualVm, ProjetosPlurianuaisClient, SituacaoOrcamentoExtra, PreProjetoOrcamentoVm, ProjetoPlurianualOrcamento, ProjetoPlurianualOrcamentoVm, DeclaracaoTrabalhoOrcamentoAlterarCommand, DeclaracaoTrabalhoOrcamentoVm, PreProjetoOrcamentoAlterarCommand, ProjetoPlurianualOrcamentoAlterarCommand } from 'web-api-client';
import { RessalvaDeclaracaoTrabalhoFormComponent } from '../ressalva-declaracao-trabalho-form/ressalva-declaracao-trabalho-form.component';
import { RessalvaPlurianualFormComponent } from '../ressalva-plurianual-form/ressalva-plurianual-form.component';
import { RessalvaPreprojetoFormComponent } from '../ressalva-preprojeto-form/ressalva-preprojeto-form.component';

@Component({
  selector: 'app-ressalva-listar-orcamentos',
  templateUrl: './ressalva-listar-orcamentos.component.html',
  styleUrls: ['./ressalva-listar-orcamentos.component.scss']
})
export class RessalvaListarOrcamentosComponent implements OnInit {
  @Input() projeto: PreProjetoVm;
  @Input() projetoPlurianual: ProjetoPlurianualVm;
  @Output() projetoChanged = new EventEmitter<PreProjetoVm>();
  @Output() projetoPlurianualChanged = new EventEmitter<ProjetoPlurianualVm>();

  orcamentos: OrcamentoExtraVm[] = [];
  carregandoProjeto: boolean;
  excluindoOrcamento: boolean;

  opcao = 0;

  form: UntypedFormGroup;

  constructor(
    private nzModalService: NzModalService,
    private preProjetosClient: PreProjetosClient,
    private projetosPlurianuaisClient: ProjetosPlurianuaisClient,
    private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient,
    private permissionsService: NgxPermissionsService,
    private authenticationService: AuthenticationService,
    private nzModalRef: NzModalRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.carregarOrcamentos();

    if (!!this.projeto) {
      this.form.patchValue({
        observacao: this.projeto.observacao
      })
    }

    if (!!this.projetoPlurianual) {
      this.form.patchValue({
        observacao: this.projetoPlurianual.observacao
      })
    }
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      observacao: [null],
    });
  }

  private carregarProjeto() {
    this.carregandoProjeto = true;
    this.preProjetosClient
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

  private carregarProjetoPlurianual() {
    this.carregandoProjeto = true;

    this.projetosPlurianuaisClient
      .obterPorId(this.projetoPlurianual.id)
      .pipe(
        finalize(() => {
          this.carregandoProjeto = false;
        })
      )
      .subscribe((r) => {
        this.projetoPlurianual = r;
        this.projetoPlurianualChanged.emit(r);
        this.carregarOrcamentos();
      });
  }

  carregarOrcamentos() {
    if (this.opcao == 1) {
      if (!!this.projeto)
        this.orcamentos = this.projeto.orcamentos.filter(x => !x.declaracaoTrabalhoId).map(x => { return <OrcamentoExtraVm>{ ...x, situacao: <unknown>x.situacao } });
      if (!!this.projetoPlurianual)
        this.orcamentos = this.projetoPlurianual.orcamentos.filter(x => !x.declaracaoTrabalhoId).map(x => { return <OrcamentoExtraVm>{ ...x, situacao: <unknown>x.situacao } });
    }
    else if (this.opcao == 2) {
      if (!!this.projeto)
        this.orcamentos = this.projeto.orcamentos.filter(x => !!x.declaracaoTrabalhoId).map(x => { return <OrcamentoExtraVm>{ ...x, situacao: <unknown>x.situacao } });
      if (!!this.projetoPlurianual)
        this.orcamentos = this.projetoPlurianual.orcamentos.filter(x => !!x.declaracaoTrabalhoId).map(x => { return <OrcamentoExtraVm>{ ...x, situacao: <unknown>x.situacao } });
    }
    else {
      if (!!this.projeto)
        this.orcamentos = this.projeto.orcamentos.map(x => { return <OrcamentoExtraVm>{ ...x, situacao: <unknown>x.situacao } });
      if (!!this.projetoPlurianual)
        this.orcamentos = this.projetoPlurianual.orcamentos.map(x => { return <OrcamentoExtraVm>{ ...x, situacao: <unknown>x.situacao } });
    }

  }

  exibirObservacoes(situacao: DeclaracaoTrabalhoSituacao, orcamento: OrcamentoExtraVm): boolean {
    return situacao === DeclaracaoTrabalhoSituacao.AguardandoClassificacao ||
      situacao === DeclaracaoTrabalhoSituacao.ClassificacaoRealizada ||
      situacao === DeclaracaoTrabalhoSituacao.Cancelada ||
      situacao === DeclaracaoTrabalhoSituacao.Finalizada ||
      orcamento.situacao === SituacaoOrcamentoExtra.AguardandoClassificacao ||
      orcamento.situacao === SituacaoOrcamentoExtra.ClassificacaoRealizada
  }

  editarOrcamento(orcamento: OrcamentoExtraVm) {
    if (!!orcamento.declaracaoTrabalhoId) {
      this.editarOrcamentoDt(orcamento)
    } else {
      if (!!this.projetoPlurianual)
        this.editarOrcamentoPlurianual(orcamento)
      if (!!this.projeto)
        this.editarOrcamentoPreProjeto(orcamento)
    }
  }

  editarOrcamentoDt(orcamento: OrcamentoExtraVm) {
    const modal = this.nzModalService.create({
      nzTitle: 'Editar Orçamento',
      nzContent: RessalvaDeclaracaoTrabalhoFormComponent,
      nzComponentParams: {
        declaracaoTrabalhoId: orcamento.declaracaoTrabalhoId,
        orcamento: orcamento
      },
      nzWidth: "50%",
      nzMaskClosable: false,
    });

    modal.afterClose.pipe(take(1)).subscribe((r) => {
      if (r?.ocorreuAlteracao) {
        if (!!this.projeto)
          this.carregarProjeto();
        if (!!this.projetoPlurianual) {
          this.carregarProjetoPlurianual()
        }
      }
    });
  }

  editarOrcamentoPreProjeto(orcamento: OrcamentoExtraVm) {
    const modal = this.nzModalService.create({
      nzTitle: 'Editar Orçamento',
      nzContent: RessalvaPreprojetoFormComponent,
      nzComponentParams: {
        projetoId: this.projeto.id,
        orcamento: <PreProjetoOrcamentoVm>{ ...orcamento, situacao: <unknown>orcamento.situacao }
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

  editarOrcamentoPlurianual(orcamento: OrcamentoExtraVm) {
    const modal = this.nzModalService.create({
      nzTitle: 'Editar Orçamento',
      nzContent: RessalvaPlurianualFormComponent,
      nzComponentParams: {
        projetoPlurianualId: this.projetoPlurianual.id,
        orcamento: <ProjetoPlurianualOrcamentoVm>{ ...orcamento, situacao: <unknown>orcamento.situacao }
      },
      nzWidth: "50%",
      nzMaskClosable: false,
    });

    modal.afterClose.pipe(take(1)).subscribe((r) => {
      if (r?.ocorreuAlteracao) {
        this.carregarProjetoPlurianual();
      }
    });
  }

  get orcamentoSomaValoresDespesaAdministrativa(): number {
    return this.orcamentos
      .map((o) => { return this.getExibirRessalva(o) ? o.valorDespesaAdministrativaRessalva : o.valorDespesaAdministrativa })
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaValoresCustoAssistencial(): number {
    return this.orcamentos
      .map((o) => { return this.getExibirRessalva(o) ? o.valorCustoAssistencialRessalva : o.valorCustoAssistencial })
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaValoresInvestimento(): number {
    return this.orcamentos
      .map((o) => { return this.getExibirRessalva(o) ? o.valorInvestimentoRessalva : o.valorInvestimento })
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaTotal(): number {
    return this.orcamentos
      .map((o) => { return this.getExibirRessalva(o) ? o.totalRessalva : o.total })
      .reduce((sum, current) => sum + current, 0);
  }

  get isLoading(): boolean {
    return this.carregandoProjeto || this.excluindoOrcamento;
  }

  get possuiPermissaoEditarOrcamentos(): boolean {
    var permissions = this.permissionsService.getPermissions();

    return "Administrador" in permissions
      || this.projeto.permissaoUsuarioLogado == PermissaoAcessoPreProjetoTipo.AcessoTotal
      || this.authenticationService.loginUsuarioLogado == this.projeto.loginGerenteProjeto
  }

  getFornecedorDeclaracao(orcamento: OrcamentoExtraVm): string {
    if (!!this.projeto)
      return this.projeto.declaracoesTrabalho.find(x => { return x.id == orcamento.declaracaoTrabalhoId })?.departamentoNome
    if (!!this.projetoPlurianual)
      return this.projetoPlurianual.declaracoesTrabalho.find(x => { return x.id == orcamento.declaracaoTrabalhoId })?.departamentoNome
  }

  getResponsavelDeclaracao(orcamento: OrcamentoExtraVm): string {
    if (!!this.projeto)
      return this.projeto.declaracoesTrabalho.find(x => { return x.id == orcamento.declaracaoTrabalhoId })?.nomeResponsavel
    if (!!this.projetoPlurianual)
      return this.projetoPlurianual.declaracoesTrabalho.find(x => { return x.id == orcamento.declaracaoTrabalhoId })?.nomeResponsavel

  }

  getSituacao(orcamento: OrcamentoExtraVm): string {

    if (this.getExibirRessalva(orcamento)) {
      return !orcamento.declaracaoTrabalhoId ? "(Extra) Ressalvas" : "(DT) Ressalvas";
    }
    return !orcamento.declaracaoTrabalhoId ? `(Extra) ${orcamento.situacaoDescricao}` : `(DT) ${orcamento.situacaoDtDescricao}`;
  }

  getExibirRessalva(orcamento: OrcamentoExtraVm) {
    let r = !!orcamento.ressalva || orcamento.valorInvestimentoRessalva !== null || orcamento.valorCustoAssistencialRessalva !== null || orcamento.valorDespesaAdministrativaRessalva !== null;
    console.log(r, orcamento
    )
    return r;
  }
  corTagSitacao(orcamento: OrcamentoExtraVm) {
    if (!!orcamento?.declaracaoTrabalhoId) {
      switch (orcamento?.situacaoDt) {
        case (DeclaracaoTrabalhoSituacao.Elaboracao): return "gray";
        case (DeclaracaoTrabalhoSituacao.AguardandoFornecedor): return "gold";
        case (DeclaracaoTrabalhoSituacao.Respondida): return "blue";
        case (DeclaracaoTrabalhoSituacao.AguardandoClassificacao): return "orange";
        case (DeclaracaoTrabalhoSituacao.ClassificacaoRealizada): return "geekblue";
        case (DeclaracaoTrabalhoSituacao.Finalizada): return "green";
        case (DeclaracaoTrabalhoSituacao.Cancelada): return "red";
        case (DeclaracaoTrabalhoSituacao.AguardandoAjustes): return "gray";
        case (DeclaracaoTrabalhoSituacao.AjustesRealizados): return "gold";
      }
    }
    else {
      switch (orcamento?.situacao) {
        case (SituacaoOrcamentoExtra.EmElaboracao): return "gray";
        case (SituacaoOrcamentoExtra.AguardandoClassificacao): return "orange";
        case (SituacaoOrcamentoExtra.ClassificacaoRealizada): return "geekblue";
      }
    }
  }


  aprovar() {
    this.nzModalRef.destroy({ aprovar: true, ressalva: this.form.value['observacao'] });
  }

  cancelar() {
    this.nzModalRef.destroy({ aprovar: false, ressalva: "" });
  }

  cancelarOrcamento(orcamento: any) {
    if (!!orcamento.declaracaoTrabalhoId) {
      this.cancelarDt(orcamento)
    } else {
      if (!!this.projetoPlurianual)
        this.cancelarPlurianual(orcamento)
      if (!!this.projeto)
        this.cancelarPreProjeto(orcamento)
    }
  }

  cancelarDt(orcamento: DeclaracaoTrabalhoOrcamentoVm) {
    let req = <DeclaracaoTrabalhoOrcamentoAlterarCommand>{
      ...orcamento,
      valorInvestimentoRessalva: 0,
      valorCustoAssistencialRessalva: 0,
      valorDespesaAdministrativaRessalva: 0,
      ressalva: "Cancelado"
    }
    this.declaracoesTrabalhoClient.alterarOcamento(orcamento.declaracaoTrabalhoId.toString(), orcamento.id.toString(), req).subscribe(r => {
      this.carregarProjeto()
    })
  }

  cancelarPreProjeto(orcamento: PreProjetoOrcamentoVm) {
    let req = <PreProjetoOrcamentoAlterarCommand>{
      ...orcamento,
      valorInvestimentoRessalva: 0,
      valorCustoAssistencialRessalva: 0,
      valorDespesaAdministrativaRessalva: 0,
      ressalva: "Cancelado"
    }
    this.preProjetosClient.alterarOcamento(req).subscribe(r => {
      this.carregarProjeto()
    })
  }

  cancelarPlurianual(orcamento: ProjetoPlurianualOrcamentoVm) {
    let req = <ProjetoPlurianualOrcamentoAlterarCommand>{
      ...orcamento,
      valorInvestimentoRessalva: 0,
      valorCustoAssistencialRessalva: 0,
      valorDespesaAdministrativaRessalva: 0,
      ressalva: "Cancelado"
    }
    this.projetosPlurianuaisClient.alterarOcamento(req).subscribe(r => {
      this.carregarProjeto()
    })
  }
}
