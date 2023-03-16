import { Component } from '@angular/core';
import { ThemeConstantService } from '../../services/theme-constant.service';
import { AuthGuard } from 'src/app/authentication/auth-guard.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { IconService } from '@ant-design/icons-angular';
import { MenuFoldOutline, MenuUnfoldOutline } from '@ant-design/icons-angular/icons'
import { NotificacaoVm, NotificacoesClient, TipoNotificacao } from 'web-api-client';
import { SignalRService } from '../../services/signalr.service'
import { EventService } from '../../services/event.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {
  searchVisible: boolean = false;
  quickViewVisible: boolean = false;
  isFolded: boolean;
  isExpand: boolean;
  nomeUsuario = '';
  perfil = '';
  mensagemCabecalho = '';
  usuarioId: 0;
  isLoggedIn$: Observable<boolean>;
  alterandoStatus: boolean;
  avatarUrl: string;

  notificacaoPageIndex = 1;
  notificacaoPageSize = 10;
  notificacaoHasNextPage = false;
  NotificacoesNaoLidas = 0;

  notificationList = []

  constructor(private themeService: ThemeConstantService,
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
    if (environment.mensagemCabecalho)
      this.mensagemCabecalho = environment.mensagemCabecalho;

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

    this.themeService.isMenuFoldedChanges.subscribe(isFolded => this.isFolded = isFolded);
    this.themeService.isExpandChanges.subscribe(isExpand => this.isExpand = isExpand);

    this.carregarNotificacoes(this.notificacaoPageIndex, this.notificacaoPageSize)

    this.eventService.ExisteNovaNotificacao.subscribe(
      () => {
        this.notificationList = [];
        this.carregarNotificacoes(1, 10);
      }
    )
  }

  toggleFold() {
    this.isFolded = !this.isFolded;
    this.themeService.toggleFold(this.isFolded);
  }

  toggleExpand() {
    this.isFolded = false;
    this.isExpand = !this.isExpand;
    this.themeService.toggleExpand(this.isExpand);
    this.themeService.toggleFold(this.isFolded);
  }

  searchToggle(): void {
    this.searchVisible = !this.searchVisible;
  }

  quickViewToggle(): void {
    this.quickViewVisible = !this.quickViewVisible;
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
