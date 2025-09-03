import { split } from 'lodash';
import { environment } from 'src/environments/environment';
import { Station } from './../domain/station';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { MoreComponent } from './_more.component';

@Component({
    templateUrl: './wigos-id.component.html',
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
export class WigosIdComponent extends MoreComponent implements OnInit {
    datas: any[];
    data: any;
    selectedDatas: any[] = [];

    method: any;
    methodOptions: SelectItem[];

    //usageTypeId: number;
    //usageTypeOptions: SelectItem[] = [];
    usageTypeId: any;
    usageTypes: any[] = [];

    stationName: string;

    wigosIdLast: string | null;
    wigosIdLastNum: number;

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
        this.createDataForm(new Station());

        this.methodOptions = [];
        this.methodOptions.push({ label: '- Metode? -', value: null });
        this.methodOptions.push({ label: 'Manual', value: 'man' });
        this.methodOptions.push({ label: 'Otomatis', value: 'oto' });

        /*this._createDropdownList(
            'api/lists/types/usage-types',
            new HttpParams(),
            'name',
            'id',
            '- pilih usage type -',
            this.usageTypeOptions
        );*/

        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/api/lists/types/usage-types?filter[lang]=${this.lang}`).subscribe({
            next: datas => {
                const resp = datas as any[];
                /*this.usageTypes.push({
                    id: null,
                    notation: null,
                    name: '- pilih usage type -',
                    description: null,
                    code: null
                });*/
                resp.forEach(data => {
                    this.usageTypes.push(data);
                });
                console.log('this.usageTypes' + JSON.stringify(this.usageTypes));
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });

        //exportCsv purpose
        this.cols = [
            { field: 'id', header: 'Id' },
            { field: 'long_name', header: 'Long Name' },
            { field: 'short_name', header: 'Short Name' },
            { field: 'url', header: 'URL' },
            { field: 'country_id', header: 'Country' },
            { field: 'category', header: 'Category' },
            { field: 'is_oscar', header: 'Type' },
            { field: 'is_active', header: 'Is Active ?' }
        ];
    }

    loadDatas(event: LazyLoadEvent) {
        console.log('event: ' + JSON.stringify(event));
        //this._loadDatas('api/stations', event);

        let query = '';
        if (event) {
            query = this.convertEventToQuery(event);
        }
        this.searchStation(query);
    }

    searchStation(query: string) {
        this.spinnerService.show();
        let url = '';
        if (!this.usageTypeId) {
            url = `${environment.app.apiUrl}/api/stations/${query}`;
        } else {
            url = `${environment.app.apiUrl}/api/stations/${query}&filter[usage_type_id]=${this.usageTypeId}`;
        }
        this.http.get(url).subscribe({
            next: response => {
                console.log('resp: ' + JSON.stringify(response));
                const page = response as any;
                const datasNew = [];
                const datas1 = page.data as any[];
                //const _datas = <any[]>page;
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let index = 0; index < datas1.length; index++) {
                    const data1 = this.generateStr(datas1[index]);
                    if (data1.wigos_id) {
                        const wgosId = data1.wigos_id.split('-');
                        data1.wigos_id_1 = wgosId[0];
                        data1.wigos_id_2 = wgosId[1];
                        data1.wigos_id_3 = wgosId[2];
                        data1.wigos_id_4 = wgosId[3];
                    } else {
                        data1.wigos_id = null;
                        data1.wigos_id_1 = '0';
                        data1.wigos_id_2 = '360';
                        data1.wigos_id_3 = data1.usage_type_code;
                        data1.wigos_id_4 = null;
                    }
                    datasNew.push(data1);
                }
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

    onSelectUsageType() {
        if (this.usageTypeId) {
            this.spinnerService.show();
            this.http.get(`${environment.app.apiUrl}/api/wigos/usage-types/${this.usageTypeId}/latest`).subscribe({
                next: data => {
                    console.log('wigos-id:' + JSON.stringify(data));
                    const wigos = data as any;
                    this.wigosIdLast =
                        wigos.wigos_identifier +
                        '-' +
                        wigos.issuer_identifier +
                        '-' +
                        wigos.usage_type?.code +
                        '-' +
                        wigos.sequence;
                    const wgosId = this.wigosIdLast.split('-');
                    this.wigosIdLastNum = wigos.sequence;
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
            this.searchStation('?&sort=id&page[size]=10&page[number]=1');
        } else {
            this.wigosIdLast = null;
        }
    }

    generateStr(data: any): any {
        if (data.usage_type_id) {
            //this.usageTypeOptions.forEach(usageType)
            this.usageTypes.forEach(usageType => {
                if (data.usage_type_id === usageType.id) {
                    data.usage_type_name = usageType.name;
                    data.usage_type_code = usageType.code;
                }
            });
        }
        return data;
    }

    createDataForm(data: Station) {}

    addData() {
        this.dialogForm = true;
        this._addData();
    }

    editData(data: Station) {
        console.log('editData: ' + JSON.stringify(data));
        this._editData('api/stations', data);
    }

    save() {
        console.log('this.method: ' + this.method);
        console.log('this.selectedDatas: ' + this.selectedDatas);
        if (this.method === 'man' && this.selectedDatas.length > 0) {
            const selectedDatas1: any[] = [];

            let isError = false;

            this.selectedDatas.forEach(selectedData => {
                if (
                    !selectedData.wigos_id_1 ||
                    !selectedData.wigos_id_2 ||
                    !selectedData.wigos_id_3 ||
                    !selectedData.wigos_id_4
                ) {
                    isError = true;
                    return false;
                }

                selectedDatas1.push({
                    station_id: selectedData.id,
                    wigos: {
                        usage_type_id: selectedData.usage_type_id,
                        sequence: selectedData.wigos_id_4
                    }
                });
            });

            if (isError) {
                this._generateMsg('error', 'Error Message', 'There is any blank value in WIGOS ID');
            } else {
                console.log('save:' + JSON.stringify(selectedDatas1));
                this.saveToBackend(selectedDatas1);
            }
        } else if (this.method === 'oto' && this.selectedDatas.length > 0) {
            const selectedDatas1: any[] = [];

            this.selectedDatas.forEach(selectedData => {
                selectedDatas1.push({
                    station_id: selectedData.id,
                    wigos: {
                        usage_type_id: selectedData.usage_type_id,
                        sequence: ++this.wigosIdLastNum
                    }
                });
            });
            console.log('save:' + JSON.stringify(selectedDatas1));
            this.saveToBackend(selectedDatas1);
        } else {
            this._generateMsg('error', 'Error Message', 'There is no station chosed');
        }
    }

    saveToBackend(selectedDatas: any[]) {
        this.spinnerService.show();
        const datas = [...this.getDatas()];
        this.http.post(`${environment.app.apiUrl}/api/stations/wigos`, selectedDatas).subscribe({
            next: resp => {
                console.log('save resp: ' + JSON.stringify(resp));
                //this.setDatas(this.updateTableDisplay(datas, selectedDatas, resp));
                this.dialogForm = false;
                this._generateMsg('success', 'Successful', 'Data is saved successfully');
                this.onSelectUsageType();
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    delete() {
        const stationId: any[] = [];

        this.selectedDatas.forEach(selectedData => {
            stationId.push(selectedData.id);
        });

        const data = {
            stations: stationId
        };

        console.log('delete:' + JSON.stringify(data));

        this.spinnerService.show();
        const datas = [...this.getDatas()];
        this.http.post(`${environment.app.apiUrl}/api/stations/wigos/delete`, data).subscribe({
            next: resp => {
                console.log('delete resp: ' + JSON.stringify(resp));
                //this.setDatas(this.updateTableDisplay(datas, selectedDatas, resp));
                const newDatas: any[] = [];
                this.getDatas().forEach(data1 => {
                    this.selectedDatas.forEach(selectedData => {
                        if (data1.id === selectedData.id) {
                            console.log('delete: ' + data1.id);
                            data1.wigos_id = null;
                            data1.wigos_id_1 = '0';
                            data1.wigos_id_2 = '360';
                            data1.wigos_id_3 = data1.usage_type?.code;
                            data1.wigos_id_4 = null;
                        }
                    });
                    newDatas.push(data1);
                });
                this.setDatas(newDatas);
                console.log('this.datas: ' + JSON.stringify(this.datas));
                this.dialogForm = false;
                this._generateMsg('success', 'Successful', 'Data is saved successfully');
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    onRowEditInit(station: Station) {
        //this.editing = true;
    }

    onRowEditSave(station: Station) {
        //this.editing = false;
    }

    onRowEditCancel(station: Station, index: number) {
        //this.editing = false;
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
