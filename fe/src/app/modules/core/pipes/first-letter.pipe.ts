import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstLetter',
  standalone: false
})
export class FirstLetterPipe implements PipeTransform {

  transform(value: string, ...args: any[]): string {
    return value
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substr(0, 2);
  }

}
