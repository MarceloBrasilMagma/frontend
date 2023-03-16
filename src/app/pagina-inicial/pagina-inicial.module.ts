import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { TemplateModule } from './../shared/template/template.module';
import { PaginaInicialComponent } from './pagina-inicial.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaginaInicialRoutingModule } from './pagina-inicial-routing.module';
import { HeaderPaginaInicialComponent } from './components/header-pagina-inicial/header-pagina-inicial.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NzModalModule } from 'ng-zorro-antd/modal';



const antModule = [
  NzCardModule,
  NzIconModule,
  NzButtonModule,
  NzDropDownModule,
  NzBadgeModule,
  NzListModule,
  NzAvatarModule,
  NzModalModule
];
@NgModule({

  declarations: [
    PaginaInicialComponent,
    HeaderPaginaInicialComponent,
  ],
  imports: [
    CommonModule,
    PaginaInicialRoutingModule,
    TemplateModule,
    ...antModule,
    PerfectScrollbarModule,
  ],
})
export class PaginaInicialModule { }
