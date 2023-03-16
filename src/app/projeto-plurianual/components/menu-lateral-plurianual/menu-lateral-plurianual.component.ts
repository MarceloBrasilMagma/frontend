import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnosPlurianualidade, ProjetoVm } from 'web-api-client';

@Component({
  selector: 'app-menu-lateral-plurianual',
  templateUrl: './menu-lateral-plurianual.component.html',
  styleUrls: ['./menu-lateral-plurianual.component.scss']
})
export class MenuLateralPlurianualComponent implements OnInit {

  @Input() projeto: ProjetoVm;
  @Input() abaSelecionada?: Abas;

  abas = Abas;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {

  }

  selecionarPlurianual(plurianualidade: AnosPlurianualidade) {
    if (this.projeto.plurianualPendenteId == plurianualidade.plurianualId && plurianualidade.plurianualId) {
      this.router.navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this.router.navigate(["/projetos-plurianuais/editar/", plurianualidade.plurianualId], { queryParams: { ano: plurianualidade.ano }});
              });
    } else {
      this.router.navigate(["/projetos/editar/", this.projeto.id], { queryParams: { ano: plurianualidade.ano }});
    }
  }

  redirecionar(plurianualidade: AnosPlurianualidade) {
    if (plurianualidade.plurianualId) {
      this.router.navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this.router.navigate(["/projetos-plurianuais/editar/", plurianualidade.plurianualId], { queryParams: { ano: plurianualidade.ano }});
              });
      
    } else if (plurianualidade.preProjetoId) {
      this.router.navigate(["pre-projetos/editar/", plurianualidade.preProjetoId]);
    }
  }
}

export enum Abas {
  menu,
  timeline,
  plurianual
}



