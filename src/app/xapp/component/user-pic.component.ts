import { Organization } from './../domain/organization';
import { ChartsWidget8Component } from './../partials/content/widgets/charts/charts-widget8/charts-widget8.component';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { MoreComponent } from './_more.component';
import { User } from '../domain/user';

@Component({
    templateUrl: './user-pic.component.html',
    styleUrls: ['../scss/tabledemo.scss'],
    styles: [
        `
            @media screen and (max-width: 960px) {
                :host
                    ::ng-deep
                    .p-datatable.p-datatable-customers.rowexpand-table
                    .p-datatable-tbody
                    > tr
                    > td:nth-child(6) {
                    display: flex;
                }
            }
        `
    ]
})
export class UserPicComponent extends MoreComponent implements OnInit {
    datasPrint: User[] = [];
    datas: User[];
    data: User;
    selectedDatas: User[] = [];

    roleOptions: SelectItem[];
    isActiveOptions: SelectItem[];

    isMandiri = false;

    organization_id: number;

    userLocalStorageKey = `${environment.appVersion}-currentUser`;

    constructor(
        private fb: FormBuilder,
        //more
        confirmationService: ConfirmationService,
        http: HttpClient,
        //base
        router: Router,
        messageService: MessageService,
        spinnerService: NgxSpinnerService
    ) {
        super(confirmationService, http, router, messageService, spinnerService);
    }

    ngOnInit() {
        const lsValue = localStorage.getItem(this.userLocalStorageKey);
        if (lsValue) {
            const currentUser = JSON.parse(lsValue);
            this.organization_id = currentUser.organization.id;
            console.log('this.organization_id' + this.organization_id);
        }

        //console.log('currentUser ID 1: ' + currentUser);
        //console.log('currentUser ID 2: ' + currentUser.id);
        //console.log('currentUser ID 3: ' + currentUser.organization);

        this.createDataForm(new User());

        this.roleOptions = [];
        this.roleOptions.push({ label: '- Role? -', value: null });
        this.roleOptions.push({ label: 'User Station', value: 4 });

        this.isActiveOptions = [];
        this.isActiveOptions.push({ label: '- Active? -', value: null });
        this.isActiveOptions.push({ label: 'Active', value: 1 });
        this.isActiveOptions.push({ label: 'Not Active', value: 0 });

        //category=sesuai parent
        //category_org=sesuai parent
        //organization_id=sesuaiparent

        //exportCsv purpose
        this.cols = [
            { field: 'id', header: 'Id' },
            { field: 'name', header: 'Name' },
            { field: 'email', header: 'Email' },
            { field: 'isActive', header: 'Is Active ?' }
        ];
    }

    loadDatas(event: LazyLoadEvent) {
        let query = '';
        if (event) {
            query = this.convertEventToQuery(event);
        }

        query += '&filter[organization.id]=' + this.organization_id;

        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/api/users${query}&filter[roles.id]=4`).subscribe({
            next: response => {
                console.log('resp: ' + JSON.stringify(response));
                const page = response as any;
                const datasNew = [];
                const datas = page.data as any[];
                //const _datas = <any[]>page;
                for (let data of datas) {
                    data = this.generateStr(data);
                    datasNew.push(data);
                }

                this.setDatas(datasNew);
                this.totalRecords = page.total as number;
                this.rows = page.per_page;
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    generateStr(data: any): any {
        if (0 === data.is_active) {
            data.is_active = 'Not Active';
        } else if (1 === data.is_active) {
            data.is_active = 'Active';
        } else if (2 === data.is_active) {
            data.is_active = 'Deleted';
        }

        if ('admin' === data.roles[0]?.name) {
            data.role_str = 'Administrator';
        } else if ('station' === data.roles[0]?.name) {
            data.role_str = 'User Station';
        } else if ('pic' === data.roles[0]?.name) {
            data.role_str = 'PIC User';
        } else if ('superadmin' === data.roles[0]?.name) {
            data.role_str = 'Superadmin';
        }
        return data;
    }

    createDataForm(data: User) {
        if (data == null) {
            data = new User();
            data.category = 1;
            data.organization_id = this.organization_id;
        }
        this.dataForm = this.fb.group({
            id: new FormControl(data.id),
            name: new FormControl(data.name, Validators.required),
            phone: new FormControl(data.phone, Validators.required),
            email: new FormControl(data.email, [Validators.required, Validators.email]),
            email_organization: new FormControl(data.email_organization, Validators.email),
            category: new FormControl(data.category),
            organization_id: new FormControl(data.organization_id),
            is_active: new FormControl(data.is_active, Validators.required),
            role_id_int: new FormControl(data.role_id_int),
            role_id: new FormControl(data.role_id),
            roles: new FormControl(data.roles),
            organization: new FormControl(data.organization)
        });
    }

    onChangeRole() {
        this.dataForm.patchValue({ role_id: [this.dataForm.controls.role_id_int.value] });
        console.log('>>' + JSON.stringify(this.dataForm.value));
    }

    addData() {
        this.isMandiri = false;
        this._addData();
    }

    editData(data: User) {
        //this._editData('api/users', data);

        this.dialogForm = true;
        this.spinnerService.show();
        this.submitted = false;
        this.setSelectedDatas([]);
        this.newData = false;
        this.http.get(`${environment.app.apiUrl}/api/users/${data.id}`).subscribe({
            next: resp => {
                const user = resp as User;
                if (user.roles && user.roles.length) {
                    user.role_id_int = user.roles[0].id;
                }
                user.category_org = user.organization?.category;
                user.organization_id = user.organization?.id;
                this.isMandiri = user.category ? false : true;
                this.createDataForm(user);
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    save() {
        const data = JSON.stringify(this.dataForm.value);
        if (this.dataForm.controls.id.value) {
            this._update('api/users/' + this.dataForm.controls.id.value, data);
        } else {
            this._store('api/users', data);
        }
    }

    deleteWithConfirm(data: any) {
        this._deleteWithConfirm('api/users', data);
    }

    deleteMoreWithConfirm() {
        this._deleteMoreWithConfirm('api/users');
    }

    getSelectedDatas() {
        return this.selectedDatas;
    }

    setSelectedDatas(selectedDatas: any[]) {
        this.selectedDatas = selectedDatas;
    }

    getDatas() {
        return this.datas;
    }

    setDatas(datas: any[]) {
        this.datas = datas;
    }

    updateTableDisplay(datas: any[], req: any, resp: any) {
        return this._updateTableDisplay(datas, resp);
    }

    exportExcel() {
        this.spinnerService.show();
        this.http
            .get(`${environment.app.apiUrl}/api/lists/users?filter[organization.id]=${this.organization_id}`)
            .subscribe({
                next: response => {
                    console.log('resp: ' + JSON.stringify(response));
                    //const page = response as any;
                    const datasNew: any[] = [];
                    const datas1 = response as any[];
                    datas1.forEach(data1 => {
                        data1 = this.generateStr(data1);
                        const data = {
                            id: data1.id,
                            name: data1.name,
                            phone_number: data1.phone.number,
                            email: data1.email,
                            email_organization: data1.email_organization,
                            role_str: data1.role_str,
                            is_active: data1.is_active
                        };
                        datasNew.push(data);
                    });
                    this.datasPrint = datasNew;
                    //this.totalRecords = page.total as number;
                    //this.rows = page.per_page;
                    this.spinnerService.hide();
                    this.state$.next(true);
                    this._exportExcel(this.datasPrint, 'list_users');
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
    }
}
