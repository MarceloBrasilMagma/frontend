import { Routes } from '@angular/router';

export const CommonLayout_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('../../dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'pre-projetos',
    loadChildren: () =>
      import('../../preprojeto/preprojeto.module').then(
        (m) => m.PreProjetoModule
      ),
    data: { title: 'Cadastrar projeto', headerDisplay: 'none' },
  },
  {
    path: 'declaracoes-trabalho',
    loadChildren: () =>
      import('../../declaracoes-trabalho/declaracoes-trabalho.module').then(
        (m) => m.DeclaracoesTrabalhoModule
      ),
    data: { title: 'Declarações de trabalho', headerDisplay: 'none' },
  },
  {
    path: 'portifolios',
    loadChildren: () =>
      import('../../portifolio/portifolio.module').then(
        (m) => m.PortifolioModule
      ),
    data: { title: 'Portfólios', headerDisplay: 'none' },
  },
  {
    path: 'projetos',
    loadChildren: () =>
      import('../../projeto/projeto.module').then((m) => m.ProjetoModule),
    data: { title: 'Projetos', headerDisplay: 'none' },
  },
  {
    path: 'projetos-plurianuais',
    loadChildren: () =>
      import('../../projeto-plurianual/projeto-plurianual.module').then(
        (m) => m.ProjetoPlurianualModule
      ),
    data: { title: 'Projetos plurianuais', headerDisplay: 'none' },
  },
  {
    path: 'mapa-estrategico',
    loadChildren: () =>
      import('../../projeto/projeto.module').then((m) => m.ProjetoModule),
    data: { title: 'Projetos', headerDisplay: 'none' },
  },
  {
    path: 'cestas',
    loadChildren: () =>
      import('../../cesta/cesta.module').then((m) => m.CestaModule),
    data: { title: 'Cestas estratégicas', headerDisplay: 'none' },
  },
  {
    path: 'questionarios-modelo',
    loadChildren: () =>
      import('../../questionarios-modelo/questionarios-modelo.module').then(
        (m) => m.QuestionariosModeloModule
      ),
    data: { title: 'Questionários Modelo', headerDisplay: 'none' },
  },
  {
    path: 'configuracoes',
    loadChildren: () =>
      import('../../configuracoes/configuracoes.module').then(
        (m) => m.ConfiguracoesModule
      ),
    data: { title: 'Configurações', headerDisplay: 'none' },
  },
  {
    path: 'relatorios',
    loadChildren: () =>
      import('../../relatorios/relatorios.module').then(
        (m) => m.RelatoriosModule
      ),
    data: { title: 'Relatórios', headerDisplay: 'none' },
  },
  {
    path: 'departamentos',
    loadChildren: () =>
      import('../../departamento/departamento.module').then(
        (m) => m.DepartamentoModule
      ),
    data: { title: 'Departamentos', headerDisplay: 'none' },
  },
  {
    path: 'arquivados',
    loadChildren: () =>
      import('../../projetos-arquivados/projetos-arquivados.module').then(
        (m) => m.ProjetosArquivadosModule
      ),
    data: { title: 'Arquivados', headerDisplay: 'none' },
  },
];
