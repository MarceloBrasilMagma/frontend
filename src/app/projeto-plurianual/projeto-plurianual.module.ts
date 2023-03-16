import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjetoPlurianualRoutingModule } from './projeto-plurianual-routing.module';
import { ProjetoPlurianualListarComponent } from './projeto-plurianual-listar/projeto-plurianual-listar.component';
import { ProjetoPlurianualEditarComponent } from './projeto-plurianual-editar/projeto-plurianual-editar.component';

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
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PreProjetoRoutingModule } from '../preprojeto/preprojeto-routing.module';
import { NgxMaskModule } from 'ngx-mask';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedModule } from '../shared/shared.module';
import { SolicitarAjustesProjetoPlurianualComponent } from './components/solicitar-ajustes-projeto-plurianual/solicitar-ajustes-projeto-plurianual.component';
import { OrcamentoProjetoPlurianualFormModalComponent } from './components/orcamento-projeto-plurianual-form-modal/orcamento-projeto-plurianual-form-modal.component';
import { OrcamentoProjetoPlurianualListarComponent } from './components/orcamento-projeto-plurianual-listar/orcamento-projeto-plurianual-listar.component';
import { DeclaracoesTrabalhoModule } from '../declaracoes-trabalho/declaracoes-trabalho.module';
import { ProjetoPlurianualAnexoCadastrarComponent } from './components/projeto-plurianual-anexo-cadastrar/projeto-plurianual-anexo-cadastrar.component';
import { ProjetoPlurianualAnexoEditarComponent } from './components/projeto-plurianual-anexo-editar/projeto-plurianual-anexo-editar.component';
import { MenuLateralPlurianualComponent } from './components/menu-lateral-plurianual/menu-lateral-plurianual.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { ProjetoPlurianualImpressaoComponent } from './components/projeto-plurianual-impressao/projeto-plurianual-impressao.component';
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
  NzDrawerModule,
];

@NgModule({
  declarations: [
    ProjetoPlurianualListarComponent,
    ProjetoPlurianualEditarComponent,
    SolicitarAjustesProjetoPlurianualComponent,
    OrcamentoProjetoPlurianualFormModalComponent,
    OrcamentoProjetoPlurianualListarComponent,
    ProjetoPlurianualAnexoCadastrarComponent,
    ProjetoPlurianualAnexoEditarComponent,
    MenuLateralPlurianualComponent,
    ProjetoPlurianualImpressaoComponent,
  ],
  imports: [
    CommonModule,
    ProjetoPlurianualRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PreProjetoRoutingModule,
    ...antdModule,
    NgxMaskModule.forRoot(),
    NgxPermissionsModule.forChild(),
    SharedModule,
    DeclaracoesTrabalhoModule,
  ],
})
export class ProjetoPlurianualModule {}
