import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { FullLayoutComponent } from "./layouts/full-layout/full-layout.component";
import { CommonLayoutComponent } from "./layouts/common-layout/common-layout.component";

import { FullLayout_ROUTES } from "./shared/routes/full-layout.routes";
import { CommonLayout_ROUTES } from "./shared/routes/common-layout.routes";
import { AuthGuard } from './authentication/auth-guard.service';
import { QuestionarioModeloFormComponent } from './questionarios-modelo/questionario-modelo-form/questionario-modelo-form.component';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/pagina-inicial',
        //redirectTo: '/pre-projetos',
        pathMatch: 'full',
        //canActivate: [AuthGuard]
    },
    {
        path: '',
        component: CommonLayoutComponent,
        children: CommonLayout_ROUTES
    },
    {
        path: '',
        component: FullLayoutComponent,
        children: FullLayout_ROUTES
    },
    //{ path: 'pagina-inicial', loadChildren: () => import('./default/default.module').then(m => m.DefaultModule) },
    {
        path: 'pre-projetos',
        loadChildren: () =>
            import('./preprojeto/preprojeto.module').then((m) => m.PreProjetoModule),
    },
];
@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, {
            preloadingStrategy: PreloadAllModules,
            anchorScrolling: 'enabled',
            scrollPositionRestoration: 'enabled',
            useHash: false
        })
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule {
}