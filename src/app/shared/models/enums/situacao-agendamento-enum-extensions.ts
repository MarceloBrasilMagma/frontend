import { SituacaoAgendamento } from 'web-api-client';
import { KeyValueModel } from '../key-value.model';

export class SituacaoAgendamentoEnumExtensions {
  static getDescription(enumValue: number): string {
    switch (enumValue) {
      case SituacaoAgendamento.Agendado:
        return 'Agendado';
      case SituacaoAgendamento.Cancelado:
        return 'Cancelado';
      case SituacaoAgendamento.NaoCompareceu:
        return 'Não Compareceu';
      default:
        return '';
    }
  }

  static getList(): KeyValueModel[] {
    const result: KeyValueModel[] = [];

    Object.keys(SituacaoAgendamento).forEach((key) => {
      const enumValue = SituacaoAgendamento[key];
      if (!isNaN(Number(enumValue))) {
        result.push(
          new KeyValueModel({
            key: enumValue,
            value: SituacaoAgendamentoEnumExtensions.getDescription(enumValue),
          })
        );
      }
    });

    return result;
  }
}
