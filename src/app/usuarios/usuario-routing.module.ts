import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsuarioFormComponent } from './usuario-form/usuario-form.component';
import { UsuarioListarComponent } from './usuario-listar/usuario-listar.component';

const routes: Routes = [
  {
    path: '',
    component: UsuarioListarComponent,
    data: { headerDisplay: 'none' },
  },
  {
    path: 'cadastrar',
    component: UsuarioFormComponent,
    data: { title: 'Cadastrar', headerDisplay: 'none' },
  },
  {
    path: 'editar/:id',
    component: UsuarioFormComponent,
    data: { title: 'Editar', headerDisplay: 'none' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuarioRoutingModule {}
