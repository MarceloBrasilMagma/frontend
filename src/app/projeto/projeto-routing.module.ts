import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../authentication/auth-guard.service';
import { PerguntasFormComponent } from '../shared/components/questionarios/perguntas-form/perguntas-form.component';
import { QuestaoComponent } from '../shared/components/questionarios/questao/questao.component';
import { QuestionarioFormComponent } from '../shared/components/questionarios/questionario-form/questionario-form.component';
import { QuestionarioListarComponent } from '../shared/components/questionarios/questionario-listar/questionario-listar.component';
import { QuestionarioPreenchimentoListarComponent } from '../shared/components/questionarios/questionario-preenchimento-listar/questionario-preenchimento-listar.component';
import { ProjetoEditarComponent } from './projeto-editar/projeto-editar.component';
import { ProjetoListarComponent } from './projeto-listar/projeto-listar.component';

const routes: Routes = [
  {
    path: '',
    component: ProjetoListarComponent,
    data: { headerDisplay: 'none' },
    canActivate: [AuthGuard],
  },
  {
    path: 'cadastrar',
    component: ProjetoEditarComponent,
    data: { title: 'Cadastrar', headerDisplay: 'none' },
  },
  {
    path: 'editar/:id',
    data: { title: 'Editar', headerDisplay: 'none' },
    children: [
      {
        path: '',
        component: ProjetoEditarComponent,
      },
      {
        path: 'questionario',
        data: { title: 'Questionários', headerDisplay: 'none' },
        children: [
          {
            path: '',
            component: QuestionarioListarComponent,
            data: { title: 'Questionários' },
          },
          {
            path: 'cadastrar',
            component: QuestionarioFormComponent,
            data: {
              title: 'Cadastrar Questionário',
            },
          },
          {
            path: 'editar/:questionarioId',
            data: { title: 'Editar Questionário' },
            children: [
              {
                path: '',
                component: QuestionarioFormComponent,
              },
              {
                path: 'grupo/:grupoId',
                data: { title: 'Perguntas' },
                component: PerguntasFormComponent,
              },
              {
                path: 'preencher',
                component: QuestaoComponent,
                data: {
                  title: 'Preencher Questionário',
                },
              },
              {
                path: 'preenchimentos',
                children: [
                  {
                    path: '',
                    component: QuestionarioPreenchimentoListarComponent,
                    data: {
                      title: 'Preenchimentos do Questionário',
                    },
                  },
                  {
                    path: ':preenchimentoId',
                    component: QuestaoComponent,
                    // data: {title: '' }
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjetoRoutingModule {}
