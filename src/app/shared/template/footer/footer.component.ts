import { Component } from '@angular/core';
import packageInfo from '../../../../../package.json';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html'
})

export class FooterComponent {
    public version: string = packageInfo.version;
    //public version: string = '';
}
