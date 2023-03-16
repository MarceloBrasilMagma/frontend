import { Component, Input, OnInit } from '@angular/core';
import { ObjetivoEstrategicoVm } from 'web-api-client';

@Component({
  selector: 'app-mapa-estrategico-card',
  templateUrl: './mapa-estrategico-card.component.html',
  styleUrls: ['./mapa-estrategico-card.component.scss']
})
export class MapaEstrategicoCardComponent implements OnInit {
  @Input() objetivo: ObjetivoEstrategicoVm;

  constructor() { }

  ngOnInit(): void {
    let id_div = `ob-card-${this.objetivo.id}`;
    let id_p = `ob-text-${this.objetivo.id}`;
    setTimeout(x => {
      let div = document.getElementById(id_div);
      div.style.backgroundColor = this.objetivo.corFundo

      let p = document.getElementById(id_p);
      p.style.color = this.objetivo.corTexto

    }, 100)

    //


  }

  editar(){

  }

}
