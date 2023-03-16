import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { PortifolioProjetosListarComponent } from './components/portifolio-projetos-listar/portifolio-projetos-listar.component';

import { PortifolioListarComponent } from './portifolio-listar/portifolio-listar.component';
import { PortifolioRoutingModule } from './portifolio-routing.module';
import { PortifolioGraficoComponent } from './components/portifolio-grafico/portifolio-grafico.component';
import { NgChartjsModule } from 'ng-chartjs';
import { PortifolioVisualizarComponent } from './portifolio-visualizar/portifolio-visualizar.component';
import { PortifolioCadastrarEditarComponent } from './portifolio-cadastrar-editar/portifolio-cadastrar-editar.component';



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
  NzCarouselModule,
  NzRadioModule,
  NzDrawerModule,
  NzTabsModule,
  NzProgressModule,
  NzBadgeModule,
]

@NgModule({
  declarations: [
    PortifolioListarComponent,
    PortifolioProjetosListarComponent,
   
    PortifolioGraficoComponent,
    PortifolioVisualizarComponent,
    PortifolioCadastrarEditarComponent
  ],
  imports: [
    CommonModule,
    PortifolioRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartjsModule,
    ...antModule
  ]
})
export class PortifolioModule { }