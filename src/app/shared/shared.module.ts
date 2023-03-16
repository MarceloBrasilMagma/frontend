import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SearchPipe } from './pipes/search.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NumericDirective } from './directives/numeric.directive';
import { NgxPermissionsModule } from 'ngx-permissions';
import { LogAlteracaoComponent } from './components/log-alteracao/log-alteracao.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ModalConfirmacaoComponent } from './components/modal-confirmacao/modal-confirmacao.component';
import { RessalvaListarOrcamentosComponent } from './components/ressalva-preprojeto/ressalva-listar-orcamentos/ressalva-listar-orcamentos.component';
import { RessalvaDeclaracaoTrabalhoFormComponent } from './components/ressalva-preprojeto/ressalva-declaracao-trabalho-form/ressalva-declaracao-trabalho-form.component';
import { RessalvaPreprojetoFormComponent } from './components/ressalva-preprojeto/ressalva-preprojeto-form/ressalva-preprojeto-form.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NgxMaskModule } from 'ngx-mask';
import { RessalvaPlurianualFormComponent } from './components/ressalva-preprojeto/ressalva-plurianual-form/ressalva-plurianual-form.component';
import { WordSpacePipe } from './pipes/word-space.pipe';
import { PausarCancelarProjetoModalComponent } from './components/pausar-cancelar-projeto-modal/pausar-cancelar-projeto-modal.component';
import { QuestionarioFormComponent } from './components/questionarios/questionario-form/questionario-form.component';
import { QuestionarioListarComponent } from './components/questionarios/questionario-listar/questionario-listar.component';
import { PerguntasFormComponent } from './components/questionarios/perguntas-form/perguntas-form.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { QuestionarioPreenchimentoListarComponent } from './components/questionarios/questionario-preenchimento-listar/questionario-preenchimento-listar.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

@NgModule({
  exports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    NzIconModule,
    PerfectScrollbarModule,
    SearchPipe,
    SafePipe,
    NumericDirective,
    NgxPermissionsModule,
    ModalConfirmacaoComponent,
    LogAlteracaoComponent,
    RessalvaListarOrcamentosComponent,
    WordSpacePipe,
    PausarCancelarProjetoModalComponent,
    PerguntasFormComponent,
    QuestionarioFormComponent,
    QuestionarioListarComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    NgxMaskModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NzIconModule,
    NzToolTipModule,
    NzModalModule,
    NzProgressModule,
    NzGridModule,
    NzInputModule,
    NzFormModule,
    NzButtonModule,
    PerfectScrollbarModule,
    NzTabsModule,
    NzTableModule,
    NzCardModule,
    NzSpaceModule,
    NzCollapseModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzSpinModule,
    NzRadioModule,
    NzSelectModule,
    NzCardModule,
    NzSelectModule,
    NzIconModule,
    NzRadioModule,
    NzToolTipModule,
    NzButtonModule,
    NzDividerModule,
    NzTableModule,
    NzDatePickerModule,
    NzSpaceModule,
    NzCollapseModule,
    NzFormModule,
    NzRadioModule,
    NzInputModule,
    NzCheckboxModule,
    NzCardModule,
    NzSelectModule,
    NzIconModule,
    NzRadioModule,
    NzCheckboxModule,
    DragDropModule,
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
    NzDropDownModule,
  ],
  declarations: [
    SearchPipe,
    SafePipe,
    NumericDirective,
    LogAlteracaoComponent,
    ModalConfirmacaoComponent,
    RessalvaListarOrcamentosComponent,
    RessalvaDeclaracaoTrabalhoFormComponent,
    RessalvaPreprojetoFormComponent,
    RessalvaPlurianualFormComponent,
    WordSpacePipe,
    PausarCancelarProjetoModalComponent,
    PerguntasFormComponent,
    QuestionarioFormComponent,
    QuestionarioListarComponent,
    QuestionarioPreenchimentoListarComponent,
  ],
})
export class SharedModule {}
