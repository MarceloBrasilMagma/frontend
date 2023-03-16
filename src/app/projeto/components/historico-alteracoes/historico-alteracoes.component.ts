import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LogAlteracaoObterPorIdETipoEntidadeQuery, LogAlteracaoVm, LogsAlteracoesClient } from 'web-api-client';

@Component({
  selector: 'app-historico-alteracoes',
  templateUrl: './historico-alteracoes.component.html',
  styleUrls: ['./historico-alteracoes.component.scss']
})
export class HistoricoAlteracoesComponent implements OnInit, OnChanges {

  @Input() idEntidade: number;
  nomeEntidade: string = "Projeto"

  logs: any;
  logsKeys: any;

  detalhes: boolean;
  logSelecionado: LogAlteracaoVm;
  selectedIndex: any;

  carregandoLogs: boolean;


  constructor(private logsClient: LogsAlteracoesClient) { }

  ngOnChanges ( changes: SimpleChanges ): void {
    if(!this.idEntidade) {
      this.carregarLogs()
    }
  }

  ngOnInit(): void {
    this.carregarLogs()
  }
  
  carregarLogs() {
  
    this.carregandoLogs = true;
    let req = new LogAlteracaoObterPorIdETipoEntidadeQuery(
      {
        entidade: this.nomeEntidade,
        entidadeId: this.idEntidade,
      }
    )
   
    this.logsClient
      .obterPorIdETipoEntidade(req)
      .pipe(
        finalize(() => {
          this.carregandoLogs = false;
        })
      )
      .subscribe((r) => {
        this.logs = r;
        this.logsKeys = Object.keys(r);
      });
  }

  getTitle(key: string): string {
    let date = new Date(key);
    return date.toLocaleString();
  }

  exibirDetalhes(log: LogAlteracaoVm) {
    this.logSelecionado = log;
    this.detalhes = true;
  }
  ocultarDetalhes() {
    this.logSelecionado = null;
    this.detalhes = false;
  }

  textoTruncado(texto: string) {
    if (texto == null) return "";

    let truncado = texto?.slice(0, 30);
    return texto?.length > truncado.length ? truncado + "..." : texto;
  }
  

}
