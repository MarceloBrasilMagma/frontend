import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapaEstrategicoRoutingModule } from './mapa-estrategico-routing.module';
import { MapaEstrategicoComponent } from './mapa-estrategico/mapa-estrategico.component';
import { MapaEstrategicoCardComponent } from './components/mapa-estrategico-card/mapa-estrategico-card.component';
import { NgChartjsModule } from 'ng-chartjs';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedModule } from '../shared/shared.module';

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
];

@NgModule({
  declarations: [
    MapaEstrategicoComponent,
    MapaEstrategicoCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MapaEstrategicoRoutingModule,
    NgxMaskModule.forRoot(),
    NgxPermissionsModule.forChild(),
    SharedModule,
    ...antdModule
  ]
})
export class MapaEstrategicoModule { }
