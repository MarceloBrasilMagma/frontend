import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ProjetosClient, ProjetoSituacaoObterPorProjetoQuery, ProjetoSituacaoVm, ProjetoVm, SituacaoProjeto } from 'web-api-client';

@Component({
  selector: 'app-timeline-projeto',
  templateUrl: './timeline-projeto.component.html',
  styleUrls: ['./timeline-projeto.component.scss']
})
export class TimelineProjetoComponent implements OnInit, OnChanges {
  @Input() projeto: ProjetoVm

  situacoes: ProjetoSituacaoVm[];

  activityList = []

  constructor(
    private projetosClient: ProjetosClient
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.situacoes)
      this.carregarSituacoes()
  }

  ngOnInit(): void {
    this.carregarSituacoes()
  }

  
  carregarSituacoes() {
    this.projetosClient.obterSituacoes(<ProjetoSituacaoObterPorProjetoQuery>{ pageIndex: 1, pageSize: -1, projetoId: this.projeto?.id })
      .subscribe(r => {
        this.situacoes = r.items.filter(x => x.projetoId === this.projeto.id);

        this.activityList = [
          {
            name: "Projeto Aberto",
            date: this.dataProjetoAberto,
            concluida: this.getSituacaoConcluida(SituacaoProjeto.ProjetoAberto)
          },
          {
            name: "Aguardando Aprovação TAP",
            date: this.dataAguardandoAprovacaoTap,
            concluida: this.getSituacaoConcluida(SituacaoProjeto.AguardandoAprovacaoTap)
          },
          {
            name: "TAP Concluído",
            date: this.dataTapConcluido,
            concluida: this.getSituacaoConcluida(SituacaoProjeto.TapConcluido)
          },
        ]
      })
      
  }
  get timeLineIndex(): number {
    return this.projeto?.situacao;
  }

  get dataProjetoAberto(): string {
    return this.situacoes?.find(x => x.situacao === SituacaoProjeto.ProjetoAberto)?.data.toLocaleString();
  }

  get dataAguardandoAprovacaoTap(): string {
    return this.situacoes?.find(x => x.situacao === SituacaoProjeto.AguardandoAprovacaoTap)?.data.toLocaleString();
  }

  get dataTapConcluido(): string {
    return this.situacoes?.find(x => x.situacao === SituacaoProjeto.TapConcluido)?.data.toLocaleString();
  }
  getSituacaoConcluida(situacao: SituacaoProjeto) {
    if (situacao <= this.projeto?.situacao) return true;
    else return false;
  }


}
