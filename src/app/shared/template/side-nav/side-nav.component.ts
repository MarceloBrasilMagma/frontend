import { Component, Inject } from '@angular/core';
import { ROUTES } from './side-nav-routes.config';
import { ThemeConstantService } from '../../services/theme-constant.service';
import { SideNavInterface } from '../../interfaces/side-nav.type';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthenticationService } from '../../services/authentication.service';
import { API_BASE_URL, PermissoesAcessoClient } from 'web-api-client';

@Component({
  selector: 'app-sidenav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})

export class SideNavComponent {

  public menuItems: SideNavInterface[]
  isFolded: boolean;
  isSideNavDark: boolean;
  isExpand: boolean;
  urlArquivoLicoesAprendidas: string;
  urlArquivoCorrelacaoMapaProjetos: string;

  constructor(
    private themeService: ThemeConstantService,
    private authenticationService: AuthenticationService,
    private permissoesAcessoClient: PermissoesAcessoClient,
    private permissionsService: NgxPermissionsService,
    @Inject(API_BASE_URL) baseUrl? : string
  ) { 
    this.urlArquivoLicoesAprendidas = `${baseUrl}/modelos/Anexo-II.pdf`
    this.urlArquivoCorrelacaoMapaProjetos = `${baseUrl}/modelos/correlacao-objetivos-indicadores-projetos.pdf`
  }

  ngOnInit(): void {
    try {

      if (this.authenticationService.obterUsuarioLogado) {
        this.permissoesAcessoClient.obterPermissoesUsuarioLogado().subscribe((permissoes) => {
          this.permissionsService.loadPermissions(permissoes);
          this.menuItems = ROUTES.filter(menuItem => this.permitirExibicaoItemMenu(menuItem));
        });
      }

    } catch (error) {
      console.log('Erro ao decodificar o token: ' + error);
    }

    this.themeService.isMenuFoldedChanges.subscribe(isFolded => this.isFolded = isFolded);
    this.themeService.isExpandChanges.subscribe(isExpand => this.isExpand = isExpand);
    this.themeService.isSideNavDarkChanges.subscribe(isDark => this.isSideNavDark = isDark);
  }

  closeMobileMenu(): void {
    if (window.innerWidth < 992) {
      this.isFolded = false;
      this.isExpand = !this.isExpand;
      this.themeService.toggleExpand(this.isExpand);
      this.themeService.toggleFold(this.isFolded);
    }
  }

  permitirExibicaoItemMenu(item: SideNavInterface): boolean {
    if (!item.permission)
      return true;

    var permissions = this.permissionsService.getPermissions();

    return 'Administrador' in permissions
      || item.permission in permissions;

  }

  obterUrlDownloadArquivo(path: string) {
    if(path == 'licoes-aprendidas') {
      return this.urlArquivoLicoesAprendidas
    } else if(path == 'correlacao-mapa-projetos') {
      return this.urlArquivoCorrelacaoMapaProjetos
    }
  }

}
