import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NgModule } from '@angular/core';
import { RelatoriosRoutingModule } from './relatorios-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CronogramaComponent } from './cronograma/cronograma.component';
import { PlanoDeAcaoComponent } from './plano-acao/plano-acao.component';
import { OrcamentoComponent } from './orcamento/orcamento.component';
import { AbrangenciaComponent } from './abrangencia/abrangencia.component';
import { DeclaracoesTrabalhoRelatorioComponent } from './declaracoes-trabalho-relatorio/declaracoes-trabalho-relatorio.component';
import { HeaderRelatoriosComponent } from './components/header-relatorios/header-relatorios.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DtRelatoriosAreaComponent } from './declaracoes-trabalho-relatorio/components/dt-relatorios-area/dt-relatorios-area.component';
import { DtRelatoriosCartoesComponent } from './declaracoes-trabalho-relatorio/components/dt-relatorios-cartoes/dt-relatorios-cartoes.component';
import { DtRelatoriosSituacaoComponent } from './declaracoes-trabalho-relatorio/components/dt-relatorios-situacao/dt-relatorios-situacao.component';
import { DtRelatoriosDeclaracoesComponent } from './declaracoes-trabalho-relatorio/components/dt-relatorios-declaracoes/dt-relatorios-declaracoes.component';
import { SharedModule } from '../shared/shared.module';
import { OrcamentoGeralComponent } from './orcamento/components/orcamento-geral/orcamento-geral.component';
import { OrcamentoMesAMesComponent } from './orcamento/components/orcamento-mes-a-mes/orcamento-mes-a-mes.component';
import { OrcamentoSituacaoComponent } from './orcamento/components/orcamento-situacao/orcamento-situacao.component';
import { OrcamentoProjetosComponent } from './orcamento/components/orcamento-projetos/orcamento-projetos.component';
import { PlanoAcaoPrevisaoComponent } from './plano-acao/components/plano-acao-previsao/plano-acao-previsao.component';
import { PlanoAcaoSituacaoComponent } from './plano-acao/components/plano-acao-situacao/plano-acao-situacao.component';
import { PlanoAcaoAcoesComponent } from './plano-acao/components/plano-acao-acoes/plano-acao-acoes.component';
import { AbrangenciaMesAMesComponent } from './abrangencia/components/abrangencia-mes-a-mes/abrangencia-mes-a-mes.component';
import { AbrangenciaTotalComponent } from './abrangencia/components/abrangencia-total/abrangencia-total.component';
import { AbrangenciaProjetosComponent } from './abrangencia/components/abrangencia-projetos/abrangencia-projetos.component';
import { CronogramaControlePrazoComponent } from './cronograma/components/cronograma-controle-prazo/cronograma-controle-prazo.component';
import { CronogramaSituacaoComponent } from './cronograma/components/cronograma-situacao/cronograma-situacao.component';
import { CronogramaProjetosComponent } from './cronograma/components/cronograma-projetos/cronograma-projetos.component';
import { NgChartjsModule } from 'ng-chartjs';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { RelatoriosListarComponent } from './relatorios-listar/relatorios-listar.component';

const antModule = [
  NzDropDownModule,
  NzDatePickerModule,
  NzIconModule,
  NzCardModule,
  NzBadgeModule,
  NzCollapseModule,
  NzFormModule,
  NzSelectModule,
  NzButtonModule,
  NzTagModule,
  NzAvatarModule,
  NzInputModule
];

@NgModule({
  declarations: [
    CronogramaComponent,
    PlanoDeAcaoComponent,
    OrcamentoComponent,
    AbrangenciaComponent,
    DeclaracoesTrabalhoRelatorioComponent,
    HeaderRelatoriosComponent,
    DtRelatoriosAreaComponent,
    DtRelatoriosCartoesComponent,
    DtRelatoriosSituacaoComponent,
    DtRelatoriosDeclaracoesComponent,
    OrcamentoGeralComponent,
    OrcamentoMesAMesComponent,
    OrcamentoSituacaoComponent,
    OrcamentoProjetosComponent,
    PlanoAcaoPrevisaoComponent,
    PlanoAcaoSituacaoComponent,
    PlanoAcaoAcoesComponent,
    AbrangenciaMesAMesComponent,
    AbrangenciaTotalComponent,
    AbrangenciaProjetosComponent,
    CronogramaControlePrazoComponent,
    CronogramaSituacaoComponent,
    CronogramaProjetosComponent,
    RelatoriosListarComponent
  ],
  imports: [
    CommonModule,
    RelatoriosRoutingModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgChartjsModule,
    ...antModule
  ]
})
export class RelatoriosModule { }
