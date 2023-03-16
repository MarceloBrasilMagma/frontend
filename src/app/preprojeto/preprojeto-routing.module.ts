import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PreProjetoListarComponent } from './preprojeto-listar/preprojeto-listar.component';
import { PreProjetoCadastrarComponent } from './preprojeto-cadastrar/preprojeto-cadastrar.component';
import { PreProjetoEditarComponent } from './preprojeto-editar/preprojeto-editar.component';
import { AuthGuard } from '../authentication/auth-guard.service';
import { QuestionarioListarComponent } from '../shared/components/questionarios/questionario-listar/questionario-listar.component';
import { PerguntasFormComponent } from '../shared/components/questionarios/perguntas-form/perguntas-form.component';
import { QuestaoComponent } from '../shared/components/questionarios/questao/questao.component';
import { QuestionarioFormComponent } from '../shared/components/questionarios/questionario-form/questionario-form.component';
import { QuestionarioPreenchimentoListarComponent } from '../shared/components/questionarios/questionario-preenchimento-listar/questionario-preenchimento-listar.component';

const routes: Routes = [
  {
    path: '',
    component: PreProjetoListarComponent,
    data: { headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
  {
    path: 'cadastrar',
    component: PreProjetoCadastrarComponent,
    data: { title: 'Cadastrar', headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
  {
    path: 'editar/:id',
    data: { title: 'Editar', headerDisplay: 'none' },
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: PreProjetoEditarComponent,
      },
      {
        path: 'questionario',
        data: { title: 'Questionários', headerDisplay: 'none' },
        children: [
          {
            path: '',
            component: QuestionarioListarComponent,
            data: {title: 'Questionários'}
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
            ],
          },
          {
            path: ':questionarioId/preencher',
            component: QuestaoComponent,
            data: {
              title: 'Preencher Questionário',
            },
          },
          {
            path: ':questionarioId/preenchimentos',
            children: [
              {
                path: '',
                component: QuestionarioPreenchimentoListarComponent,
                data: {
                  title: 'Preenchimentos do Questionário',
                }
              },
              {
                path: ':preenchimentoId',
                component: QuestaoComponent
                // data: {title: '' }
              }
            ]
          }
        ]
      }    
    ]

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreProjetoRoutingModule { }
