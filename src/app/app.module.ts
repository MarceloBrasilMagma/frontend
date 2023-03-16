import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N, pt_BR } from 'ng-zorro-antd/i18n';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

import {
  registerLocaleData,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import pt from '@angular/common/locales/pt';

import { AppRoutingModule } from './app-routing.module';
import { TemplateModule } from './shared/template/template.module';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { CommonLayoutComponent } from './layouts/common-layout/common-layout.component';
import { FullLayoutComponent } from './layouts/full-layout/full-layout.component';

import { EventService } from './shared/services/event.service';

import { NgChartjsModule } from 'ng-chartjs';
import { ThemeConstantService } from './shared/services/theme-constant.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IconModule } from '@ant-design/icons-angular';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { environment } from '../environments/environment';
import { API_BASE_URL, PermissoesAcessoClient } from 'web-api-client';
import { AuthGuard } from './authentication/auth-guard.service';
import { JwtModule } from '@auth0/angular-jwt';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './shared/interceptor/http-error.interceptor';
import { NgxMaskModule } from 'ngx-mask';
import { LOCALE_ID } from '@angular/core';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { AuthenticationService } from './shared/services/authentication.service';
import { YearReferenceService } from './shared/services/year-reference.service';
import { ProjetosArquivadosModule } from './projetos-arquivados/projetos-arquivados.module';
import moment from 'moment';

registerLocaleData(pt);
moment.locale('pt-br');
export function tokenGetter() {
  return localStorage.getItem('jwt');
}

const antModule = [
  NzBreadCrumbModule,
  NzCardModule,
  NzInputModule,
  NzTableModule,
  NzSelectModule,
  NzBadgeModule,
  NzAvatarModule,
  NzButtonModule,
  NzIconModule,
  NzNotificationModule,
  NzSpinModule,
  NzSwitchModule,
  NzModalModule,
];

@NgModule({
  declarations: [AppComponent, CommonLayoutComponent, FullLayoutComponent],
  imports: [
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: [
          'localhost:5001',
          '10.1.1.121:8890',
          'pmosoft-api.unimedvitoria.com.br',
        ],
        blacklistedRoutes: [],
      },
    }),
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    TemplateModule,
    SharedModule,
    NgChartjsModule,
    IconModule,
    NgxMaskModule.forRoot(),
    NgxPermissionsModule.forRoot(),
    ProjetosArquivadosModule,
    ...antModule,
  ],
  providers: [
    {
      provide: API_BASE_URL,
      useValue: environment.apiBaseUrl,
    },
    {
      provide: NZ_I18N,
      useValue: pt_BR,
    },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (
        authenticationService: AuthenticationService,
        permissaoAcessoClient: PermissoesAcessoClient,
        ps: NgxPermissionsService
      ) =>
        function () {
          if (authenticationService.obterUsuarioLogado) {
            permissaoAcessoClient
              .obterPermissoesUsuarioLogado()
              .subscribe((permissoes) => {
                ps.loadPermissions(permissoes);
              });
          }
        },
      deps: [
        AuthenticationService,
        PermissoesAcessoClient,
        NgxPermissionsService,
      ],
      multi: true,
    },
    ThemeConstantService,
    AuthGuard,
    EventService,
    YearReferenceService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
