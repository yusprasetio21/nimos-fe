import { PagedResponse } from '../../../../core/types';
import { Role } from '../roles/role.model';
import { AbilityName } from './models/ability-name.model';
import { AbilityType } from './models/ability-type.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';

import { MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Permission } from './models/permission.model';
import { PermissionService, PermissionType } from './permission.service';
import { startCase, split, uniq, isEmpty } from 'lodash';

@Component({
    selector: 'app-permission',
    templateUrl: './permission.component.html',
    styleUrls: ['./permission.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class PermissionComponent implements OnInit, OnDestroy {
    startCase = startCase;
    split = split;
    uniq = uniq;
    isEmpty = isEmpty;
    private unsubscribe: Subscription[] = [];

    // public
    data$: Observable<PermissionType[]>;
    isLoadingData$: Observable<boolean>;
    datum$: Observable<PermissionType>;
    isLoadingDatum$: Observable<boolean>;
    abilityTypes: object[] = [];
    selectedAbilityType: AbilityType;
    abilityNames: object[] = [];
    selectedAbilityName: AbilityName;

    // table
    selectedData: Permission[] = [];
    totalRecords: number;
    cols: any[] = [];
    selectAll = false;

    // dataForm
    submitted = false;
    dialog = false;
    dataForm: FormGroup;

    get f() {
        return this.dataForm.controls;
    }

    constructor(
        private dataService: PermissionService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.data$ = this.dataService.currentPermissions$;
        this.isLoadingData$ = this.dataService.isLoadingPermissions$;
        this.datum$ = this.dataService.currentPermission$;
        this.isLoadingData$ = this.dataService.isLoadingPermission$;
    }

    ngOnInit(): void {
        this.abilityTypes = Object.entries(AbilityType).map((value, index) => {
            return { name: startCase(value[1]), code: value[0] };
        });

        this.getAbilityNames();

        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'roles', header: 'Roles' },
            { field: 'createdAt', header: 'Created At' }
        ];

        this.initData();
        this.initForm(new Permission());
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach(sub => sub.unsubscribe());
    }

    // methods
    loadData(event: LazyLoadEvent) {
        this.dataService.isLoadingPermissionsSubject.next(true);
        const query = this.convertEventToQuery(event);

        this.dataService.findAll(query).subscribe({
            next: (response: PagedResponse<Permission>) => {
                const data = this.setPermissions(response.data as Permission[]);
                this.totalRecords = response.total as number;
                this.dataService.currentPermissionsSubject.next(data);
                this.dataService.isLoadingPermissionsSubject.next(false);
            },
            error: err => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err?.error?.message
                });
            }
        });
    }

    initData() {
        this.dataService.isLoadingPermissionsSubject.next(true);
        this.dataService.findAll('?include=roles&page[size]=10').subscribe({
            next: (response: PagedResponse<Permission>) => {
                const data = this.setPermissions(response.data as Permission[]);
                this.totalRecords = response.total as number;
                this.dataService.currentPermissionsSubject.next(data);
                this.dataService.isLoadingPermissionsSubject.next(false);
            },
            error: err => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: err?.error?.message
                });
            }
        });
    }

    initForm(data: Permission): void {
        this.dataForm = this.fb.group({
            id: [data?.id],
            abilityType: [data.abilityType, Validators.required],
            abilityName: [data.abilityName, Validators.required],
            roles: [data.roles]
        });
    }

    create() {
        this.submitted = false;
        this.dialog = true;
        this.initForm(new Permission());
    }

    edit(datum: Permission) {
        this.submitted = false;
        this.dialog = true;
        this.initForm(datum);
    }

    removeSelected() {
        this.selectedData.forEach(permission => {
            this.remove(permission);
        });
    }

    remove(permission: Permission) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + permission.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.dataService.delete(permission.id as number).subscribe({
                    next: () => {
                        const data = this.dataService.currentPermissionsSubject.value.filter(val => {
                            const datum = val as Permission;
                            return (datum.id as number) !== permission.id;
                        });
                        this.dataService.currentPermissionsSubject.next(data);
                        this.selectedData = this.selectedData.filter(val => val.id !== permission.id);
                    },
                    error: err => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: err?.error?.message
                        });
                    },
                    complete: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Permission Deleted',
                            life: 3000
                        });
                    }
                });
            }
        });
    }

    hideDialog() {
        this.dialog = false;
        this.submitted = false;
    }

    save() {
        this.submitted = true;

        // new Permission
        const permission = new Permission();
        if (this.f.id) permission.id = this.f.id.value;
        permission.name = `${this.f.abilityType.value} ${this.f.abilityName.value}`;
        permission.roles = this.f.roles.value;

        this.dataService.currentPermissionSubject.next(permission);
        this.dataService.isLoadingPermissionsSubject.next(true);
        if (permission.name.trim()) {
            const request: any = {};
            request.name = permission.getRawName();
            request.roles = permission.roles;

            if (permission.id) {
                request.id = permission.id;

                this.dataService.update(request.id, request).subscribe({
                    next: response => {
                        const datum = this.setPermission(response);
                        const data = this.dataService.currentPermissionsSubject.value as Permission[];
                        data.splice(data.indexOf(datum), 1, datum);
                        this.dataService.currentPermissionsSubject.next(data);
                        this.dataService.isLoadingPermissionsSubject.next(false);
                        this.dialog = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Permission Updated',
                            life: 3000
                        });
                        this.dataService.currentPermissionSubject.next(undefined);
                    },
                    error: err => {
                        console.error(err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: err?.error?.message
                        });
                    }
                });
            } else {
                this.dataService.save(request).subscribe({
                    next: response => {
                        const datum = this.setPermission(response);
                        const data = this.dataService.currentPermissionsSubject.value;
                        data.push(datum);
                        this.dataService.currentPermissionsSubject.next(data);
                        this.dataService.currentPermissionSubject.next(undefined);
                        this.dialog = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Permission Created',
                            life: 3000
                        });
                    },
                    error: err => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: err?.error?.message
                        });
                    }
                });
            }
        }
    }

    private setPermissions(data: any[]): Permission[] {
        return Object.values(data || {}).map(datum => {
            return this.setPermission(datum);
        });
    }

    private setPermission(datum: any): Permission {
        const newPermission = new Permission();
        newPermission.id = datum.id;
        newPermission.name = datum.name;
        newPermission.roles = this.setRoles(datum.roles);
        newPermission.createdAt = new Date(datum.created_at);
        newPermission.updatedAt = new Date(datum.updated_at);

        return newPermission;
    }

    private setRoles(roles: any[]): Role[] {
        return Object.values(roles || {}).map(role => {
            const newRole = new Role();
            newRole.id = role.id;
            newRole.name = role.name;
            newRole.createdAt = new Date(role.created_at);
            newRole.updatedAt = new Date(role.updated_at);

            return newRole;
        });
    }

    private getAbilityNames() {
        this.dataService.findAll('?include=roles&page[size]=100').subscribe({
            next: response => {
                const resp = response as PagedResponse<Permission>;
                const newPermissions = this.setPermissions(resp.data as any[]);
                this.abilityNames = this.formatAbilityName(newPermissions);
                // console.log(this.abilityNames);
            }
        });
    }

    private formatAbilityName(data: Permission[]): object[] {
        const tmp = data.map((datum: Permission) => {
            return split(datum.getRawName(), ' ', 2)[1];
        });

        const unique = uniq(tmp);

        return unique.map((value, index) => {
            return { name: startCase(value), code: value };
        });
    }

    private convertEventToQuery(event: LazyLoadEvent): string {
        let query = `?include=roles`;
        if (!isEmpty(event.filters)) {
            Object.entries(event.filters).forEach(val => {
                query += `&`;
                query += `filter[${val[0]}]=${val[1].value}`;
            });
        }

        if (event.sortField && event.sortOrder) {
            const order = event.sortOrder === 1 ? '' : '-';
            query += `&`;
            query += `sort=${order}${event.sortField}`;
        }

        if (event.rows) {
            query += `&`;
            query += `page[size]=${event.rows}`;

            if (event.first !== undefined) {
                const pageNumber = event.first / event.rows + 1;
                query += `&`;
                query += `page[number]=${pageNumber}`;
            }
        }

        return query;
    }
}
