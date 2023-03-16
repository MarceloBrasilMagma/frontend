import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PerguntasModeloFormComponent } from './perguntas-modelo-form/perguntas-modelo-form.component';
import { QuestaoComponent } from '../shared/components/questionarios/questao/questao.component';
import { QuestionarioModeloFormComponent } from './questionario-modelo-form/questionario-modelo-form.component';
import { QuestionarioModeloListarComponent } from './questionario-modelo-listar/questionario-modelo-listar.component';

const routes: Routes = [
    {
        path: '',
        component: QuestionarioModeloListarComponent,
        data: {
            title: 'Questionários',
        },
    },
    {
        path: ':questionarioId/preenchimento',
        data: { title: 'Questionário' },
        component: QuestaoComponent
    },
    {
        path: ':questionarioId/preenchimento/:preenchimentoId',
        data: { title: 'Questionário' },
        component: QuestaoComponent
    },
    {
        path: 'cadastrar',
        component: QuestionarioModeloFormComponent,
        data: {
            title: 'Cadastrar Questionário',
        },
    },
    {
        path: 'editar/:id',
        data: { title: 'Editar Questionário' },
        children: [
            {
                path: '',
                component: QuestionarioModeloFormComponent
            },
            {
                path: 'grupo/:grupoId',
                data: { title: 'Perguntas' },
                component: PerguntasModeloFormComponent
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class QuestionariosModeloRoutingModule { }
