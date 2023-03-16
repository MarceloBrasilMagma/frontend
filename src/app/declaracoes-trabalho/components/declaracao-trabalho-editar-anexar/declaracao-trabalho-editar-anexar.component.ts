import { Component, Input, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Observable, Subject, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import {
  DeclaracaoTrabalhoAnexoCriarCommand,
  DeclaracaoTrabalhoAnexoCriarDto,
  DeclaracaoTrabalhoVm,
  DeclaracoesTrabalhoClient,
} from 'web-api-client';

@Component({
  selector: 'app-declaracao-trabalho-editar-anexar',
  templateUrl: './declaracao-trabalho-editar-anexar.component.html',
  styleUrls: ['./declaracao-trabalho-editar-anexar.component.scss'],
})
export class DeclaracaoTrabalhoEditarAnexarComponent implements OnInit {
  @Input() set declaracaoTrabalho(val: DeclaracaoTrabalhoVm) {
    this._declaracaoTrabalho = val;
    this.carregarListaArquivos();
  }

  _declaracaoTrabalho: DeclaracaoTrabalhoVm;

  fileList: NzUploadFile[] = [];

  baixandoArquivo: boolean;
  excluindoAnexo: boolean;

  constructor(
    private nzModalService: NzModalService,
    private nzNotificationService: NzNotificationService,
    private declaracoesTrabalhoClient: DeclaracoesTrabalhoClient
  ) { }

  ngOnInit(): void { }

  private carregarListaArquivos() {
    if (!!this._declaracaoTrabalho) {
      this.fileList = this._declaracaoTrabalho?.anexos?.map((a) => {
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
      let req = <DeclaracaoTrabalhoAnexoCriarCommand>{
        anexos: [
          <DeclaracaoTrabalhoAnexoCriarDto>{
            nomeArquivo: item.file.name,
            arquivoBase64: base64,
            declaracaoTrabalhoId: this._declaracaoTrabalho.id,
          },
        ],
      };

      this.declaracoesTrabalhoClient
        .incluirAnexo(this._declaracaoTrabalho.id as any, req)
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
    this.declaracoesTrabalhoClient
      .excluirAnexo(this._declaracaoTrabalho.id, file.uid as any)
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
    this.declaracoesTrabalhoClient
      .obterAnexoComBase64(this._declaracaoTrabalho.id, file.uid as any)
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
}
