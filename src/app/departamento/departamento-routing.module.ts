import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../authentication/auth-guard.service';
import { DepartamentoEditarComponent } from './departamento-editar/departamento-editar.component';
import { DepartamentoListarComponent } from './departamento-listar/departamento-listar.component';

const routes: Routes = [
  {
    path: '',
    component: DepartamentoListarComponent,
    data: { headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
  {
    path: 'cadastrar',
    component: DepartamentoEditarComponent,
    data: { title: 'Cadastrar', headerDisplay: 'none' },
  },
  {
    path: 'editar/:id',
    component: DepartamentoEditarComponent,
    data: { title: 'Editar', headerDisplay: 'none' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartamentoRoutingModule { }
