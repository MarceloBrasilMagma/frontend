import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Subscription, Subject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { YearReferenceService } from 'src/app/shared/services/year-reference.service';
import {
  CronogramaObterPorProjetoQuery,
  CronogramaVm,
  CronogramasClient,
  PaginatedListOfCronogramaVm,
  ProjetoVm,
  CronogramaImportarCommand,
  StatusCronograma,
  API_BASE_URL,
  StatusProjeto,
} from 'web-api-client';
import { CronogramaFormComponent } from '../cronograma-form/cronograma-form.component';

@Component({
  selector: 'app-cronograma-tabela',
  templateUrl: './cronograma-tabela.component.html',
  styleUrls: ['./cronograma-tabela.component.scss'],
})
export class CronogramaTabelaComponent implements OnInit {
  @Input() projetoId: number;
  @Input() projeto: ProjetoVm;
  @Input() statusProjeto: StatusProjeto;
  @Input() possuiPermissaoEditar: boolean;
  @Output() recarregarEvent = new EventEmitter<void>();

  cronogramas: PaginatedListOfCronogramaVm;
  cronogramaAtual: CronogramaVm;
  cronogramaImportacao: CronogramaVm;

  pageIndex: number = 1;
  pageSize: number = 10;

  carregando: boolean = false;

  abaSelecionada = 0;

  fileList: NzUploadFile[] = [];

  novaBaseline = false;

  req: CronogramaImportarCommand;

  carinha: string;
  urlModeloProject: string;

  constructor(
    private cronogramasClient: CronogramasClient,
    private nzModalService: NzModalService,
    private nzNotificationService: NzNotificationService,
    private ano: YearReferenceService,
    @Inject(API_BASE_URL) baseUrl?: string
  ) {
    this.urlModeloProject = `${baseUrl}/modelos/Modelo-Cronograma-PMOSOFT.mpp`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.carregarCronogramas(1, this.pageSize);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  carregarCronogramas(pageIndex: number, pageSize: number) {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    let anoReferencia = this.ano.obterAno();

    let req = <CronogramaObterPorProjetoQuery>{
      pageIndex: pageIndex,
      pageSize: pageSize,
      projetoId: this.projetoId,
      ano: anoReferencia,
    };

    this.carregando = true;

    this.cronogramasClient
      .obterPorProjetoId(req)
      .pipe(
        finalize(() => {
          this.carregando = false;
        })
      )
      .subscribe((r) => {
        this.cronogramas = r;

        if (pageIndex == 1) {
          this.cronogramaAtual = r.items[0];
        }
      });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.carregarCronogramas(pageIndex, pageSize);
  }

  excluirCronograma(cronograma?: CronogramaVm) {
    this.carregando = true;
    this.cronogramasClient
      .excluir(cronograma.id)
      .pipe(
        finalize(() => {
          this.carregando = false;
        })
      )
      .subscribe((r) => {
        this.carregarCronogramas(1, this.pageSize);
      });
  }

  exibirModalEditar(cronograma?: CronogramaVm) {
    const modal = this.nzModalService.create({
      nzContent: CronogramaFormComponent,
      nzTitle: !cronograma ? 'Criar registro' : 'Editar registro',
      nzComponentParams: {
        cronograma: cronograma,
        projetoId: this.projetoId,
      },
      nzMaskClosable: false,
      nzClosable: false,
      nzWidth: '50%',
    });

    modal.afterClose.subscribe((r) => {
      if (r) {
        this.carregarCronogramas(1, this.pageSize);
      } else {
      }
    });
  }

  onIndexChange(index: number): void {
    this.abaSelecionada = index;
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    const isLt10M = file.size / 1024 / 1024 < 200;

    if (!isLt10M) {
      this.nzModalService.error({
        nzTitle: 'Ooops...',
        nzContent:
          'O arquivo excede o limite de 200 MB e não tem permissão para fazer o envio.',
      });
      return false;
    }

    return true;
  };

  handleUpload = (item: NzUploadXHRArgs): Subscription => {
    const subject = new Subject();
    this.read(item.file as any).subscribe((base64) => {
      this.req = <CronogramaImportarCommand>{
        base64file: base64,
        projetoId: this.projetoId,
        novoBaseline: this.novaBaseline,
      };

      this.cronogramasClient.visualizarImportacao(this.req).subscribe(
        (res) => {
          this.abaSelecionada = 1;
          this.cronogramaImportacao = res;
          item.onSuccess({}, item.file, event);
          this.fileList = [];
        },
        (err) => {
          item.onError('err', item.file);
          this.fileList = [];
        }
      );
    });

    return subject.subscribe();
  };

  private read(file: File): Observable<string> {
    return new Observable<any>((observer) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        observer.next(reader.result?.toString() || '');
        observer.complete();
      };
      reader.onerror = (error) => console.log(error);
    });
  }

  getVersaoCronograma(cronograma: CronogramaVm) {
    return (
      'V_' +
      cronograma.data
        .toISOString()
        .split('T')[0]
        .replace('-', '')
        .replace('-', '')
    );
  }

  getCorIndicador(cronograma: CronogramaVm) {
    if (cronograma.status === StatusCronograma.Verde) {
      this.carinha = 'smile';
      return 'color: green; background-color: rgba(0, 128, 0, 0.182);';
    }
    if (cronograma.status === StatusCronograma.Amarelo) {
      this.carinha = 'meh';
      return 'color: rgb(121, 121, 0); background-color: rgba(255, 255, 0, 0.581);';
    }
    if (cronograma.status === StatusCronograma.Vermelho) {
      this.carinha = 'frown';
      return 'color: red; background-color: rgba(128, 0, 0, 0.182);';
    }
  }

  confirmarImportacao() {
    this.carregando = true;
    this.cronogramasClient
      .importar(this.req)
      .pipe(
        finalize(() => {
          this.carregando = false;
        })
      )
      .subscribe(
        (r) => {
          this.cronogramaImportacao = null;
          this.nzNotificationService.success('Sucesso', null);
          this.carregarCronogramas(1, this.pageSize);
        },
        (e) => {
          this.cronogramaImportacao = null;
          this.nzNotificationService.error('Erro', null);
          this.carregarCronogramas(1, this.pageSize);
        }
      );
  }

  cancelarImportacao() {
    this.cronogramaImportacao = null;
  }

  get desabilitaBotoes() {
    return this.statusProjeto !== StatusProjeto.Ativo;
  }

  dataStatusCronograma(dataStatus: Date) {
    if (dataStatus.getFullYear() < 10 || !dataStatus) {
      return 'Não informada';
    } else {
      return dataStatus.toLocaleDateString();
    }
  }
}
