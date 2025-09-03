import { finalize } from 'rxjs/operators';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenuItem } from './menu-item/menu-item.model';

@Injectable({
    providedIn: 'root'
})
export class AsideMenuService implements OnDestroy {
    // private fields
    private unsubscribe: Subscription[] = [];
    private userLocalStorageKey = `${environment.appVersion}-currentUser`;

    // public fields
    appAngularVersion: string = environment.appVersion;
    appPreviewChangelogUrl: string = environment.appPreviewChangelogUrl;
    menuItems$: Observable<MenuItem[]>;
    isLoading$: Observable<boolean>;
    currentMenuItemsSubject: BehaviorSubject<MenuItem[]>;
    isLoadingSubject: BehaviorSubject<boolean>;

    get currentMenuItemsValue(): MenuItem[] {
        return this.currentMenuItemsSubject.value;
    }

    set currentMenuItemsValue(menuItems: MenuItem[]) {
        this.currentMenuItemsSubject.next(menuItems);
    }

    constructor() {
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
        this.currentMenuItemsSubject = new BehaviorSubject<MenuItem[]>([]);
        this.menuItems$ = this.currentMenuItemsSubject.asObservable();
        this.isLoading$ = this.isLoadingSubject.asObservable();
        const subscr = this.getMenuItems().subscribe();
        this.unsubscribe.push(subscr);
    }

    getMenuItems(): Observable<MenuItem[]> {
        this.isLoadingSubject.next(true);
        return new Observable<MenuItem[]>(observer => {
            const menuItems: MenuItem[] = this.getMenuItemsFromLocalStorage();
            observer.next(menuItems);
        }).pipe(
            map((menuItems: MenuItem[]) => {
                this.currentMenuItemsSubject.next(menuItems);
                this.isLoadingSubject.next(false);
                return menuItems;
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    // private methods
    private getMenuItemsFromLocalStorage(): MenuItem[] {
        const lsValue = localStorage.getItem(this.userLocalStorageKey);
        const menuItems: MenuItem[] = [];

        if (lsValue) {
            const tmpMenuItems = JSON.parse(lsValue).menus;
            tmpMenuItems.forEach((menuItem: any) => {
                const newMenuItem = new MenuItem();
                newMenuItem.id = menuItem.id;
                newMenuItem.label = menuItem.label;
                newMenuItem.type = menuItem.type;
                newMenuItem.icon = menuItem.icon;
                newMenuItem.url = menuItem.url;
                newMenuItem.hasSubMenu = menuItem.children && menuItem.children.length > 0 ? true : false;
                newMenuItem.parentId = menuItem.parent_id;
                newMenuItem.order = menuItem.order;
                newMenuItem.isActive = menuItem.is_active;
                newMenuItem.children = menuItem.children
                    ? menuItem.children.sort((a: MenuItem, b: MenuItem) => a.order - b.order)
                    : [];
                newMenuItem.permission = menuItem.permission;
                menuItems.push(newMenuItem);
            });
        }

        return menuItems.sort((a, b) => a.order - b.order);
    }

    ngOnDestroy() {
        this.unsubscribe.forEach(sub => sub.unsubscribe());
    }
}
