import { Routes, RouterModule } from '@angular/router';
import { PaginaImpressaoComponent } from 'src/app/projeto/components/pagina-impressao/pagina-impressao.component';

export const FullLayout_ROUTES: Routes = [
  {
    path: 'authentication',
    loadChildren: () => import('../../authentication/authentication.module').then(m => m.AuthenticationModule)
  },
  {
    path: 'pagina-inicial',
    loadChildren: () =>
      import('../../pagina-inicial/pagina-inicial.module').then((m) => m.PaginaInicialModule),
  },
  {
    path: 'projetos/pagina-impressao/:id',
    component: PaginaImpressaoComponent,
    data: { headerDisplay: 'none' } 
  }
];
