import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {
  ObjetivoEstrategicoAlterarCommand,
  ObjetivoEstrategicoClassificacao,
  ObjetivoEstrategicoCriarCommand,
  ObjetivoEstrategicoPerspectiva,
  ObjetivoEstrategicoVm,
  ObjetivosEstrategicosClient,
} from 'web-api-client';

@Component({
  selector: 'app-mapa-estrategico',
  templateUrl: './mapa-estrategico.component.html',
  styleUrls: ['./mapa-estrategico.component.scss'],
})
export class MapaEstrategicoComponent implements OnInit {
  objetivos: ObjetivoEstrategicoVm[] = [];

  objetivoPrincipal: ObjetivoEstrategicoVm;

  objetivosFinanceirosCrescimento: ObjetivoEstrategicoVm[];
  objetivosFinanceirosSustentabilidade: ObjetivoEstrategicoVm[];
  objetivosMercadoCrescimento: ObjetivoEstrategicoVm[];
  objetivosMercadoSustentabilidade: ObjetivoEstrategicoVm[];
  objetivosProcessosCrescimento: ObjetivoEstrategicoVm[];
  objetivosProcessosSustentabilidade: ObjetivoEstrategicoVm[];

  objetivosAprendizado: ObjetivoEstrategicoVm[];

  form: FormGroup;

  perspectivas = [
    { key: "Aprendizado E Crescimento", value: ObjetivoEstrategicoPerspectiva.AprendizadoECrescimento },
    { key: "Financeira E Resultado", value: ObjetivoEstrategicoPerspectiva.FinanceiraEResultado },
    { key: "Mercado E Clientes", value: ObjetivoEstrategicoPerspectiva.MercadoEClientes },
    { key: "Processos Internos", value: ObjetivoEstrategicoPerspectiva.ProcessosInternos }
  ]

  classificacoes = [
    { key: "Crescimento", value: ObjetivoEstrategicoClassificacao.Crescimento },
    { key: "Sustentabilidade", value: ObjetivoEstrategicoClassificacao.Sustentabilidade },
    { key: "Base", value: ObjetivoEstrategicoClassificacao.Base }
  ]

  constructor(
    private objetivosEstrategicosClient: ObjetivosEstrategicosClient,
    private nzNotificationService: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.carregarObjetivos();
  }

  private initForm() {
    this.form = new FormBuilder().group({
      id: [null],
      descricao: [null, Validators.required],
      corFundo: [0, Validators.required],
      corTexto: [0, Validators.required],
      porcentagem: [0, Validators.required],
      objetivoEstrategicoPerspectiva: [0, Validators.required],
      objetivoEstrategicoClassificacao: [0, Validators.required],
      objetivoEstrategicoPaiId: [null],
    });
  }

  carregarObjetivos() {
    this.objetivosEstrategicosClient
      .obter()
      .subscribe((r) => {
        this.objetivos = r;

        this.objetivoPrincipal = r.filter((x) => { return !x.objetivoEstrategicoPaiId })[0]

        this.objetivosFinanceirosCrescimento = r.filter((x) => { return x.objetivoEstrategicoClassificacao === ObjetivoEstrategicoClassificacao.Crescimento && x.objetivoEstrategicoPerspectiva === ObjetivoEstrategicoPerspectiva.FinanceiraEResultado })
        this.objetivosFinanceirosSustentabilidade = r.filter((x) => { return x.objetivoEstrategicoClassificacao === ObjetivoEstrategicoClassificacao.Sustentabilidade && x.objetivoEstrategicoPerspectiva === ObjetivoEstrategicoPerspectiva.FinanceiraEResultado })

        this.objetivosMercadoCrescimento = r.filter((x) => { return x.objetivoEstrategicoClassificacao === ObjetivoEstrategicoClassificacao.Crescimento && x.objetivoEstrategicoPerspectiva === ObjetivoEstrategicoPerspectiva.MercadoEClientes })
        this.objetivosMercadoSustentabilidade = r.filter((x) => { return x.objetivoEstrategicoClassificacao === ObjetivoEstrategicoClassificacao.Sustentabilidade && x.objetivoEstrategicoPerspectiva === ObjetivoEstrategicoPerspectiva.MercadoEClientes })

        this.objetivosProcessosCrescimento = r.filter((x) => { return x.objetivoEstrategicoClassificacao === ObjetivoEstrategicoClassificacao.Crescimento && x.objetivoEstrategicoPerspectiva === ObjetivoEstrategicoPerspectiva.ProcessosInternos })
        this.objetivosProcessosSustentabilidade = r.filter((x) => { return x.objetivoEstrategicoClassificacao === ObjetivoEstrategicoClassificacao.Sustentabilidade && x.objetivoEstrategicoPerspectiva === ObjetivoEstrategicoPerspectiva.ProcessosInternos })

        this.objetivosAprendizado = r.filter((x) => { return x.objetivoEstrategicoPerspectiva === ObjetivoEstrategicoPerspectiva.AprendizadoECrescimento })

        console.log(this.objetivosFinanceirosCrescimento)
        setTimeout(x => { this.conectar_objetivos(); }, 100)
      });
  }

  cadastrar() {
    let fValue = this.form.value;
    this.objetivosEstrategicosClient
      .criar(ObjetivoEstrategicoCriarCommand.fromJS(fValue))
      .subscribe((r) => {
        this.nzNotificationService.success('Objetivo cadastrado com sucesso!', '');
        this.carregarObjetivos();
      }, e => {
        this.nzNotificationService.error('Erro ao cadastrar o objetivo!', '');
      });
  }

  alterar() {
    let fValue = this.form.value;

    this.objetivosEstrategicosClient
      .criar(ObjetivoEstrategicoAlterarCommand.fromJS(fValue))
      .subscribe((r) => {
        this.nzNotificationService.success('Objetivo alterado com sucesso!', '');
        this.carregarObjetivos();
      }, e => {
        this.nzNotificationService.error('Erro ao alterar o objetivo!', '');
      });
  }

  connect(div1, div2, color, thickness) {
    var off1 = this.getOffset(div1);
    var off2 = this.getOffset(div2);
    // bottom right
    var x1 = off1.left + off1.width / 2;
    var y1 = off1.top + off1.height;
    // top right
    var x2 = off2.left + off2.width / 2;
    var y2 = off2.top;
    // distance
    var length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
    // center
    var cx = ((x1 + x2) / 2) - (length / 2);
    var cy = ((y1 + y2) / 2) - (thickness / 2);
    // angle
    var angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
    // make hr
    var htmlLine = "<div class=conexoes style='padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);'/>";

    let divPrincipal = document.getElementById('div-principal');

    divPrincipal.innerHTML += htmlLine;
  }

  getOffset(el) {
    var rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.pageXOffset,
      top: rect.top + window.pageYOffset,
      width: rect.width || el.offsetWidth,
      height: rect.height || el.offsetHeight
    };
  }

  conectar_objetivos() {
    for (let o of this.objetivos) {
      if (!o.objetivoEstrategicoPaiId || o.objetivoEstrategicoClassificacao === ObjetivoEstrategicoClassificacao.Base) continue;

      var id2 = `ob-${o.id}`
      var id1 = `ob-${o.objetivoEstrategicoPaiId}`

      var div1 = document.getElementById(id1);
      var div2 = document.getElementById(id2);

      this.connect(div1, div2, "#000000", 2);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    //@ts-ignore
    [...document.getElementsByClassName("conexoes")].map(n => n && n.remove());
    this.conectar_objetivos();
  }
}
