import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { ConfiguracoesRoutingModule } from './configuracoes-routing.module';
import { IndicadoresListarComponent } from './indicadores-projeto/indicadores-listar/indicadores-listar.component';
import { IndicadoresFormComponent } from './indicadores-projeto/indicadores-form/indicadores-form.component';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { EquipesProjetosListarComponent } from './equipes-projetos/equipes-projetos-listar/equipes-projetos-listar.component';
import { EquipesProjetosEditarComponent } from './equipes-projetos/equipes-projetos-editar/equipes-projetos-editar.component';
import { ObjetivosEstrategicosListarComponent } from './objetivos-estrategicos/objetivos-estrategicos-listar/objetivos-estrategicos-listar.component';
import { ObjetivosEstrategicosEditarComponent } from './objetivos-estrategicos/objetivos-estrategicos-editar/objetivos-estrategicos-editar.component';
import { PeriodicidadesListarComponent } from './periodicidades/periodicidades-listar/periodicidades-listar.component';
import { PeriodicidadesEditarComponent } from './periodicidades/periodicidades-editar/periodicidades-editar.component';
import { ConfiguracoesListarComponent } from './configuracoes-listar/configuracoes-listar.component';

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
  NzSpaceModule,
  NzCollapseModule,
  NzTreeSelectModule,
  NzTabsModule,
  NzToolTipModule,
  NzRadioModule,
  NzStepsModule,
  NzTagModule,
  NzAvatarModule,
  NzPopconfirmModule
]

@NgModule({
  declarations: [
    IndicadoresListarComponent,
    IndicadoresFormComponent,
    EquipesProjetosListarComponent,
    EquipesProjetosEditarComponent,
    ObjetivosEstrategicosListarComponent,
    ObjetivosEstrategicosEditarComponent,
    PeriodicidadesListarComponent,
    PeriodicidadesEditarComponent,
    ConfiguracoesListarComponent
  ],
  imports: [
    CommonModule,
    ConfiguracoesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ...antModule
  ]
})
export class ConfiguracoesModule { }
