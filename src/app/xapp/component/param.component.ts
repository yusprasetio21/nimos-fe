import { environment } from 'src/environments/environment';
import { Param } from './../domain/param';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { MoreComponent } from './_more.component';

@Component({
    templateUrl: './param.component.html',
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
export class ParamComponent extends MoreComponent implements OnInit {
    datasPrint: Param[] = [];

    datas: any[];
    data: any;
    selectedDatas: Param[] = [];

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
        this.createDataForm(new Param());

        this.isActiveOptions = [];
        this.isActiveOptions.push({ label: '- Active? -', value: null });
        this.isActiveOptions.push({ label: 'Active', value: 1 });
        this.isActiveOptions.push({ label: 'Not Active', value: 0 });

        //exportCsv purpose
        this.cols = [
            { field: 'id', header: 'Id' },
            { field: 'variable_code', header: 'Variable Code' },
            { field: 'variable_name_en', header: 'Variable Name (En)' },
            { field: 'variable_name_id', header: 'Variable Name (Id)' },
            { field: 'variable_tooltip_en', header: 'Variable Tooltip (En)' },
            { field: 'variable_tooltip_id', header: 'Variable Tooltip (Id)' },
            { field: 'is_visible', header: 'Is Visible ?' },
            { field: 'is_basic', header: 'Is Basic ?' },
            { field: 'is_calculated', header: 'Is Calculated ?' },
            { field: 'is_geophysic', header: 'Is Geophysics' }
        ];
    }

    loadDatas(event: LazyLoadEvent) {
        console.log('event: ' + JSON.stringify(event));
        this._loadDatas('api/parameter-texts', event);
    }

    generateStr(data: any): any {
        if (0 === data.is_active) {
            data.is_active = 'Not Active';
        } else if (1 === data.is_active) {
            data.is_active = 'Active';
        }
        data.is_basic = data.is_basic ? 'Yes' : 'No';
        data.is_visible = data.is_visible ? 'Yes' : 'No';
        data.is_geophysic = data.is_geophysic ? 'Yes' : 'No';
        data.is_calculated = data.is_calculated ? 'Yes' : 'No';

        return data;
    }

    createDataForm(data: Param) {
        if (data == null) data = new Param();
        this.dataForm = this.fb.group({
            id: new FormControl(data.id),
            variable_code: new FormControl(data.variable_code, Validators.required),
            variable_name_en: new FormControl(data.variable_name_en, Validators.required),
            variable_name_id: new FormControl(data.variable_name_id),
            variable_tooltip_en: new FormControl(data.variable_tooltip_en, Validators.required),
            variable_tooltip_id: new FormControl(data.variable_tooltip_id),
            is_visible: new FormControl(data.is_visible ? data.is_visible : false),
            is_basic: new FormControl(data.is_basic ? data.is_basic : false),
            is_geophysic: new FormControl(data.is_geophysic ? data.is_geophysic : false),
            is_calculated: new FormControl(data.is_calculated ? data.is_calculated : false),
            classname: new FormControl(data.classname),
            column_name: new FormControl(data.column_name),
            module: new FormControl(data.module)
        });
    }

    addData() {
        this.dialogForm = true;
        this._addData();
    }

    editData(data: Param) {
        this.createDataForm(new Param());
        this.dialogForm = true;
        this.spinnerService.show();
        this.submitted = false;
        this.setSelectedDatas([]);
        this.newData = false;
        this.http.get(`${environment.app.apiUrl}/api/parameter-texts/${data.id}`).subscribe({
            next: resp => {
                const respAny = resp as any;
                const param: Param = new Param();
                param.id = respAny.id;
                param.variable_code = respAny.code;
                param.variable_name_en = respAny.name?.en;
                param.variable_name_id = respAny.name?.id;
                param.variable_tooltip_en = respAny.tooltip?.en;
                param.variable_tooltip_id = respAny.tooltip?.id;
                param.is_calculated = respAny.is_calculated;
                param.is_visible = respAny.is_visible;
                param.is_basic = respAny.is_basic;
                param.is_geophysic = respAny.is_geophysic;
                param.classname = respAny.classname;
                param.column_name = respAny.column_name;
                param.module = respAny.module;

                this.createDataForm(param);
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    save() {
        const data = {
            id: this.dataForm.controls.id.value,
            code: this.dataForm.controls.variable_code.value,
            name: {
                en: this.dataForm.controls.variable_name_en.value,
                id: this.dataForm.controls.variable_name_id.value
            },
            tooltip: {
                en: this.dataForm.controls.variable_tooltip_en.value,
                id: this.dataForm.controls.variable_tooltip_id.value
            },
            is_calculated: this.dataForm.controls.is_calculated.value,
            is_visible: this.dataForm.controls.is_visible.value,
            is_basic: this.dataForm.controls.is_basic.value,
            is_geophysic: this.dataForm.controls.is_geophysic.value,
            classname: this.dataForm.controls.classname.value,
            column_name: this.dataForm.controls.column_name.value,
            module: this.dataForm.controls.module.value
        };

        console.log('save: ' + JSON.stringify(data));
        if (this.dataForm.controls.id.value) {
            this._update('api/parameter-texts/' + this.dataForm.controls.id.value, data);
        } else {
            this._store('api/parameter-texts', data);
        }
    }

    deleteWithConfirm(data: any) {
        this._deleteWithConfirm('api/parameter-texts', data);

        this.submitted = false;
        this.setSelectedDatas([]);
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.code + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this._delete('api/parameter-texts', data);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    deleteMoreWithConfirm() {
        this._deleteMoreWithConfirm('api/parameter-texts');
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
        this.generateStr(resp);
        return this._updateTableDisplay(datas, resp);
    }

    exportExcel() {
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/api/lists/parameter-texts`).subscribe({
            next: response => {
                console.log('resp: ' + JSON.stringify(response));
                //const page = response as any;
                const datasNew: any[] = [];
                const datas1 = response as any[];
                datas1.forEach(data1 => {
                    let data = {
                        id: data1.id,
                        variable_code: data1.code,
                        variable_name_en: data1.name.en,
                        variable_name_id: data1.name.id,
                        variable_tooltip_en: data1.tooltip.en,
                        variable_tooltip_id: data1.tooltip.id,
                        is_visible: data1.is_visible,
                        is_basic: data1.is_basic,
                        is_geophysic: data1.is_geophysic,
                        is_calculated: data1.is_calculated,
                        classname: data1.classname,
                        column_name: data1.column_name,
                        module: data1.module
                    };
                    data = this.generateStr(data);
                    datasNew.push(data);
                });
                this.datasPrint = datasNew;
                //this.totalRecords = page.total as number;
                //this.rows = page.per_page;
                this.spinnerService.hide();
                this.state$.next(true);
                this._exportExcel(this.datasPrint, 'parameter-texts');
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }
}
