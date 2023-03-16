import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import { AnosPlurianualidade, DeclaracaoTrabalhoSituacao, DeclaracaoTrabalhoVm, PreProjetoOrcamento, PreProjetoOrcamentoVm, PreProjetosClient, PreProjetoVm, ProjetosClient, ProjetoVm, ZonaRisco } from 'web-api-client';

@Component({
  selector: 'app-pagina-impressao',
  templateUrl: './pagina-impressao.component.html',
  styleUrls: ['./pagina-impressao.component.scss']
})
export class PaginaImpressaoComponent implements OnInit {
  projetoId: number;

  projeto: ProjetoVm;
  preProjeto: PreProjetoVm;

  ZonaRisco = ZonaRisco

  constructor(
    private projetosClient: ProjetosClient,
    private preProjetosClient: PreProjetosClient,
    private route: ActivatedRoute,
    private ano : YearReferenceService
  ) { }

  async ngOnInit() {
    this.projetoId = +this.route.snapshot.paramMap.get('id');
    this.projeto = await this.carregarProjeto();
    this.preProjeto = await this.carregarPreProjeto(this.projeto.preProjeto.id);
  }

  async carregarProjeto(): Promise<ProjetoVm> {
    let anoReferencia: number = this.ano.obterAno()

    return this.projetosClient.obterPorId(this.projetoId, anoReferencia).toPromise();

  }

  async carregarPreProjeto(preProjetoId: number): Promise<PreProjetoVm> {
    return await this.preProjetosClient.obterPorId(preProjetoId).toPromise()
  }

  corTagSitacao(declaracao: DeclaracaoTrabalhoVm) {
    switch (declaracao.situacao) {
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

  getDataEntregaFornecedor(dt: DeclaracaoTrabalhoVm): string {
    if (dt.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor)
      return !dt.dataEntregaFornecedor ? "-" : dt.dataEntregaFornecedor?.toLocaleDateString()
    else if (dt.situacao == DeclaracaoTrabalhoSituacao.AguardandoClassificacao)
      return !dt.dataEntregaClassificacaoContabil ? "-" : dt.dataEntregaClassificacaoContabil?.toLocaleDateString()
    else return "-"
  }

  get now(): string {
    return new Date(Date.now()).toLocaleDateString();
  }

  getDespesaAdministrativa(o: PreProjetoOrcamentoVm): number {

    let valor = !!o.valorDespesaAdministrativaRessalva
      ? o.valorDespesaAdministrativaRessalva
      : !!o.valorDespesaAdministrativaObservacao
        ? o.valorDespesaAdministrativaObservacao
        : o.valorDespesaAdministrativa

    return valor;
  }

  getCustoAssistencial(o: PreProjetoOrcamentoVm): number {

    let valor = !!o.valorCustoAssistencialRessalva
      ? o.valorCustoAssistencialRessalva
      : !!o.valorCustoAssistencialObservacao
        ? o.valorCustoAssistencialObservacao
        : o.valorCustoAssistencial

    return valor;
  }

  getInvestimento(o: PreProjetoOrcamentoVm): number {

    let valor = !!o.valorInvestimentoRessalva
      ? o.valorInvestimentoRessalva
      : !!o.valorInvestimentoObservacao
        ? o.valorInvestimentoObservacao
        : o.valorInvestimento

    return valor;
  }

  getTotal(o: PreProjetoOrcamentoVm): number {

    let valor = !!o.totalRessalva
      ? o.totalRessalva
      : o.total

    return valor;
  }
}
