import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../authentication/auth-guard.service';
import { ProjetosArquivadosListarComponent } from './projetos-arquivados-listar/projetos-arquivados-listar.component';

const routes: Routes = [
  {
    path: '',
    component: ProjetosArquivadosListarComponent,
    data: {headerDisplay: 'none'},
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjetosArquivadosRoutingModule { }
