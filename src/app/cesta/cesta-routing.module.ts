import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../authentication/auth-guard.service';
import { CestaEditarComponent } from './cesta-editar/cesta-editar.component';
import { CestaListarComponent } from './cesta-listar/cesta-listar.component';

const routes: Routes = [
  {
    path: '',
    component: CestaListarComponent,
    data: { headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
  {
    path: 'cadastrar',
    component: CestaEditarComponent,
    data: { title:'Cadastrar', headerDisplay: 'none' } 
  },
  {
    path: 'editar/:id',
    component: CestaEditarComponent,
    data: { title:'Editar', headerDisplay: 'none' } 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CestaRoutingModule { }