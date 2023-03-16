import { Component, Input, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize, take } from 'rxjs/operators';
import { DeclaracaoTrabalhoOrcamentoVm, DeclaracaoTrabalhoSituacao, DeclaracaoTrabalhoVm, DeclaracoesTrabalhoClient} from 'web-api-client';
import { OrcamentoFormModalComponent } from '../orcamento-form-modal/orcamento-form-modal.component';

@Component({
  selector: 'app-orcamentos-listar',
  templateUrl: './orcamentos-listar.component.html',
})
export class OrcamentosListarComponent implements OnInit {
  @Input() declaracaoTrabalho: DeclaracaoTrabalhoVm;
  @Input() possuiPermissaoEdicao: boolean;
  @Input() possuiPermissaoExcluirOrcamento: boolean;

  carregandoDeclaracaoTrabalho: boolean;
  excluindoOrcamento: boolean;

  constructor(
    private nzModalService: NzModalService,
    private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient
  ) { }

  ngOnInit(): void { }

  private carregarDeclaracaoTrabalho() {
    this.carregandoDeclaracaoTrabalho = true;
    this.declaracoesTrabalhoClient
      .obterPorId(this.declaracaoTrabalho.id)
      .pipe(
        finalize(() => {
          this.carregandoDeclaracaoTrabalho = false;
        })
      )
      .subscribe((r) => {
        this.declaracaoTrabalho = r;
      });
  }

  abrirModalCadastrarOrcamento() {
    const modal = this.nzModalService.create({
      nzTitle: 'Cadastrar Orçamento',
      nzContent: OrcamentoFormModalComponent,
      nzComponentParams: {
        declaracaoTrabalhoId: this.declaracaoTrabalho.id,
      },
      nzMaskClosable: false,
    });

    modal.afterClose.pipe(take(1)).subscribe((r) => {
      if (r?.ocorreuAlteracao) {
        this.carregarDeclaracaoTrabalho();
      }
    });
  }

  get exibirObservacoes(): boolean{
    return  this.declaracaoTrabalho.situacao === DeclaracaoTrabalhoSituacao.AguardandoClassificacao ||
            this.declaracaoTrabalho.situacao === DeclaracaoTrabalhoSituacao.ClassificacaoRealizada ||
            this.declaracaoTrabalho.situacao === DeclaracaoTrabalhoSituacao.Cancelada ||
            this.declaracaoTrabalho.situacao === DeclaracaoTrabalhoSituacao.Finalizada
  }

  get situacaoDeclaracaoTrabalho(): boolean {
    return !(this.declaracaoTrabalho.situacao === DeclaracaoTrabalhoSituacao.Cancelada ||
    this.declaracaoTrabalho.situacao === DeclaracaoTrabalhoSituacao.Finalizada)
  }

  editarOrcamento(orcamento: DeclaracaoTrabalhoOrcamentoVm) {
    const modal = this.nzModalService.create({
      nzTitle: 'Editar Orçamento',
      nzContent: OrcamentoFormModalComponent,
      nzComponentParams: {
        declaracaoTrabalhoId: this.declaracaoTrabalho.id,
        orcamento: orcamento,
        declaracaoSituacao: this.declaracaoTrabalho.situacao
      },
      nzMaskClosable: false,
      nzWidth: this.exibirObservacoes ? "50%" : "25%"
    });

    modal.afterClose.pipe(take(1)).subscribe((r) => {
      if (r?.ocorreuAlteracao) {
        this.carregarDeclaracaoTrabalho();
      }
    });
  }

  excluirOrcamento(orcamento: DeclaracaoTrabalhoOrcamentoVm) {
    this.excluindoOrcamento = true;
    this.declaracoesTrabalhoClient
      .excluirOrcamento(this.declaracaoTrabalho.id, orcamento.id)
      .pipe(
        finalize(() => {
          this.excluindoOrcamento = false;
        })
      )
      .subscribe((r) => {
        this.declaracaoTrabalho.orcamentos =
          this.declaracaoTrabalho.orcamentos.filter((o) => o != orcamento);
      });
  }

  exportar(){
    this.declaracoesTrabalhoClient
      .exportarOrcamentos(this.declaracaoTrabalho.id)
      .subscribe({
        next: (r) => {
          var blob = new Blob([this.s2ab(atob(r.arquivoBase64))], {
            type: r.tipoArquivo,
          });
          let objectUrl = window.URL.createObjectURL(blob);
          let a = document.createElement('a');
          a.setAttribute('style', 'display: none');
          a.href = objectUrl;
          a.download = r.nomeArquivo;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(objectUrl);
          a.remove();
        }
      });
  }

  s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }

  get orcamentoSomaValoresDespesaAdministrativa(): number {
    return this.declaracaoTrabalho?.orcamentos
      ?.map((o) => o.valorDespesaAdministrativaObservacao === null  ||  o.valorDespesaAdministrativaObservacao === undefined? o.valorDespesaAdministrativa : o.valorDespesaAdministrativaObservacao)
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaValoresCustoAssistencial(): number {
    return this.declaracaoTrabalho?.orcamentos
      ?.map((o) => o.valorCustoAssistencialObservacao === null || o.valorCustoAssistencialObservacao === undefined ? o.valorCustoAssistencial : o.valorCustoAssistencialObservacao)
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaValoresInvestimento(): number {
    return this.declaracaoTrabalho?.orcamentos
      ?.map((o) => o.valorInvestimentoObservacao === null || o.valorInvestimentoObservacao === undefined? o.valorInvestimento : o.valorInvestimentoObservacao)
      .reduce((sum, current) => sum + current, 0);
  }

  get orcamentoSomaTotal(): number {
    return this.declaracaoTrabalho?.orcamentos
      ?.map((o) => o.total)
      .reduce((sum, current) => sum + current, 0);
  }

  get isLoading(): boolean {
    return this.carregandoDeclaracaoTrabalho || this.excluindoOrcamento;
  }
}
