import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { first } from 'rxjs/operators';
import { PortifolioAlterarCommand, PortifolioCriarCommand, PortifoliosClient } from 'web-api-client';

@Component({
  selector: 'app-portifolio-cadastrar-editar',
  templateUrl: './portifolio-cadastrar-editar.component.html',
  styleUrls: ['./portifolio-cadastrar-editar.component.scss']
})
export class PortifolioCadastrarEditarComponent implements OnInit {

  form: UntypedFormGroup = <UntypedFormGroup>{};
  carregando = false;
  portifolioId: number;

  constructor(
    private portifolioClient: PortifoliosClient,
    private nzNotificationService: NzNotificationService,
    private nzModalService: NzModalService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.obterPortifolio();
  }

  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      descricao:  [null, [Validators.required, Validators.maxLength(500)]],
      dataInicio: [null, Validators.required],
      dataTermino: [null, Validators.required],
  });
  }

  obterPortifolio() {
    this.portifolioId = +this.route.snapshot.paramMap.get('id');

    if(this.portifolioId) {
      this.carregando = true;
      this.portifolioClient.obterPorId(this.portifolioId).pipe(first()).subscribe(response => {
        this.carregando = false;
        this.form.patchValue(response);
      });
    }
  }

  salvar() {
    if (this.form.invalid) {
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente os campos obrigatórios!',
      });
    } else {
      this.portifolioId ? this.atualizarPortifolio() : this.cadastrarPortifolio();
    }
  }

  cadastrarPortifolio() {
    let formValue = this.form.value;
    let request = PortifolioCriarCommand.fromJS(formValue);

    this.portifolioClient.criar(request).subscribe(response => {
      this.nzNotificationService.success("Portfólio cadastrado com sucesso!", "");
      this.router.navigate(["/portifolios"]);
    })
  }

  atualizarPortifolio() {
    let formValue = this.form.value;

    let request = PortifolioAlterarCommand.fromJS(formValue);

    this.portifolioClient.alterar(request).subscribe(response => {
      this.nzNotificationService.success("Portfólio alterado com sucesso!", "");
      this.router.navigate(["/portifolios"]);
    })
  }


}
