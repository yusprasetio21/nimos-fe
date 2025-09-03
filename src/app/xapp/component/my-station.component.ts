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
    templateUrl: './my-station.component.html',
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
export class MyStationComponent extends MoreComponent implements OnInit {
    userLocalStorageKey = `${environment.appVersion}-currentUser`;
    userId: number;
    role: string;

    datas: User[];
    data: User;
    selectedDatas: User[] = [];

    roleOptions: SelectItem[];
    isActiveOptions: SelectItem[];
    categoryOrgOptions: SelectItem[];
    organizationOptions: SelectItem[];

    isMandiri = false;

    pdfSrc: string;

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
        this._generateParam('add');
        this.createDataForm(new User());

        const lsValue = localStorage.getItem(this.userLocalStorageKey);
        if (lsValue) {
            const currentUser = JSON.parse(lsValue);
            this.userId = currentUser.id;
            this.role = currentUser.roles[0];
        }
        //exportCsv purpose
        this.cols = [
            { field: 'id', header: 'Id' },
            { field: 'name', header: 'Name' },
            { field: 'phone.number', header: 'No HP' },
            { field: 'email', header: 'Email' },
            { field: 'email_organization', header: 'Email Institusi' },
            { field: 'organization.long_name', header: 'Institusi' },
            { field: 'is_active', header: 'Is Active ?' }
        ];
    }

    loadDatas(event: LazyLoadEvent) {
        //this._loadDatas('api/stations', event);
        let query = '';
        if (event) {
            query = this.convertEventToQuery(event);
        }
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/api/stations${query}&filter[users.id]=${this.userId}`).subscribe({
            next: response => {
                console.log('resp: ' + JSON.stringify(response));
                const page = response as any;
                const datasNew: any[] = [];
                const datas1 = page.data as any[];
                //const _datas = <any[]>page;
                datas1.forEach(data1 => {
                    datasNew.push(this.generateStr(data1));
                });

                this.setDatas(datasNew);
                this.totalRecords = page.meta.total as number;
                this.rows = page.meta.per_page;
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
        return data;
    }

    createDataForm(data: User) {
        if (data == null) data = new User();
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
            category_org: new FormControl(data.category_org, Validators.required),
            organization: new FormControl(data.organization)
        });
    }

    onChangeRole() {
        this.dataForm.patchValue({ role_id: [this.dataForm.controls.role_id_int.value] });
        console.log('>>' + JSON.stringify(this.dataForm.value));
    }

    onChangeCategoryOrg() {
        this.spinnerService.show();
        this.organizationOptions = [];

        if (this.dataForm.controls.category_org.value !== Organization.CAT_MANDIRI) {
            this.isMandiri = false;
            this.dataForm.patchValue({ category: User.CAT_ORGANIZATION });
            this._createDropdownList(
                'api/lists/organizations',
                new HttpParams().append('filter[category]', this.dataForm.controls.category_org.value),
                'long_name',
                'id',
                '- pilih instansi -',
                this.organizationOptions
            );
        } else {
            this.isMandiri = true;
            this.dataForm.patchValue({ category: User.CAT_PERSONAL });
            this.dataForm.patchValue({ institution_email: null, institution_id: null });
            this.spinnerService.hide();
        }
        console.log('>>>>' + JSON.stringify(this.dataForm.value));
    }

    addData() {
        this.isMandiri = false;
        this._addData();
    }

    addDataStation() {
        this.router.navigate(['/station-news']);
    }

    editData(data: any) {
        console.log('>>>>' + JSON.stringify(data));
        this.router.navigate(['/station-edits', data.id]);
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
        this._deleteWithConfirm('api/stations', data);
    }

    deleteMoreWithConfirm() {
        this._deleteMoreWithConfirm('api/stations');
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
}
