import { NgModule } from '@angular/core';
import { PreProjetoCadastrarComponent } from './preprojeto-cadastrar/preprojeto-cadastrar.component';
import { PreProjetoRoutingModule } from './preprojeto-routing.module';
import { PreProjetoListarComponent } from './preprojeto-listar/preprojeto-listar.component';
import { PreProjetoEditarComponent } from './preprojeto-editar/preprojeto-editar.component';

/** Import any ng-zorro components as the module required except icon module */
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NgChartjsModule } from 'ng-chartjs';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgxMaskModule } from 'ngx-mask';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SolicitacaoAjustesProjetoComponent } from './components/solicitacao-ajustes-projeto/solicitacao-ajustes-projeto.component';
import { OrcamentoProjetoListarComponent } from './components/orcamento-projeto-listar/orcamento-projeto-listar.component';
import { OrcamentoProjetoFormModalComponent } from './components/orcamento-projeto-form-modal/orcamento-projeto-form-modal.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { AnaliseEconomicoFinanceiraFormComponent } from './components/analise-economico-financeira-form/analise-economico-financeira-form.component';
import { AnaliseEconomicoFinanceiraAnexoCadastrarComponent } from './components/analise-economico-financeira-anexo-cadastrar/analise-economico-financeira-anexo-cadastrar.component';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { AnaliseEconomicoFinanceiraAnexoEditarComponent } from './components/analise-economico-financeira-anexo-editar/analise-economico-financeira-anexo-editar.component';
import { SharedModule } from '../shared/shared.module';
import { DeclaracoesTrabalhoModule } from '../declaracoes-trabalho/declaracoes-trabalho.module';
import { PermissaoProjetoModalComponent } from './components/permissao-projeto-modal/permissao-projeto-modal.component';
import { AprovacaoModalComponent } from './components/aprovacao-modal/aprovacao-modal.component';

/** Assign all ng-zorro modules to this array*/
const antdModule = [
  NzButtonModule,
  NzCardModule,
  NzListModule,
  NzTagModule,
  NzBadgeModule,
  NzProgressModule,
  NzDropDownModule,
  NgChartjsModule,
  NzDatePickerModule,
  NzSelectModule,
  NzSpinModule,
  NzToolTipModule,
  NzAvatarModule,
  NzFormModule,
  NzTimePickerModule,
  NzStepsModule,
  NzCollapseModule,
  NzInputModule,
  NzRadioModule,
  NzResultModule,
  NzIconModule,
  NzDividerModule,
  NzSpaceModule,
  NzPopconfirmModule,
  NzAffixModule,
  NzTableModule,
  NzSkeletonModule,
  NzTabsModule,
  NzModalModule,
  NzUploadModule,
  NzPageHeaderModule,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PreProjetoRoutingModule,
    ...antdModule,
    NgxMaskModule.forRoot(),
    NgxPermissionsModule.forChild(),
    SharedModule,
    DeclaracoesTrabalhoModule,
  ],
  exports: [],
  declarations: [
    PreProjetoCadastrarComponent,
    PreProjetoListarComponent,
    PreProjetoEditarComponent,
    SolicitacaoAjustesProjetoComponent,
    OrcamentoProjetoListarComponent,
    OrcamentoProjetoFormModalComponent,
    AnaliseEconomicoFinanceiraFormComponent,
    AnaliseEconomicoFinanceiraAnexoCadastrarComponent,
    AnaliseEconomicoFinanceiraAnexoEditarComponent,
    PermissaoProjetoModalComponent,
    AprovacaoModalComponent,
  ],
})
export class PreProjetoModule { }
