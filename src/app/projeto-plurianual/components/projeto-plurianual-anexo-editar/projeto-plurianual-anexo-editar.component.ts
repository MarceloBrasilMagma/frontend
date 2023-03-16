import { Component, Input, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Observable, Subject, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ProjetoPlurianualAnexoCriarCommand, ProjetoPlurianualAnexoDto, ProjetoPlurianualVm, ProjetosPlurianuaisClient, StatusProjeto } from 'web-api-client';

@Component({
  selector: 'app-projeto-plurianual-anexo-editar',
  templateUrl: './projeto-plurianual-anexo-editar.component.html',
  styleUrls: ['./projeto-plurianual-anexo-editar.component.scss']
})
export class ProjetoPlurianualAnexoEditarComponent implements OnInit {
  private _projetoPlurianual: ProjetoPlurianualVm;
  
  @Input() statusProjeto: StatusProjeto;
  @Input() set projetoPlurianual(val: ProjetoPlurianualVm) {
    this._projetoPlurianual = val;
    this.carregarListaArquivos();
  }
  get projetoPlurianual(): ProjetoPlurianualVm{
    return this._projetoPlurianual;
  }


  fileList: NzUploadFile[] = [];

  baixandoArquivo: boolean;
  excluindoAnexo: boolean;

  constructor(
    private nzModalService: NzModalService,
    private nzNotificationService: NzNotificationService,
    private projetosPlurianuaisClient: ProjetosPlurianuaisClient,
  ) {}

  ngOnInit(): void {}

  private carregarListaArquivos() {
    if (!!this._projetoPlurianual) {
      this.fileList = this._projetoPlurianual.anexos.map((a) => {
        return <NzUploadFile>{
          uid: a.id + '',
          status: 'done',
          name: a.nomeArquivo,
        };
      });
    }
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
      let req = <ProjetoPlurianualAnexoCriarCommand>{
        anexos: [
          <ProjetoPlurianualAnexoDto>{
            nomeArquivo: item.file.name,
            arquivoBase64: base64,
            projetoPlurianualId: this._projetoPlurianual.id,
          },
        ],
      };

      this.projetosPlurianuaisClient
        .incluirAnexo(req)
        .subscribe(
          (r) => {
            this.fileList = this.fileList.filter((f) => f.uid != item.file.uid);
            this.fileList.push(<NzUploadFile>{
              uid: r.id + '',
              status: 'done',
              name: r.nomeArquivo,
            });
            subject.next('success');
            subject.complete();
          },
          (err) => {
            subject.next('error');
            subject.complete();
          }
        );
    });

    return subject.subscribe((res) => {
      if (res === 'success') {
        item.onSuccess({}, item.file, event);
        this.nzNotificationService.success('Sucesso', null);
      } else {
        item.onError('err', item.file);
      }
    });
  };

  handleRemove = (file: NzUploadFile): Observable<boolean> | boolean => {
    if (!file.showDownload) {
      return true;
    }

    const subject = new Subject<boolean>();

    this.excluindoAnexo = true;
    this.projetosPlurianuaisClient
      .excluirAnexo(file.uid as any)
      .pipe(
        finalize(() => {
          this.excluindoAnexo = false;
        })
      )
      .subscribe(
        (r) => {
          this.nzNotificationService.success('Anexo Excluído', null);
          subject.next(true);
          subject.complete();
        },
        (err) => {
          subject.next(false);
          subject.complete();
        }
      );

    return subject.asObservable();
  };

  handleDownload = (file: NzUploadFile): void => {
    this.baixandoArquivo = true;
    this.projetosPlurianuaisClient
      .obterAnexoComBase64(file.uid as any)
      .pipe(
        finalize(() => {
          this.baixandoArquivo = false;
        })
      )
      .subscribe(
        (r) => {
          this.downloadBase64(r.nomeArquivo, r.tipoArquivo, r.arquivoBase64);
        },
        (e) => console.log(e)
      );
  };

  private read(file: File): Observable<string> {
    return new Observable<any>((observer) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        observer.next(reader.result);
        observer.complete();
      };
    });
  }

  private async downloadBase64(
    fNameWithExtension: string,
    base64Header: string,
    base64Data: string
  ) {
    fetch(`${base64Header},${base64Data}`)
      .then((res) => res.blob())
      .then((blob) => {
        let objectUrl = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.setAttribute('style', 'display: none');
        a.href = objectUrl;
        a.download = fNameWithExtension;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(objectUrl);
        a.remove();
      });
  }

  get desabilitaBotoes(): boolean{
    return this.statusProjeto !== StatusProjeto.Ativo;
  }
}
