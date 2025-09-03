import { MenuItem } from './menu-item.model';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-menu-item',
    templateUrl: './menu-item.component.html',
    styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent {
    @Input() menuItem: MenuItem;
    constructor() {}

    trackByFn(index: number, item: MenuItem): number {
        return item.id ? item.id : index;
    }
}
