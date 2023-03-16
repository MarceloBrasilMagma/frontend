import { NgModule } from '@angular/core';
import { DeclaracoesTrabalhoRoutingModule } from './declaracoes-trabalho-routing.module';
import { DeclaracoesTrabalhoFormComponent } from './declaracoes-trabalho-form/declaracoes-trabalho-form.component';
import { DeclaracaoTrabalhoCadastrarAnexarComponent } from './components/declaracao-trabalho-cadastrar-anexar/declaracao-trabalho-cadastrar-anexar.component';
import { DeclaracaoTrabalhoEditarAnexarComponent } from './components/declaracao-trabalho-editar-anexar/declaracao-trabalho-editar-anexar.component';
import { OrcamentoFormModalComponent } from './components/orcamento-form-modal/orcamento-form-modal.component';
import { OrcamentosListarComponent } from './components/orcamentos-listar/orcamentos-listar.component';
import { DeclaracoesTrabalhoListarComponent } from './declaracoes-trabalho-listar/declaracoes-trabalho-listar.component';

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
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { SolicitacaoAjustesDtComponent } from './components/solicitacao-ajustes-dt/solicitacao-ajustes-dt.component';
import { SharedModule } from '../shared/shared.module';
import { PermissaoDeclaracaoTrabalhoModalComponent } from './components/permissao-declaracao-trabalho-modal/permissao-declaracao-trabalho-modal.component';

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
  NzUploadModule,
  NzModalModule,
  NzPageHeaderModule,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DeclaracoesTrabalhoRoutingModule,
    ...antdModule,
    NgxMaskModule.forRoot(),
    SharedModule,
  ],
  exports: [OrcamentoFormModalComponent],
  declarations: [
    DeclaracoesTrabalhoFormComponent,
    DeclaracoesTrabalhoListarComponent,
    DeclaracaoTrabalhoCadastrarAnexarComponent,
    DeclaracaoTrabalhoEditarAnexarComponent,
    OrcamentoFormModalComponent,
    OrcamentosListarComponent,
    SolicitacaoAjustesDtComponent,
    PermissaoDeclaracaoTrabalhoModalComponent,
  ],
})
export class DeclaracoesTrabalhoModule {}
