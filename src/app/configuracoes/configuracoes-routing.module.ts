import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../authentication/auth-guard.service';
import { ConfiguracoesListarComponent } from './configuracoes-listar/configuracoes-listar.component';
import { EquipesProjetosListarComponent } from './equipes-projetos/equipes-projetos-listar/equipes-projetos-listar.component';
import { IndicadoresListarComponent } from './indicadores-projeto/indicadores-listar/indicadores-listar.component';
import { ObjetivosEstrategicosListarComponent } from './objetivos-estrategicos/objetivos-estrategicos-listar/objetivos-estrategicos-listar.component';
import { PeriodicidadesListarComponent } from './periodicidades/periodicidades-listar/periodicidades-listar.component';

const routes: Routes = [
  {
    path: '',
    component: ConfiguracoesListarComponent,
    data: { headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
  {
    path: 'usuarios',
    loadChildren: () =>
      import('../usuarios/usuario.module').then((m) => m.UsuarioModule),
      data: { title: 'Usuários', headerDisplay: 'none' },
  },
  {
    path: 'grupos-acesso',
    loadChildren: () =>
      import('../grupo-acesso/grupo-acesso.module').then((m) => m.GrupoAcessoModule),
      data: { title: 'Grupos de acesso', headerDisplay: 'none' },
  },
  {
    path: 'departamentos',
    loadChildren: () =>
      import('../departamento/departamento.module').then((m) => m.DepartamentoModule),
      data: { title: 'Departamentos', headerDisplay: 'none' },
  },
  {
    path: 'indicadores-projeto',
    component: IndicadoresListarComponent,
    data: { headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
  {
    path: 'equipes-projetos',
    component: EquipesProjetosListarComponent,
    data: { title:'Funções', headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
  {
    path: 'objetivos-estrategicos',
    component: ObjetivosEstrategicosListarComponent,
    data: { title: 'Objetivos estratégicos', headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
  {
    path: 'periodicidades-projetos',
    component: PeriodicidadesListarComponent,
    data: { title:'Periodicidade', headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracoesRoutingModule { }
