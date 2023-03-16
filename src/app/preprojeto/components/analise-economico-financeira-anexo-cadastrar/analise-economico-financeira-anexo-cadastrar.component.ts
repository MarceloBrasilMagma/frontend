import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';

import {
  AnaliseEconomicoFinanceiraAnexoDto,
} from 'web-api-client';

@Component({
  selector: 'app-analise-economico-financeira-anexo-cadastrar',
  templateUrl: './analise-economico-financeira-anexo-cadastrar.component.html',
  styleUrls: ['./analise-economico-financeira-anexo-cadastrar.component.scss']
})
export class AnaliseEconomicoFinanceiraAnexoCadastrarComponent implements OnInit {
  @Input() anexos: AnaliseEconomicoFinanceiraAnexoDto[];
  @Output() anexosChange = new EventEmitter();

  fileList: NzUploadFile[] = [];

  baixandoArquivo: boolean;
  excluindoAnexo: boolean;

  constructor(private nzModalService: NzModalService) {}

  ngOnInit(): void {}

  beforeUpload = (file: NzUploadFile): boolean => {
    const isLt10M = file.size / 1024 / 1024 < 200;

    if (!isLt10M) {
      this.nzModalService.error({
        nzTitle: 'Ooops...',
        nzContent:
          'O arquivo excede o limite de 200 MB e não tem permissão para fazer o envio.',
      });
    }

    if (isLt10M) {
      this.fileList = this.fileList.concat(file);
      this.gravarArquivosObjEntrada();
    }

    return false;
  };

  onNzUploadChangeParam(e: NzUploadChangeParam) {
    setTimeout(() => {
      this.gravarArquivosObjEntrada();
    }, 1000);
  }

  private gravarArquivosObjEntrada() {
    this.anexos = [];
    for (let file of this.fileList) {
      const reader = new FileReader();
      reader.readAsDataURL(file as any);
      reader.onload = () => {
        this.anexos.push(
          new AnaliseEconomicoFinanceiraAnexoDto({
            nomeArquivo: file.name,
            arquivoBase64: reader.result as string,
          })
        );
        this.anexosChange.emit(this.anexos);
      };
    }
  }
}
