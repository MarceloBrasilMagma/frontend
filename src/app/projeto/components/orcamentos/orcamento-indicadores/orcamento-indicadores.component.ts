import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  PreProjetoOrcamentoVm,
  PreProjetosClient,
  ProjetoVm,
} from 'web-api-client';

@Component({
  selector: 'app-orcamento-indicadores',
  templateUrl: './orcamento-indicadores.component.html',
  styleUrls: ['./orcamento-indicadores.component.scss'],
})
export class OrcamentoIndicadoresComponent implements OnInit, OnChanges {
  @Input() projeto: ProjetoVm;

  orcamentos: PreProjetoOrcamentoVm[];

  constructor(private preProjetoClient: PreProjetosClient) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!!this.projeto) {
      if (!!this.projeto.acompanhamentoOrcamentario.length) {
      } else {
        this.preProjetoClient
          .obterOrcamentos(this.projeto.preProjeto.id)
          .subscribe((r) => {
            let total = 0;
            for (let o of r) {
              total += this.getTotal(o);
            }

            this.projeto.valorTotal = total;
            this.projeto.valorRealizado = 0;
            this.projeto.valorSaldo = total;
          });
      }
    }
  }

  get porcentagemRealizado() {
    if (isNaN((this.projeto.valorRealizado / this.projeto.valorTotal) * 100)) {
      return true;
    } else {
      return false;
    }
  }

  get porcentagemSaldo() {
    if (isNaN((this.projeto.valorRealizado / this.projeto.valorTotal) * 100)) {
      return true;
    } else {
      return false;
    }
  }

  getTotal(o: PreProjetoOrcamentoVm): number {
    let valor =
      !!o.totalRessalva || o.totalRessalva === 0 ? o.totalRessalva : o.total;

    return valor;
  }
}
