import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { LogAlteracaoObterPorIdETipoEntidadeQuery, LogAlteracaoVm, LogsAlteracoesClient } from 'web-api-client';

@Component({
  selector: 'app-log-alteracao',
  templateUrl: './log-alteracao.component.html',
  styleUrls: ['./log-alteracao.component.scss'],
})
export class LogAlteracaoComponent implements OnInit {
  @Input() nomeEntidade: string;
  @Input() idEntidade: number;

  logs: any;
  logsKeys: any;

  detalhes: boolean;
  logSelecionado: LogAlteracaoVm;
  selectedIndex: any;

  carregandoLogs: boolean;

  filtrosForm: UntypedFormGroup;

  constructor(private logsClient: LogsAlteracoesClient) { }

  ngOnInit(): void {
    this.initFiltrosForm();
    this.carregarLogs()
  }
  private initFiltrosForm() {
    this.filtrosForm = new UntypedFormBuilder().group({
      usuarioNome: [null],
      dataInicial: [null],
      dataFinal: [null],
    });
  }

  resetForm(): void {
    this.filtrosForm.reset();
  }

  carregarLogs() {
    if (!this.idEntidade || !this.nomeEntidade)
      return;

    this.carregandoLogs = true;
    let fValue = this.filtrosForm.value;

    let req = new LogAlteracaoObterPorIdETipoEntidadeQuery(
      {
        entidade: this.nomeEntidade,
        entidadeId: this.idEntidade,
        usuarioNome: fValue["usuarioNome"]

      }
    )

    req.dataInicial = fValue["dataInicial"] ? new Date(fValue["dataInicial"]) : null;
    req.dataFinal = fValue["dataFinal"] ? new Date(fValue["dataFinal"]) : null;

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
    return `${date.toLocaleString()} - ${this.logs[key][0].usuarioNome}`;
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
