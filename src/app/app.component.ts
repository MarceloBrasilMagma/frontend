import { Component, HostListener, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissoesAcessoClient } from 'web-api-client';
import { AuthenticationService } from './shared/services/authentication.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

    constructor(private authenticationService: AuthenticationService,
        private permissionsService: NgxPermissionsService,
        private permissoesAcessoClient: PermissoesAcessoClient) {
    }

    // @HostListener('window:beforeunload', ['$event'])
    // unloadHandler(event: Event) {
    //     debugger
    //     console.log('aff');
    //     if (this.authenticationService.obterUsuarioLogado && this.authenticationService.usuarioLogadoIsProfissional)
    //         this.profissionaisClient.alterarSituacaoAtendimento(false).subscribe(r => {
    //             debugger
    //         }, err => {
    //             debugger
    //             console.log(err);
    //         });
    // }

    async ngOnInit() {

        // if (this.authenticationService.obterUsuarioLogado) {
        //     this.permissoesAcessoClient.obterPermissoesUsuarioLogado().subscribe((permissoes) => {
        //         console.log('obteve appcomponent');
        //         this.permissionsService.loadPermissions(permissoes);
        //     });
        // }
    }
}

