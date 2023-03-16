import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class DefaultGuard implements CanActivate {
  constructor(private router: Router, private jwtHelper: JwtHelperService) { }

  canActivate(): boolean {
    const token = localStorage.getItem('jwt');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      let usuarioLogado = this.jwtHelper.decodeToken(token);
      //this.redirecionarPaginaInicialBaseadoPerfil(usuarioLogado);
    }
    return true;
  }
}
