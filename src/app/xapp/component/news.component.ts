import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { MoreComponent } from './_more.component';
import { News } from '../domain/news';

@Component({
    templateUrl: './news.component.html',
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
export class NewsComponent extends MoreComponent implements OnInit {
    datasPrint: News[] = [];
    datas: News[];
    data: News;
    selectedDatas: News[] = [];

    isActiveOptions: SelectItem[];

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
        this.createDataForm(new News());

        this.isActiveOptions = [];
        this.isActiveOptions.push({ label: '- Active? -', value: null });
        this.isActiveOptions.push({ label: 'Active', value: true });
        this.isActiveOptions.push({ label: 'Not Active', value: false });

        //exportCsv purpose
        this.cols = [
            { field: 'id', header: 'Id' },
            { field: 'title', header: 'Title' },
            { field: 'news', header: 'News' },
            { field: 'is_active', header: 'Is Active ?' }
        ];
    }

    loadDatas(event: LazyLoadEvent) {
        console.log('event: ' + JSON.stringify(event));
        this._loadDatas('api/news', event);
    }

    generateStr(data: any): any {
        if (data.is_active) {
            data.is_active = 'Active';
        } else {
            data.is_active = 'Deleted';
        }
        return data;
    }

    createDataForm(data: News) {
        if (data == null) data = new News();
        this.dataForm = this.fb.group({
            id: new FormControl(data.id),
            title: new FormControl(data.title, Validators.required),
            news: new FormControl(data.news),
            is_active: new FormControl(data.is_active, Validators.required)
        });
    }

    addData() {
        this.dialogForm = true;
        this._addData();
    }

    editData(data: News) {
        console.log('editData: ' + JSON.stringify(data));
        this._editData('api/news', data);
    }

    save() {
        const data = JSON.stringify(this.dataForm.value);
        console.log('save: ' + data);
        if (this.dataForm.controls.id.value) {
            this._update('api/news/' + this.dataForm.controls.id.value, data);
        } else {
            this._store('api/news', data);
        }
    }

    deleteWithConfirm(data: any) {
        this._deleteWithConfirm('api/newss', data);
        this.submitted = false;
        this.setSelectedDatas([]);
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.long_name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this._delete('api/news', data);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    deleteMoreWithConfirm() {
        this._deleteMoreWithConfirm('api/news');
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
        this.http.get(`${environment.app.apiUrl}/api/lists/news`).subscribe({
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
                this._exportExcel(this.datasPrint, 'newss');
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }
}
