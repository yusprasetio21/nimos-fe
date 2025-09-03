import { Icon } from '../../../../../../modules/icons/icon.model';
export class MenuItem {
    id: number;
    label: string;
    type: string;
    icon: Icon;
    url: string;
    order: number;
    hasSubMenu: boolean;
    parentId: number;
    children: MenuItem[];
    permission: string;
    isActive: boolean;

    setMenuItem(menuItem: unknown) {
        const item = menuItem as MenuItem;
        this.id = item.id;
        this.label = item.label;
        this.type = item.type;
        this.icon = item.icon;
        this.url = item.url;
        this.order = item.order;
        this.hasSubMenu = item.hasSubMenu;
        this.parentId = item.parentId;
        this.children = item.children;
        this.permission = item.permission;
        this.isActive = item.isActive;
    }
}
