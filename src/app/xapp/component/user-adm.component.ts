import { Organization } from './../domain/organization';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem, FilterMatchMode } from 'primeng/api';
import { MoreComponent } from './_more.component';
import { User } from '../domain/user';

@Component({
    templateUrl: './user-adm.component.html',
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
export class UserAdmComponent extends MoreComponent implements OnInit {
    datasPrint: User[] = [];
    datas: User[];
    data: User;
    selectedDatas: User[] = [];

    roleOptions: SelectItem[];
    isActiveOptions: SelectItem[];
    categoryOrgOptions: SelectItem[];
    organizationOptions: SelectItem[];
    organizationFilterOptions: SelectItem[] = [];

    isMandiri = false;

    pdfSrc: string;

    displayPdfViewer = false;

    matchModeOptions2: SelectItem[] = [{ label: 'Equals', value: FilterMatchMode.EQUALS }];

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
        this.createDataForm(new User());

        this.roleOptions = [];
        this.roleOptions.push({ label: '- Role? -', value: null });
        this.roleOptions.push({ label: 'Administrator', value: 2 });
        this.roleOptions.push({ label: 'PIC User', value: 3 });
        this.roleOptions.push({ label: 'User Station', value: 4 });

        this.isActiveOptions = [];
        this.isActiveOptions.push({ label: '- Active? -', value: null });
        this.isActiveOptions.push({ label: 'Active', value: 1 });
        this.isActiveOptions.push({ label: 'Not Active', value: 0 });

        this.categoryOrgOptions = [];
        this.categoryOrgOptions.push({ label: '- pilih kategori? -', value: null });
        this.categoryOrgOptions.push({ label: 'Instansi Pemerintah', value: Organization.CAT_PEMERINTAH });
        this.categoryOrgOptions.push({ label: 'BUMN', value: Organization.CAT_BUMN });
        this.categoryOrgOptions.push({ label: 'Perusahaan Swasta', value: Organization.CAT_SWASTA });
        this.categoryOrgOptions.push({ label: 'Universitas', value: Organization.CAT_UNIV });
        this.categoryOrgOptions.push({ label: 'Non Government Organization (NGO)', value: Organization.CAT_NGO });
        this.categoryOrgOptions.push({ label: 'Pengamatan Mandiri', value: Organization.CAT_MANDIRI });

        this._createDropdownList(
            'api/lists/organizations',
            new HttpParams(),
            'long_name',
            'id',
            '- pilih instansi -',
            this.organizationFilterOptions
        );

        //exportCsv purpose
        this.cols = [
            { field: 'id', header: 'Id' },
            { field: 'name', header: 'Name' },
            { field: 'phone.number', header: 'No HP' },
            { field: 'email', header: 'Email' },
            { field: 'email_organization', header: 'Email Institusi' },
            { field: 'organization.long_name', header: 'Institusi' },
            { field: 'role_str', header: 'Role' },
            { field: 'is_active', header: 'Is Active ?' }
        ];
    }

    loadDatas(event: LazyLoadEvent) {
        this._loadDatas('api/users', event);
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

    editData(data: User) {
        //this._editData('api/users', data);

        this.dialogForm = true;
        this.spinnerService.show();
        this.submitted = false;
        this.setSelectedDatas([]);
        this.newData = false;
        this.http.get(`${environment.app.apiUrl}/api/users/${data.id}`).subscribe({
            next: resp => {
                const user = resp as any;
                console.log('user:' + JSON.stringify(user));
                if (user.roles && user.roles.length) {
                    user.role_id_int = user.roles[0].id;
                }
                user.category_org = user.organization?.category;
                user.organization_id = user.organization?.id;
                if (user.document && user.document.length) {
                    this.pdfSrc = this._replaceMediaUrl(user.document[0].original_url);
                } else {
                    this.pdfSrc = '';
                }
                this.state$.next(true);
                if (user.organization?.category !== Organization.CAT_MANDIRI && user.organization_id !== null) {
                    user.category = User.CAT_ORGANIZATION;
                    this.isMandiri = false;
                    this.organizationOptions = [];
                    this.organizationOptions.push({ label: '- pilih instansi? -', value: null });
                    this.http
                        .get(`${environment.app.apiUrl}/api/lists/organizations`, {
                            params: new HttpParams().append('filter[category]', '' + user.category_org)
                        })
                        .subscribe({
                            next: institutions => {
                                console.log('institutions:' + JSON.stringify(data));
                                const dataOptions = institutions as any[];
                                dataOptions.forEach(dataOption => {
                                    this.organizationOptions.push({
                                        label: dataOption.long_name,
                                        value: dataOption.id
                                    });
                                });
                                this.createDataForm(user);
                                this.spinnerService.hide();
                                this.state$.next(true);
                            },
                            error: err => {
                                this._errorHandler(err);
                            }
                        });
                } else {
                    user.category = User.CAT_PERSONAL;
                    this.isMandiri = true;
                    this.createDataForm(user);
                    this.spinnerService.hide();
                    this.state$.next(true);
                }
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

    showPdfViewer() {
        this.displayPdfViewer = true;
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
        console.log('resp : ' + JSON.stringify(resp));
        this.generateStr(resp);
        return this._updateTableDisplay(datas, resp);
    }

    exportExcel() {
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/api/lists/users`).subscribe({
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
                        organization: data1.organization.long_name,
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
