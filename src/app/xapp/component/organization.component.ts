import { environment } from 'src/environments/environment';
import { Organization } from './../domain/organization';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { MoreComponent } from './_more.component';
@Component({
    templateUrl: './organization.component.html',
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
export class OrganizationComponent extends MoreComponent implements OnInit {
    datasPrint: Organization[] = [];
    datas: Organization[];
    data: Organization;
    selectedDatas: Organization[] = [];

    isActiveOptions: SelectItem[];
    categoryOptions: SelectItem[];
    countryOptions: SelectItem[];

    typeOptions: SelectItem[];

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
        this.createDataForm(new Organization());

        this.isActiveOptions = [];
        this.isActiveOptions.push({ label: '- Active? -', value: null });
        this.isActiveOptions.push({ label: 'Active', value: true });
        this.isActiveOptions.push({ label: 'Not Active', value: false });

        this.categoryOptions = [];
        this.categoryOptions.push({ label: '- Category? -', value: null });
        this.categoryOptions.push({ label: 'Instansi Pemerintah', value: 1 });
        this.categoryOptions.push({ label: 'BUMN', value: 2 });
        this.categoryOptions.push({ label: 'Perusahaan Swasta', value: 3 });
        this.categoryOptions.push({ label: 'Universitas', value: 4 });
        this.categoryOptions.push({ label: 'Non Government Organization (NGO)', value: 5 });
        // this.kategoriOptions.push({label:'Pengamatan Mandiri', value:6});

        this.countryOptions = [];
        this.countryOptions.push({ label: '- Country? -', value: null });
        this.countryOptions.push({ label: 'Indonesia', value: 1 });

        this.countryOptions = [];
        this.countryOptions.push({ label: '- Country? -', value: null });
        this.countryOptions.push({ label: 'Indonesia', value: 100 });

        this.typeOptions = [];
        this.typeOptions.push({ label: '- Type? -', value: null });
        this.typeOptions.push({ label: 'Oscar Supervising organization', value: true });
        this.typeOptions.push({ label: 'Local Supervising organization', value: false }); //internal

        //exportCsv purpose
        this.cols = [
            { field: 'id', header: 'Id' },
            { field: 'long_name', header: 'Long Name' },
            { field: 'short_name', header: 'Short Name' },
            { field: 'url', header: 'URL' },
            { field: 'country_id', header: 'Country' },
            { field: 'category', header: 'Category' },
            { field: 'is_oscar', header: 'Type' },
            { field: 'is_active', header: 'Status' }
        ];
    }

    loadDatas(event: LazyLoadEvent) {
        console.log('event: ' + JSON.stringify(event));
        this._loadDatas('api/organizations', event);
    }

    generateStr(data: any): any {
        if (data.is_active) {
            data.is_active = 'Active';
        } else {
            data.is_active = 'Not Active';
        }
        if (100 === data.country_id) {
            data.country_id = 'Indonesia';
        }
        if (true === data.is_oscar) {
            data.is_oscar = 'Oscar Supervising organization';
        } else {
            data.is_oscar = 'Local Supervising organization';
        }
        if (Organization.CAT_PEMERINTAH === data.category) {
            data.category = 'Instansi Pemerintah';
        } else if (Organization.CAT_BUMN === data.category) {
            data.category = 'BUMN';
        } else if (Organization.CAT_SWASTA === data.category) {
            data.category = 'Perusahaan Swasta';
        } else if (Organization.CAT_UNIV === data.category) {
            data.category = 'Universitas';
        } else if (Organization.CAT_NGO === data.category) {
            data.category = 'Non Government Organization (NGO)';
        }

        return data;
    }

    createDataForm(data: Organization) {
        if (data == null) data = new Organization();
        this.dataForm = this.fb.group({
            id: new FormControl(data.id),
            long_name: new FormControl(data.long_name, Validators.required),
            short_name: new FormControl(data.short_name),
            url: new FormControl(data.url),
            category: new FormControl(data.category, Validators.required),
            country_id: new FormControl(data.country_id, Validators.required),
            is_active: new FormControl(data.is_active, Validators.required),
            is_oscar: new FormControl(data.is_oscar, Validators.required)
        });
    }

    addData() {
        this.dialogForm = true;
        this._addData();
    }

    editData(data: Organization) {
        console.log('editData: ' + JSON.stringify(data));
        this._editData('api/organizations', data);
    }

    save() {
        const data = JSON.stringify(this.dataForm.value);
        console.log('save: ' + data);
        if (this.dataForm.controls.id.value) {
            this._update('api/organizations/' + this.dataForm.controls.id.value, data);
        } else {
            this._store('api/organizations', data);
        }
    }

    updateTableDisplay(datas: any[], req: any, resp: any) {
        //console.log('resp : ' + JSON.stringify(resp));
        this.generateStr(resp);
        return this._updateTableDisplay(datas, resp);
    }

    deleteWithConfirm(data: any) {
        this._deleteWithConfirm('api/organizations', data);
        this.submitted = false;
        this.setSelectedDatas([]);
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.long_name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this._delete('api/organizations', data);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    deleteMoreWithConfirm() {
        this._deleteMoreWithConfirm('api/organizations');
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

    exportExcel() {
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/api/lists/organizations`).subscribe({
            next: response => {
                console.log('resp: ' + JSON.stringify(response));
                //const page = response as any;
                const datasNew: any[] = [];
                const datas1 = response as any[];
                datas1.forEach(data1 => {
                    let data = {
                        id: data1.id,
                        long_name: data1.long_name,
                        short_name: data1.short_name,
                        url: data1.url,
                        country_id: data1.country_id,
                        category: data1.category,
                        is_active: data1.is_active
                    };
                    data = this.generateStr(data);
                    datasNew.push(data);
                });
                this.datasPrint = datasNew;
                //this.totalRecords = page.total as number;
                //this.rows = page.per_page;
                this.spinnerService.hide();
                this.state$.next(true);
                this._exportExcel(this.datasPrint, 'organizations');
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }
}
