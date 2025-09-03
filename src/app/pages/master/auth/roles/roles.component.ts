import { Observable, Subscription } from 'rxjs';
import { RolesService, RoleType } from './roles.service';
import { Role } from './role.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { startCase } from 'lodash';
import { Permission } from '../permission/models/permission.model';

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, OnDestroy {
    startCase = startCase;
    Role = Role;

    data$: Observable<RoleType[]>;
    isLoadingData$: Observable<boolean>;
    datum$: Observable<RoleType>;
    isLoadingDatum$: Observable<boolean>;

    private unsubscribe: Subscription[] = [];

    constructor(private dataService: RolesService) {
        this.data$ = this.dataService.currentRolesSubject.asObservable();
        this.isLoadingData$ = this.dataService.isLoadingRoles$;
        this.datum$ = this.dataService.currentRole$;
        this.isLoadingData$ = this.dataService.isLoadingRole$;
    }

    ngOnInit(): void {
        const subsr = this.dataService.getRoles('?include=permissions,usersCount').subscribe();
        this.unsubscribe.push(subsr);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach(subscription => subscription.unsubscribe());
    }

    onParamsChange(params: any): void {
        console.log(params);
    }

    trackByFn(index: number, item: RoleType): number {
        return item?.id ? item?.id : index;
    }

    trackByFnPerm(index: number, item: Permission): number {
        return item.id ? item.id : index;
    }
}
