import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../authentication/auth-guard.service';
import { DefaultComponent } from './default.component';
import { DefaultGuard } from './default-guard.service';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    data: {
      headerDisplay: 'none',
    },
    canActivate: [AuthGuard, DefaultGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DefaultGuard]
})
export class DefaultRoutingModule {}
