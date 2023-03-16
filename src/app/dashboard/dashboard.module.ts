import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

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

import { NgxMaskModule, IConfig } from 'ngx-mask';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzFormModule } from 'ng-zorro-antd/form';
import { ReactiveFormsModule } from '@angular/forms';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

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
];

@NgModule({
  imports: [
    SharedModule,

    ReactiveFormsModule,
    DashboardRoutingModule,
    ...antdModule,    
    NgxMaskModule.forRoot(),
  ],
  exports: [],
  declarations: [DashboardComponent],
})
export class DashboardModule { }
