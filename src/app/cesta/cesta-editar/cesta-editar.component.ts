import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';
import {
  CestaAlterarCommand,
  CestaCriarCommand,
  CestaExcluirCommand,
  CestasClient,
  CestaVm,
} from 'web-api-client';

@Component({
  selector: 'app-cesta-editar',
  templateUrl: './cesta-editar.component.html',
  styleUrls: ['./cesta-editar.component.scss'],
})
export class CestaEditarComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cestasClient: CestasClient,
    private nzNotificationService: NzNotificationService,
    private nzModalService: NzModalService
  ) {}

  // Dados
  cesta: CestaVm;

  carregando = false;
  form: UntypedFormGroup = <UntypedFormGroup>{};
  cestaId: number;

  ngOnInit(): void {
    this.initForm();
    this.cestaId = +this.route.snapshot.paramMap.get('id');
    if (this.cestaId) {
      this.carregarCesta();
    }
  }

  // Inicializa o formulário
  private initForm() {
    this.form = new UntypedFormBuilder().group({
      id: [null],
      descricao: [null, [Validators.required, Validators.maxLength(500)]],
    });
  }

  carregarCesta() {
    this.carregando = true;
    this.cestasClient
      .obterPorId(this.cestaId)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe((response) => {
        this.form.patchValue(response);
        this.cesta = response;
      });
  }

  salvar() {
    if (this.form.invalid) {
      for (const key in this.form.controls) {
        this.form.controls[key].markAsDirty();
        this.form.controls[key].updateValueAndValidity();
      }
      this.nzModalService.warning({
        nzTitle: 'Atenção',
        nzContent:
          'Verifique o formulário e preencha corretamente os campos obrigatórios!',
      });
    } else {
      this.cestaId ? this.atualizarCesta() : this.cadastrarCesta();
    }
  }

  cadastrarCesta() {
    let formValue = this.form.value;

    let request = CestaCriarCommand.fromJS(formValue);

    this.cestasClient.criar(request).subscribe((response) => {
      this.nzNotificationService.success('Cesta cadastrada com sucesso!', '');
      this.router.navigate(['/cestas/editar/', response.id]);
    });
  }

  atualizarCesta() {
    let formValue = this.form.value;

    let request = CestaAlterarCommand.fromJS(formValue);

    this.cestasClient.alterar(request).subscribe((response) => {
      this.nzNotificationService.success('Cesta alterada com sucesso!', '');
      this.router.navigate(['/cestas']);
    });
  }

  excluir(id: number) {
    this.carregando = true;
    let request = new CestaExcluirCommand({ id });

    this.cestasClient.excluir(request).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/cestas']);
      },
    });
  }
}
