import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared.module';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { HeaderComponent } from './header/header.component';
import { SearchComponent } from './search/search.component';
import { QuickViewComponent } from './quick-view/quick-view.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { FooterComponent } from './footer/footer.component';

import { SideNavDirective } from '../directives/side-nav.directive';
import { ThemeConstantService } from '../services/theme-constant.service';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

const antdModule = [
  NzAvatarModule,
  NzBadgeModule,
  NzRadioModule,
  NzDropDownModule,
  NzListModule,
  NzDrawerModule,
  NzDividerModule,
  NzSwitchModule,
  NzInputModule,
  NzButtonModule,
  NzTagModule,
  NzCardModule,
  NzGridModule,
  NzToolTipModule,
  NzPopconfirmModule,
  NzDatePickerModule
];

@NgModule({
  exports: [
    CommonModule,
    HeaderComponent,
    SearchComponent,
    QuickViewComponent,
    SideNavComponent,
    SideNavDirective,
    FooterComponent
  ],
  imports: [RouterModule, CommonModule, SharedModule, ...antdModule],
  declarations: [
    HeaderComponent,
    SearchComponent,
    QuickViewComponent,
    SideNavComponent,
    SideNavDirective,
    FooterComponent
  ],
  providers: [DecimalPipe, ThemeConstantService],
})
export class TemplateModule {}
