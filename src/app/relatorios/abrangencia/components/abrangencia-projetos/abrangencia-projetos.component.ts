import { Component, Input, OnInit } from '@angular/core';
import { PortifolioVm, TipoPreProjeto } from 'web-api-client';

@Component({
  selector: 'app-abrangencia-projetos',
  templateUrl: './abrangencia-projetos.component.html',
  styleUrls: ['./abrangencia-projetos.component.scss']
})
export class AbrangenciaProjetosComponent implements OnInit {
  @Input() portifolio: PortifolioVm;
  

  constructor() { }

  ngOnInit(): void {
  }

  verificarCorTipoProjeto(tipoProjeto: TipoPreProjeto) {
    switch (tipoProjeto) {
      case TipoPreProjeto.Estrategico:
        return 'bg-[#BACF36]'
      case TipoPreProjeto.Tatico:
        return 'bg-[#7744A1]'
      case TipoPreProjeto.Operacional:
        return 'bg-[#999797]'
    }
  }

}
