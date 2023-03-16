import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../authentication/auth-guard.service';
import { MapaEstrategicoComponent } from './mapa-estrategico/mapa-estrategico.component';

const routes: Routes = [
  {
    path: '',
    component: MapaEstrategicoComponent,
    data: { title: 'Mapa Estratégico', headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapaEstrategicoRoutingModule { }
