import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjetoRoutingModule } from './projeto-routing.module';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ProjetoListarComponent } from './projeto-listar/projeto-listar.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ProjetoEditarComponent } from './projeto-editar/projeto-editar.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CentroCustoFormComponent } from './components/centro-custo-form/centro-custo-form.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { DadosProjetoFormComponent } from './components/dados-projeto-form/dados-projeto-form.component';
import { DiarioBordoComponent } from './components/diario-bordo/diario-bordo.component';
import { TimelineProjetoComponent } from './components/timeline-projeto/timeline-projeto.component';
import { CabecalhoProjetoComponent } from './components/cabecalho-projeto/cabecalho-projeto.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { DiarioBordoFormComponent } from './components/diario-bordo/diario-bordo-form/diario-bordo-form.component';
import { LicaoAprendidaComponent } from './components/licao-aprendida/licao-aprendida.component';
import { PlanoAcaoComponent } from './components/plano-acao/plano-acao.component';
import { LicaoAprendidaFormComponent } from './components/licao-aprendida/licao-aprendida-form/licao-aprendida-form.component';
import { PlanoAcaoFormComponent } from './components/plano-acao/plano-acao-form/plano-acao-form.component';
import { PlanoAcaoRelatorioComponent } from './components/plano-acao-relatorio/plano-acao-relatorio.component';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { IndicadoresAvaliacaoComponent } from './components/indicadores-avaliacao/indicadores-avaliacao.component';
import { OrcamentoGraficoComponent } from './components/orcamentos/orcamento-grafico/orcamento-grafico.component';
import { OrcamentoTabelaComponent } from './components/orcamentos/orcamento-tabela/orcamento-tabela.component';
import { CronogramaGraficoComponent } from './components/cronogramas/cronograma-grafico/cronograma-grafico.component';
import { CronogramaTabelaComponent } from './components/cronogramas/cronograma-tabela/cronograma-tabela.component';
import { CronogramaFormComponent } from './components/cronogramas/cronograma-form/cronograma-form.component';
import { OrcamentoIndicadoresComponent } from './components/orcamentos/orcamento-indicadores/orcamento-indicadores.component';
import { PaginaImpressaoComponent } from './components/pagina-impressao/pagina-impressao.component';
import { CronogramaImportComponent } from './components/cronogramas/cronograma-import/cronograma-import.component';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgChartjsModule } from 'ng-chartjs';
import { CabecalhoComponent } from './components/cabecalho/cabecalho.component';
import { CapaComponent } from './components/capa/capa.component';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { MenuLateralComponent } from './components/menu-lateral/menu-lateral.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzAnchorModule } from 'ng-zorro-antd/anchor';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { TapComponent } from './components/tap/tap.component';
import { ConogramaIndicadoresComponent } from './components/cronogramas/conograma-indicadores/conograma-indicadores.component';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { HistoricoAlteracoesComponent } from './components/historico-alteracoes/historico-alteracoes.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzListModule } from 'ng-zorro-antd/list';
import { SharedModule } from '../shared/shared.module';

const antModule = [
  NzCardModule,
  NzTableModule,
  NzIconModule,
  NzButtonModule,
  NzFormModule,
  NzInputModule,
  NzDatePickerModule,
  NzDividerModule,
  NzModalModule,
  NzSelectModule,
  NzPopoverModule,
  NzSpaceModule,
  NzCollapseModule,
  NzTreeSelectModule,
  NzTabsModule,
  NzToolTipModule,
  NzRadioModule,
  NzStepsModule,
  NzTagModule,
  NzAvatarModule,
  NzPopconfirmModule,
  NzUploadModule,
  NzSpinModule,
  NzSkeletonModule,
  NzDrawerModule,
  NzAnchorModule,
  NzBadgeModule,
  NzTimelineModule,
  NzAffixModule,
  NzDropDownModule,
  NzListModule
];

@NgModule({
  declarations: [
    ProjetoListarComponent,
    ProjetoEditarComponent,
    CentroCustoFormComponent,
    DadosProjetoFormComponent,
    DiarioBordoComponent,
    TimelineProjetoComponent,
    CabecalhoProjetoComponent,
    DiarioBordoFormComponent,
    LicaoAprendidaComponent,
    PlanoAcaoComponent,
    LicaoAprendidaFormComponent,
    PlanoAcaoFormComponent,
    PlanoAcaoRelatorioComponent,
    IndicadoresAvaliacaoComponent,
    OrcamentoGraficoComponent,
    OrcamentoTabelaComponent,
    CronogramaGraficoComponent,
    CronogramaTabelaComponent,
    OrcamentoIndicadoresComponent,
    CronogramaFormComponent,
    PaginaImpressaoComponent,
    CronogramaImportComponent,
    CabecalhoComponent,
    CapaComponent,
    MenuLateralComponent,
    TapComponent,
    ConogramaIndicadoresComponent,
    HistoricoAlteracoesComponent,
  ],
  imports: [
    CommonModule,
    ProjetoRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartjsModule,
    SharedModule,
    ...antModule,
  ],
})
export class ProjetoModule {}
