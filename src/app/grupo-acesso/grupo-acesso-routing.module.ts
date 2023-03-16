import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GrupoAcessoFormComponent } from './grupo-acesso-form/grupo-acesso-form.component';
import { GrupoAcessoListarComponent } from './grupo-acesso-listar/grupo-acesso-listar.component';

const routes: Routes = [
  {
    path: '',
    component: GrupoAcessoListarComponent,
    data: { headerDisplay: 'none' },
  },
  {
    path: 'cadastrar',
    component: GrupoAcessoFormComponent,
    data: { title: 'Cadastrar', headerDisplay: 'none' },
  },
  {
    path: 'editar/:id',
    component: GrupoAcessoFormComponent,
    data: { title: 'Editar', headerDisplay: 'none' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GrupoAcessoRoutingModule {}
