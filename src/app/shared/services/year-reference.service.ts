import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router'

@Injectable({
  providedIn: 'root'
})
export class YearReferenceService {

  constructor(private route: ActivatedRoute) { }
  obterAno(): number {
    let ano = this.route.snapshot.queryParams['ano'];
    let objetoLocalStorage = localStorage.getItem("ano_plurianualidade");

    if (ano) {
      return +ano;
    } else if (objetoLocalStorage) {
      return +objetoLocalStorage;
    } else {
      return new Date().getFullYear();
    }
  }
}
