import { SideNavInterface } from '../../interfaces/side-nav.type';
export const ROUTES: SideNavInterface[] = [
  {
    path: 'pre-projetos',
    title: 'Cadastrar projeto',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'bulb',
    submenu: [],
  },
  {
    path: 'portifolios',
    title: 'Portfólios',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'folder-open',
    permission: 'Administrador',
    submenu: [],
  },
  {
    path: 'projetos',
    title: 'Projetos',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'build',
    submenu: [],
  },
  {
    path: 'declaracoes-trabalho',
    title: 'Declarações de trabalho',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'file-text',
    submenu: [],
  },
  {
    path: 'licoes-aprendidas',
    title: 'Lições aprendidas',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'download',
    downloadMenu: true,
    submenu: [],
  },
  {
    path: 'correlacao-mapa-projetos',
    title: 'Correlação mapa X projetos',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'download',
    downloadMenu: true,
    submenu: [],
  },
  {
    path: '',
    title: 'Área PMO',
    iconType: '',
    iconTheme: '',
    icon: '',
    permission: 'Administrador',
    submenu: [],
  },
  {
    path: 'relatorios',
    title: 'Relatórios',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'bars',
    permission: 'Administrador',
    submenu: [
      {
        path: 'relatorios/abrangencia',
        title: 'Abrangência',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'global',
        submenu: [],
      },
      {
        path: 'relatorios/cronograma',
        title: 'Cronograma',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'calendar',
        submenu: [],
      },
      {
        path: 'relatorios/declaracoes-trabalho-relatorio',
        title: 'Declaração de trabalho',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'file-text',
        submenu: [],
      },
      {
        path: 'relatorios/orcamento',
        title: 'Orçamento',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'dollar-circle',
        submenu: [],
      },
      {
        path: 'relatorios/plano-acao',
        title: 'Plano de ação',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'flag',
        submenu: [],
      },
    ],
  },
  {
    path: 'cestas',
    title: 'Cestas estratégicas',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'shopping',
    permission: 'Administrador',
    submenu: [],
  },
  {
    path: 'questionarios-modelo',
    title: 'Questionários modelo',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'form',
    permission: 'Administrador',
    submenu: [],
  },
  {
    path: 'arquivados',
    title: 'Arquivados',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'inbox',
    permission: 'Administrador',
    submenu: [],
  },
  {
    path: 'configuracoes',
    title: 'Configurações',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'setting',
    permission: 'Administrador',
    submenu: [
      {
        path: 'configuracoes/usuarios',
        title: 'Usuários',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'user',
        submenu: [],
        permission: 'Administrador',
      },
      {
        path: 'configuracoes/grupos-acesso',
        title: 'Grupos de acesso',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'team',
        submenu: [],
        permission: 'Administrador',
      },
      {
        path: 'configuracoes/equipes-projetos',
        title: 'Funções',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'solution',
        submenu: [],
        permission: 'Administrador',
      },
      {
        path: 'configuracoes/departamentos',
        title: 'Departamentos',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'home',
        submenu: [],
        permission: 'Administrador',
      },
      {
        path: 'configuracoes/periodicidades-projetos',
        title: 'Periodicidade',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'schedule',
        submenu: [],
        permission: 'Administrador',
      },
      {
        path: 'configuracoes/objetivos-estrategicos',
        title: 'Objetivos estratégicos',
        iconType: 'nzIcon',
        iconTheme: 'outline',
        icon: 'flag',
        submenu: [],
        permission: 'Administrador',
      },
    ],
  },
];
