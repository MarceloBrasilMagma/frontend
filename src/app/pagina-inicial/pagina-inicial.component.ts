import { Component, Inject, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgxPermissionsService } from 'ngx-permissions';
import { API_BASE_URL } from 'web-api-client';
import { AuthenticationService } from '../shared/services/authentication.service';

@Component({
  templateUrl: './pagina-inicial.component.html',
  styleUrls: ['./pagina-inicial.component.scss'],
})
export class PaginaInicialComponent implements OnInit {

  modalVisivel: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private permissionsService: NgxPermissionsService,
    private nzModalService: NzModalService,
  ) {}

  ngOnInit(): void {}

  possuiPermissaoEditar(permissoes: string[]): boolean {
    var login = this.authenticationService.loginUsuarioLogado;

    if (login == null) return false;

    var possuiPermissao = false;

    if (permissoes == null) possuiPermissao;

    var permissions = this.permissionsService.getPermissions();

    permissoes.forEach((element) => {
      if (element in permissions || 'Administrador' in permissions) {
        possuiPermissao = true;
        return;
      }
    });

    return possuiPermissao;
  }

  exibirModal(): void {
    this.modalVisivel = !this.modalVisivel;
  }

}
