import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IconService } from '@ant-design/icons-angular';
import { MenuFoldOutline, MenuUnfoldOutline } from '@ant-design/icons-angular/icons';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { AuthGuard } from 'src/app/authentication/auth-guard.service';
import { EventService } from 'src/app/shared/services/event.service';
import { SignalRService } from 'src/app/shared/services/signalr.service';
import { ThemeConstantService } from 'src/app/shared/services/theme-constant.service';
import { environment } from 'src/environments/environment';
import { NotificacoesClient, NotificacaoVm, TipoNotificacao } from 'web-api-client';

@Component({
  selector: 'app-header-pagina-inicial',
  templateUrl: './header-pagina-inicial.component.html',
  styleUrls: ['./header-pagina-inicial.component.scss']
})
export class HeaderPaginaInicialComponent implements OnInit {

    nomeUsuario = '';
    perfil = '';
    usuarioId: 0;
    isLoggedIn$: Observable<boolean>;
    alterandoStatus: boolean;
    avatarUrl: string;
  
    notificacaoPageIndex = 1;
    notificacaoPageSize = 10;
    notificacaoHasNextPage = false;
    NotificacoesNaoLidas = 0;
  
    notificationList = []
  
    constructor(
      private authGuard: AuthGuard,
      private jwtHelper: JwtHelperService,
      private router: Router,
      private _iconService: IconService,
      private notificacoesClient: NotificacoesClient,
      public signalRService: SignalRService,
      private eventService: EventService
    ) {
      this._iconService.addIcon(...[MenuFoldOutline, MenuUnfoldOutline]);
    }
  
    ngOnInit(): void {
  
      const token: string = localStorage.getItem("jwt");
  
      let tokenDecodificado;
  
      try {
        tokenDecodificado = this.jwtHelper.decodeToken(token);
      } catch (error) {
        console.log('Erro ao decodificar o token: ' + error);
        this.logOut();
      }
  
      if (tokenDecodificado) {
        this.nomeUsuario = tokenDecodificado.nome ?? tokenDecodificado.Nome ?? tokenDecodificado.login;
        this.usuarioId = tokenDecodificado.usuarioId;
        this.perfil = tokenDecodificado.perfilNome;
        this.signalRService.connect();
      }
  
      this.isLoggedIn$ = this.authGuard.isLoggedIn;
  
      this.carregarNotificacoes(this.notificacaoPageIndex, this.notificacaoPageSize)
  
      this.eventService.ExisteNovaNotificacao.subscribe(
        () => {
          this.notificationList = [];
          this.carregarNotificacoes(1, 10);
        }
      )
    }
  
    logOut() {
      localStorage.removeItem("jwt");
      localStorage.removeItem("refreshToken");
      this.authGuard.setLoggedIn(false);
      this.router.navigate(['authentication/login']);
    }
  
    carregarNotificacoes(pageIndex: number, pageSize: number) {
  
      this.notificacaoPageIndex = pageIndex;
      this.notificacaoPageSize = pageSize;
  
      this.notificacoesClient.obter(pageIndex, pageSize)
        .subscribe(
          (r) => {
            this.notificacaoHasNextPage = r.notificacoes.hasNextPage;
            this.NotificacoesNaoLidas = r.quantidadeNotificacoesNaoLidas;
            r.notificacoes.items.forEach(
              (value, index, array) => {
                this.notificationList.push(this.obterObjetoNotificacao(value));
              })
          }
        )
    }
  
    obterObjetoNotificacao(notificacao: NotificacaoVm) {
  
      let color;
  
      switch (notificacao.tipoNotificacao) {
        case TipoNotificacao.Aviso: color = "gold"; break;
        case TipoNotificacao.Erro: color = "red"; break;
        case TipoNotificacao.Informacao: color = "blue"; break;
        case TipoNotificacao.Sucesso: color = "cyan"; break;
      }
  
      return {
        title: notificacao.mensagem,
        time: notificacao.strDataEnvio,
        icon: notificacao.icone,
        color: 'ant-avatar-' + color,
        link: notificacao.link,
        id: notificacao.id,
        lida: notificacao.dataLeitura != null
      }
    }
  
    irParaLink(notificacao: any) {
      this.notificacoesClient.marcarComoLida(notificacao.id).subscribe(r => {
        window.location.href = notificacao.link;
      })
    }
  
    excluirNotificacao(notificacao: any) {
      this.notificacoesClient.excluirPorId(notificacao.id)
        .subscribe(r => {
          this.notificationList = this.notificationList.filter((f) => f.id != notificacao.id);
          this.NotificacoesNaoLidas--;
          if (this.notificationList.length <= 0) this.carregarNotificacoes(0, 10);
        })
    }
    excluirTodasNotificacoes() {
      this.notificacoesClient.excluirTodas()
        .subscribe(r => {
          this.NotificacoesNaoLidas = 0;
          this.notificationList = []
        })
    }

}
