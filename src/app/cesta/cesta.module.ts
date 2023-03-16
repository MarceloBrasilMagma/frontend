import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CestaEditarComponent } from './cesta-editar/cesta-editar.component';
import { CestaListarComponent } from './cesta-listar/cesta-listar.component';
import { CestaRoutingModule } from './cesta-routing.module';
import { CestaProjetosListarComponent } from './components/cesta-projetos-listar/cesta-projetos-listar.component';


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
  NzGridModule,
  NzPopoverModule,
  NzStatisticModule,
  NzSpaceModule
]

@NgModule({
  declarations: [
    CestaListarComponent,
    CestaEditarComponent,
    CestaProjetosListarComponent
  ],
  imports: [
    CommonModule,
    CestaRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ...antModule
  ]
})
export class CestaModule { }