import { DeclaracaoTrabalho } from './../../../../../web-api-client';
import { CestaRasaVm, DeclaracaoTrabalhoSituacao, DeclaracaoTrabalhoVm, PortifolioRasoVm, ProjetoPlurianualOrcamentoVm, ProjetoPlurianualVm, ProjetoPlurianualSituacaoVm } from 'web-api-client';
import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-projeto-plurianual-impressao',
  templateUrl: './projeto-plurianual-impressao.component.html',
  styleUrls: ['./projeto-plurianual-impressao.component.scss']
})
export class ProjetoPlurianualImpressaoComponent implements OnInit {

  @Input() projetoPlurianual: ProjetoPlurianualVm;
  @Input() portifolioProjetoPlurianual: PortifolioRasoVm;
  @Input() cestaProjetoPlurianual: CestaRasaVm;
  @Input() mensagens: ProjetoPlurianualSituacaoVm[];

  orcamentos: ProjetoPlurianualOrcamentoVm[] = [];

  constructor(
  ) { }

  ngOnInit(): void {
  }

  getDataEntregaFornecedor(dt : DeclaracaoTrabalhoVm) : string {
    if(dt.situacao == DeclaracaoTrabalhoSituacao.AguardandoFornecedor)
      return !dt.dataEntregaFornecedor ? "-" : dt.dataEntregaFornecedor?.toLocaleDateString()
    else if(dt.situacao == DeclaracaoTrabalhoSituacao.AguardandoClassificacao)
      return !dt.dataEntregaClassificacaoContabil ? "-" : dt.dataEntregaClassificacaoContabil?.toLocaleDateString()
    else return "-"
  }

  get orcamentoSomaValoresDespesaAdministrativa(): number {
    return this.projetoPlurianual?.orcamentos
      ?.map((o) => o.valorDespesaAdministrativaObservacao === null  ||  o.valorDespesaAdministrativaObservacao === undefined? o.valorDespesaAdministrativa : o.valorDespesaAdministrativaObservacao)
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaValoresCustoAssistencial(): number {
    return this.projetoPlurianual?.orcamentos
      ?.map((o) => o.valorCustoAssistencialObservacao === null || o.valorCustoAssistencialObservacao === undefined ? o.valorCustoAssistencial : o.valorCustoAssistencialObservacao)
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaValoresInvestimento(): number {
    return this.projetoPlurianual?.orcamentos
      ?.map((o) => o.valorInvestimentoObservacao === null || o.valorInvestimentoObservacao === undefined? o.valorInvestimento : o.valorInvestimentoObservacao)
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaTotal(): number {
    return this.projetoPlurianual?.orcamentos
      .map((o) => o.total)
      .reduce((sum, current) => sum + current, 0);
  }

  getFornecedorDeclaracao(orcamento: ProjetoPlurianualOrcamentoVm) : string {
    return this.projetoPlurianual.declaracoesTrabalho.find(x => {return x.id == orcamento.declaracaoTrabalhoId})?.departamentoNome
  }

  getResponsavelDeclaracao(orcamento: ProjetoPlurianualOrcamentoVm) : string {
    return this.projetoPlurianual.declaracoesTrabalho.find(x => {return x.id == orcamento.declaracaoTrabalhoId})?.nomeResponsavel
  }

  getSituacao(orcamento: ProjetoPlurianualOrcamentoVm): string {
    return !orcamento.declaracaoTrabalhoId ? `(Extra) ${orcamento.situacaoDescricao}` : `(DT) ${orcamento.situacaoDtDescricao}`;
  }

  getViavelTecnicamente(declaracaoTrabalho: DeclaracaoTrabalhoVm): string {
    return declaracaoTrabalho.viavelTecnicamente ? "Sim" : "Não";
  }

}
