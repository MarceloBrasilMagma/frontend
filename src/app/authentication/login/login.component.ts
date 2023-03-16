import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthClient, LoginModel, PermissoesAcessoClient } from '../../../../web-api-client';
import { AuthGuard } from '../auth-guard.service';


@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit, AfterViewInit {
    @ViewChild("login") loginField: ElementRef;
    loginForm: UntypedFormGroup;
    autenticando: boolean = false;
    returnUrl: string;

    submitForm(): void {
        for (const i in this.loginForm.controls) {
            this.loginForm.controls[i].markAsDirty();
            this.loginForm.controls[i].updateValueAndValidity();
        }


        if (this.loginForm.valid) {
            this.autenticando = true;

            this.authClient.login(new LoginModel({ login: this.loginForm.controls['userName'].value, senha: this.loginForm.controls['password'].value }))
                .subscribe(
                    async response => {
                        const token = response.accessToken;
                        localStorage.setItem("jwt", token);
                        const refreshToken = response.refreshToken;
                        localStorage.setItem("refreshToken", refreshToken);
                        localStorage.setItem("prazoMaximoAssumirAtendimento", response.prazoMaximoAssumirAtendimento ? response.prazoMaximoAssumirAtendimento.toString() : "30");
                        this.authGuard.setLoggedIn(true);

                        this.permissoesAcessoClient.obterPermissoesUsuarioLogado().subscribe((permissoes) => {
                            this.permissionsService.loadPermissions(permissoes);

                            setTimeout(() => {
                                this.autenticando = false;
                                this.router.navigateByUrl(this.returnUrl);
                                //this.router.navigate(['/']);
                            }, 1000);
                        });
                    }, err => {
                        this.authGuard.setLoggedIn(false);
                        if (err.status === 401 || err.status === 403) {
                            this.notification.error('Erro', 'Usuário não encontrado ou senha inválida');
                        } else {
                            this.notification.error('Erro', 'Ocorreu um erro ao acessar o sistema. Entre em contato com o suporte');
                        }
                        this.autenticando = false;
                    });
        }
    }

    constructor(private fb: UntypedFormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private authGuard: AuthGuard,
        private authClient: AuthClient,
        private notification: NzNotificationService,
        private jwtHelper: JwtHelperService,
        private permissionsService: NgxPermissionsService,
        private permissoesAcessoClient: PermissoesAcessoClient
    ) {
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.loginField.nativeElement.focus();
        }, 250);
    }

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            userName: [null, [Validators.required]],
            password: [null, [Validators.required]]
        });

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }
}
