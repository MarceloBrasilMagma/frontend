import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../authentication/auth-guard.service';
import { PortifolioCadastrarEditarComponent } from './portifolio-cadastrar-editar/portifolio-cadastrar-editar.component';
import { PortifolioListarComponent } from './portifolio-listar/portifolio-listar.component';
import { PortifolioVisualizarComponent } from './portifolio-visualizar/portifolio-visualizar.component';

const routes: Routes = [
  {
    path: '',
    component: PortifolioListarComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'cadastrar',
    component: PortifolioCadastrarEditarComponent,
    data: { title: 'Cadastrar', headerDisplay: 'none' } 
  },
  {
    path: 'editar/:id',
    component: PortifolioCadastrarEditarComponent,
    data: { title: 'Editar', headerDisplay: 'none' } 
  },
  {
    path: 'visualizar/:id',
    component: PortifolioVisualizarComponent,
    data: { title: 'Visualizar', headerDisplay: 'none' } 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortifolioRoutingModule { }