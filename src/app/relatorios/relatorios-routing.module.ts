import { RelatoriosListarComponent } from './relatorios-listar/relatorios-listar.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../authentication/auth-guard.service';

import { CronogramaComponent } from './cronograma/cronograma.component';
import { PlanoDeAcaoComponent } from './plano-acao/plano-acao.component';
import { OrcamentoComponent } from './orcamento/orcamento.component';
import { AbrangenciaComponent } from './abrangencia/abrangencia.component';
import { DeclaracoesTrabalhoRelatorioComponent } from './declaracoes-trabalho-relatorio/declaracoes-trabalho-relatorio.component';

const routes: Routes = [
  {
    path: '',
    component: RelatoriosListarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'abrangencia',
    component: AbrangenciaComponent,
    data: { title: 'Abrangência', headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
  {
    path: 'cronograma',
    component: CronogramaComponent,
    data: { title: 'Cronograma', headerDisplay: 'none' },
    canActivate: [AuthGuard],
  },
  {
    path: 'declaracoes-trabalho-relatorio',
    component: DeclaracoesTrabalhoRelatorioComponent,
    data: { title: 'Declarações de Trabalho', headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
  {
    path: 'orcamento',
    component: OrcamentoComponent,
    data: { title: 'Orçamento', headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
  {
    path: 'plano-acao',
    component: PlanoDeAcaoComponent,
    data: { title: 'Plano de Ação', headerDisplay: 'none' },
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RelatoriosRoutingModule { }
