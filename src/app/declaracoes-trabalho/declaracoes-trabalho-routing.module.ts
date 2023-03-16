import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeclaracoesTrabalhoFormComponent } from './declaracoes-trabalho-form/declaracoes-trabalho-form.component';
import { DeclaracoesTrabalhoListarComponent } from './declaracoes-trabalho-listar/declaracoes-trabalho-listar.component';

const routes: Routes = [
  {
    path: '',
    component: DeclaracoesTrabalhoListarComponent,
    data: { headerDisplay: 'none' },
  },
  {
    path: 'cadastrar',
    component: DeclaracoesTrabalhoFormComponent,
    data: { title: 'Cadastrar', headerDisplay: 'none' },
  },
  {
    path: 'editar/:id',
    component: DeclaracoesTrabalhoFormComponent,
    data: { title: 'Editar', headerDisplay: 'none' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeclaracoesTrabalhoRoutingModule {}
