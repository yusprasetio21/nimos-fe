import { Role } from '../roles/role.model';
import { PagedResponse } from '../../../../core/types';
import { Subscription, Observable, BehaviorSubject, of } from 'rxjs';
import { map, finalize, catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { CrudHTTPService } from 'src/app/core/services/base-crud/crud-http.service';
import { Permission } from './models/permission.model';

export type PermissionType = Permission | undefined;

@Injectable({
    providedIn: 'root'
})
export class PermissionService extends CrudHTTPService<PagedResponse<Permission>, number> implements OnDestroy {
    // private variables
    private unsubscribe: Subscription[] = [];

    // // public variables
    // Permission
    currentPermission$: Observable<PermissionType>;
    isLoadingPermission$: Observable<boolean>;
    currentPermissionSubject: BehaviorSubject<PermissionType>;
    isLoadingPermissionSubject: BehaviorSubject<boolean>;
    // Permission[]
    currentPermissions$: Observable<PermissionType[]>;
    isLoadingPermissions$: Observable<boolean>;
    currentPermissionsSubject: BehaviorSubject<PermissionType[]>;
    isLoadingPermissionsSubject: BehaviorSubject<boolean>;

    constructor(protected _http: HttpClient) {
        super(_http, `${environment.app.apiUrl}/api/permissions`);
        // Permission
        this.isLoadingPermissionSubject = new BehaviorSubject<boolean>(false);
        this.currentPermissionSubject = new BehaviorSubject<PermissionType>(undefined);
        this.isLoadingPermission$ = this.isLoadingPermissionSubject.asObservable();
        this.currentPermission$ = this.currentPermissionSubject.asObservable();
        // Permission[]
        this.isLoadingPermissionsSubject = new BehaviorSubject<boolean>(false);
        this.currentPermissionsSubject = new BehaviorSubject<PermissionType[]>([]);
        this.isLoadingPermissions$ = this.isLoadingPermissionsSubject.asObservable();
        this.currentPermissions$ = this.currentPermissionsSubject.asObservable();
    }

    ngOnDestroy() {
        this.unsubscribe.forEach(subscr => subscr.unsubscribe());
    }
}
