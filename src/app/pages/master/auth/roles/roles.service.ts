import { PagedResponse } from './../../../../core/types';
import { environment } from './../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CrudHTTPService } from 'src/app/core/services/base-crud/crud-http.service';
import { Role } from './role.model';
import { Permission } from '../permission/models/permission.model';
import { Observable, Subscription, BehaviorSubject, map, finalize } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';

export type RoleType = Role | undefined;

@Injectable({
    providedIn: 'root'
})
export class RolesService extends CrudHTTPService<Role, number> implements OnDestroy {
    // private fields
    private unsubscribe: Subscription[] = [];

    // public fields
    // Role
    currentRole$: Observable<RoleType>;
    isLoadingRole$: Observable<boolean>;
    currentRoleSubject: BehaviorSubject<RoleType>;
    isLoadingRoleSubject: BehaviorSubject<boolean>;
    // Role[]
    currentRoles$: Observable<RoleType[]>;
    isLoadingRoles$: Observable<boolean>;
    currentRolesSubject: BehaviorSubject<RoleType[]>;
    isLoadingRolesSubject: BehaviorSubject<boolean>;

    constructor(protected _http: HttpClient) {
        super(_http, `${environment.app.apiUrl}/api/roles`);
        // Role
        this.isLoadingRoleSubject = new BehaviorSubject<boolean>(false);
        this.currentRoleSubject = new BehaviorSubject<RoleType>(undefined);
        this.isLoadingRole$ = this.isLoadingRoleSubject.asObservable();
        this.currentRole$ = this.currentRoleSubject.asObservable();
        // Role[]
        this.isLoadingRolesSubject = new BehaviorSubject<boolean>(false);
        this.currentRolesSubject = new BehaviorSubject<RoleType[]>([]);
        this.isLoadingRoles$ = this.isLoadingRolesSubject.asObservable();
        this.currentRoles$ = this.currentRolesSubject.asObservable();
    }

    ngOnDestroy() {
        this.unsubscribe.forEach(subscr => subscr.unsubscribe());
    }

    getRoles(query: string): Observable<RoleType[]> {
        this.isLoadingRolesSubject.next(true);
        return super.findAll(query).pipe(
            map((response: PagedResponse<Role>) => {
                const newRoles = this.setRoles(response.data as any[]);
                this.currentRolesSubject.next(newRoles);
                return newRoles;
            }),
            finalize(() => this.isLoadingRolesSubject.next(false))
        );
    }

    private setRoles(roles: any[]): Role[] {
        return Object.values(roles || {}).map(role => {
            return this.setRole(role);
        });
    }

    private setRole(role: any): Role {
        const newRole = new Role();
        newRole.id = role.id;
        newRole.name = role.name;
        newRole.permissions = this.setPermissions(role.permissions);
        newRole.usersCount = role.users_count;
        newRole.createdAt = new Date(role.created_at);
        newRole.updatedAt = new Date(role.updated_at);

        return newRole;
    }

    private setPermissions(permissions: any[]): Permission[] {
        return permissions.map(permission => {
            const newPermission = new Permission();
            newPermission.id = permission.id;
            newPermission.name = permission.name;
            newPermission.createdAt = new Date(permission.created_at);
            newPermission.updatedAt = new Date(permission.updated_at);

            return newPermission;
        });
    }
}
