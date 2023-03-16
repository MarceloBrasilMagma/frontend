import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjetosClient, ProjetoVm } from 'web-api-client';

@Component({
  selector: 'app-dados-projeto-impressao',
  templateUrl: './dados-projeto-impressao.component.html',
  styleUrls: ['./dados-projeto-impressao.component.scss']
})
export class DadosProjetoImpressaoComponent implements OnInit {
  projeto: ProjetoVm

  constructor(private route: ActivatedRoute, private projetosClient: ProjetosClient) { }

  ngOnInit(): void {
    this.obterProjetoQuestionario()
  }

  obterProjetoQuestionario() {
    let projetoId = +this.route.snapshot.paramMap.get('id')

    this.projetosClient.obterPorId(projetoId, new Date().getFullYear()).subscribe({
      next: (projeto) => {
        this.projeto = projeto;
      }
    })
  }

}
