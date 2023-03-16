import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestaoComponent } from '../shared/components/questionarios/questao/questao.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { QuestionariosModeloRoutingModule } from './questionarios-modelo-routing-module';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { QuestionarioModeloFormComponent } from './questionario-modelo-form/questionario-modelo-form.component';
import { PerguntasModeloFormComponent } from './perguntas-modelo-form/perguntas-modelo-form.component';
import { QuestionarioModeloListarComponent } from './questionario-modelo-listar/questionario-modelo-listar.component';
import { DadosProjetoImpressaoComponent } from '../shared/components/questionarios/questao/components/dados-projeto-impressao/dados-projeto-impressao.component';

const antModule = [
  NzFormModule,
  NzRadioModule,
  NzInputModule,
  NzCheckboxModule,
  NzCardModule,
  NzSelectModule,
  NzIconModule,
  NzRadioModule,
  NzCheckboxModule,
  NzToolTipModule,
  NzButtonModule,
  NzSwitchModule,
  NzDatePickerModule,
  NzDividerModule,
  NzTableModule,
  NzSpaceModule,
  NzBackTopModule,
  NzPopconfirmModule,
  NzSkeletonModule,
  NzCollapseModule,
];
@NgModule({
  declarations: [
    QuestaoComponent,
    PerguntasModeloFormComponent,
    QuestionarioModeloFormComponent,
    QuestionarioModeloListarComponent,
    DadosProjetoImpressaoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuestionariosModeloRoutingModule,
    DragDropModule,
    ...antModule,
  ],
  exports: [
    QuestaoComponent,
    PerguntasModeloFormComponent,
    DadosProjetoImpressaoComponent,
  ],
})
export class QuestionariosModeloModule {}
