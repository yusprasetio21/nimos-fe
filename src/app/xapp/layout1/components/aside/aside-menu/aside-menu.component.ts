import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { AsideMenuService } from './aside-menu.service';
import { MenuItem } from './menu-item/menu-item.model';

@Component({
    selector: 'app-aside-menu',
    templateUrl: './aside-menu.component.html',
    styleUrls: ['./aside-menu.component.scss']
})
export class AsideMenuComponent implements OnInit, OnDestroy {
    appAngularVersion: string = environment.appVersion;
    appPreviewChangelogUrl: string = environment.appPreviewChangelogUrl;
    menuItems$: Observable<MenuItem[]>;

    private unsubscribe: Subscription[] = [];

    constructor(private asideMenuService: AsideMenuService) {}

    trackByFn(index: number, item: MenuItem): number {
        return item.id ? item.id : index;
    }

    ngOnInit(): void {
        this.menuItems$ = this.asideMenuService.currentMenuItemsSubject.asObservable();
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach(subscription => subscription.unsubscribe());
    }
}
