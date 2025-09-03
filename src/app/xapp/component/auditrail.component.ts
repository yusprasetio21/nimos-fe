import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { MoreComponent } from './_more.component';
@Component({
    templateUrl: './auditrail.component.html',
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
export class AuditrailComponent extends MoreComponent implements OnInit {
    datasPrint: any[] = [];
    datas: any[];
    data: any;
    selectedDatas: any[] = [];

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

    showData(data: any) {
        this.dialogForm = true;
        this.data = data;
    }

    loadDatas(event: LazyLoadEvent) {
        let query = '';
        if (event) {
            query = this.convertEventToQuery(event);
        }
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/api/audit${query}`).subscribe({
            next: response => {
                console.log('resp: ' + JSON.stringify(response));
                const page = response as any;
                const datasNew: any[] = [];
                const datas = page.data as any[];
                datas.forEach(data0 => {
                    data0.old_values = data0.old_values ? JSON.stringify(data0.old_values) : data0.old_values;
                    data0.new_values = data0.new_values ? JSON.stringify(data0.new_values) : data0.new_values;
                    if (data0.auditable_type === 'App\\Domains\\Auth\\Models\\User\\User') {
                        data0.auditable_type = 'User';
                    } else if (data0.auditable_type === 'App\\Domains\\Station\\Models\\Station\\Station') {
                        data0.auditable_type = 'Station';
                    }
                    datasNew.push(data0);
                });
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
        return data;
    }

    updateTableDisplay(datas: any[], req: any, resp: any) {
        //console.log('resp : ' + JSON.stringify(resp));
        this.generateStr(resp);
        return this._updateTableDisplay(datas, resp);
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

    protected createDataForm(data: any) {
        throw new Error('Method not implemented.');
    }
}
