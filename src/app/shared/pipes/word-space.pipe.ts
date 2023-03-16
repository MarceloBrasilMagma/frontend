import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wordSpace'
})
export class WordSpacePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    let result = value[0];
    for (let i = 1; i < value.length; i++) {
      if (value.charCodeAt(i) >= 65 && value.charCodeAt(i) <= 90) {
        result += ' ' + String.fromCharCode(value.charCodeAt(i) + 32);
      } else {
        result += value[i];
      }
    }
     
    return result;
  }
}
