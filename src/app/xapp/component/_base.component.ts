/* eslint-disable @typescript-eslint/prefer-for-of */
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FilterMatchMode, LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { Error } from '../domain/error';

import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
export abstract class BaseComponent {
    /**
     * this.router.navigate tidak perlu diakhiri this.loading=false
     * this. _errorHandler tidak perlu diakhiri this.loading=false
     * function ngOnInit tidak perlu diawali this._init tapi perlu diakhiri this.loading=false
     * semua function yg request ke server harus diawal this._init() dan diakhiri this.loading=false
     *
     */
    public submitted: boolean;

    public totalRecords: number;
    public rows: number;

    public newData: boolean;

    public cols: any[];

    public datePipe: DatePipe = new DatePipe(navigator.language);

    public label: any = {};
    public tooltip: any = {};
    public param: any = {};
    public lang = 'en';

    protected matchModeOptions: SelectItem[] = [
        { label: 'Equals', value: FilterMatchMode.EQUALS },
        { label: 'Contains', value: FilterMatchMode.CONTAINS },
        { label: 'Starts With', value: FilterMatchMode.STARTS_WITH },
        { label: 'Ends With', value: FilterMatchMode.ENDS_WITH }
    ];

    constructor(
        protected router: Router,
        protected messageService: MessageService,
        protected spinnerService: NgxSpinnerService
    ) {
        const label = localStorage.getItem('label');
        if (label) {
            this.label = JSON.parse(label);
        }
        const lang = localStorage.getItem('language');
        if (lang) {
            this.lang = lang;
        }
        const tooltip = localStorage.getItem('tooltip');
        if (tooltip) {
            this.tooltip = JSON.parse(tooltip);
        }
        const param = localStorage.getItem('param');
        if (param) {
            this.param = JSON.parse(param);
        }
    }

    protected _generateMsg(severity: string, summary: string, detail: string) {
        //this.spinnerService.show();
        this.messageService.add({ severity, summary, detail, life: 3000 });
    }

    protected _generateMsgs(severity: string, summary: string, errors: Error[]) {
        this.spinnerService.show();
        for (let index = 0; index < errors.length; index++) {
            console.log('key: ' + errors[index].key);
            console.log('value: ' + errors[index].value);
            this.messageService.add({
                severity,
                summary,
                detail: `[${errors[index].key}] ${errors[index].value}`,
                life: 3000
            });
        }
    }

    protected _errorHandler(errResp: HttpErrorResponse) {
        //console.log(JSON.stringify(errResp));

        this._printError(errResp);

        if (0 === errResp.status || 401 === errResp.status || 403 === errResp.status || 500 === errResp.status) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: errResp.statusText + '-' + errResp.error.message,
                life: 3000
            });
        } else if (422 === errResp.status || 400 === errResp.status) {
            this._generateMsgs('error', 'Error Message', errResp.error.errors);
        }

        if (401 === errResp.status) {
            this.spinnerService.hide();
            setTimeout(() => {
                this.router.navigate(['/auth/logout'], { queryParams: { returnUrl: this.router.url } });
            }, 2000);
        }

        this.spinnerService.hide();
    }

    protected _printError(errResp: HttpErrorResponse) {
        const keys = errResp.headers.keys();
        keys.forEach(element => {
            console.error('errResp headers ' + element + ': ' + errResp.headers.get(element));
        });
        console.error('errResp status: ' + errResp.status);
        console.error('errResp statusText: ' + errResp.statusText);
        console.error('errResp message: ' + errResp.message);
        console.error('errResp error.message: ' + errResp.error.message);
        console.error('errResp error.exeption: ' + errResp.error.exeption);
    }

    protected _updateTableDisplay(datas: any[], resp: any) {
        if (this.newData) {
            datas.unshift(resp);
            this.totalRecords += 1;
        } else {
            let index = -1;
            for (let i = 0; i < datas.length; i++) {
                if (datas[i].id === resp.id) {
                    index = i;
                    break;
                }
            }
            datas[index] = resp;
        }
        return datas;
    }

    /*protected getIdsToDelete(datas: any[]) {
        let ids = '';
        datas.forEach(data => {
            ids += data.id + ',';
        });
        return ids.substring(0, ids.length - 1);
    }*/
    protected getIdsToDelete(datas: any[]) {
        const ids: string[] = [];
        datas.forEach(data => {
            ids.push(data.id);
        });
        return { data: ids };
    }

    /*
    type="text" tapi numeric only, misal: 00231
    karena yg seperti ini tidak bisa menggunakan p-inputNumber
    sedangkan kalau menggunakan type="number" bisa ada karakter "e"
    */
    textNumeric(event: any): boolean {
        const charCode = event.which ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    changeValueInJson(id: string, value: string | null, obj: object): void {
        for (const [k, v] of Object.entries(obj)) {
            if (k === id) {
                if (isNaN(Number((obj as any)[k]))) {
                    (obj as any)[k] = value;
                }
            } else if (v && typeof v === 'object') {
                this.changeValueInJson(id, value, v);
            } else {
                //nop
            }
        }
    }

    deleteKeyInJson(id: string, obj: object): void {
        for (const [k, v] of Object.entries(obj)) {
            if (k === id) {
                if (isNaN(Number((obj as any)[k]))) {
                    delete (obj as any)[k];
                }
            } else if (v && typeof v === 'object') {
                this.deleteKeyInJson(id, v);
            } else {
                //nop
            }
        }
    }

    changeDateFormatInJson(nameField: string, obj: object): void {
        const regex1 = /^\d{2}-\d{2}-\d{4}$/;
        const regex2 = /^\d{4}-\d{2}-\d{2}$/;
        for (const [k, v] of Object.entries(obj)) {
            if (k === nameField) {
                if ((obj as any)[k] != null && (obj as any)[k] !== undefined) {
                    if ((obj as any)[k].match(regex1) !== null || (obj as any)[k].match(regex2) !== null) {
                        (obj as any)[k] = new Date((obj as any)[k]);
                    }
                }
            } else if (v && typeof v === 'object') {
                this.changeDateFormatInJson(nameField, v);
            } else {
                //nop
            }
        }
    }

    renameNameJSON(oldName: string, newName: string, obj: object): void {
        for (const [k, v] of Object.entries(obj)) {
            if (k === oldName) {
                if ((obj as any)[oldName] != null && (obj as any)[oldName] !== undefined) {
                    (obj as any)[newName] = (obj as any)[k];
                    delete (obj as any)[k];
                }
            } else if (v && typeof v === 'object') {
                this.renameNameJSON(oldName, newName, v);
            } else {
                //nop
            }
        }
    }

    removeValueJSON(id: string, value: string | null, obj: object): void {
        for (const [k, v] of Object.entries(obj)) {
            if (k === id) {
                if (isNaN(Number((obj as any)[k]))) {
                    delete (obj as any)[k];
                }
            } else if (v && typeof v === 'object') {
                this.removeValueJSON(id, value, v);
            }
        }
    }

    removeValueIsNull(obj: object): void {
        for (const [k, v] of Object.entries(obj)) {
            if ((obj as any)[k] == null && k !== 'to') {
                delete (obj as any)[k];
            } else if (v && typeof v === 'object') {
                this.removeValueIsNull(v);
            } else {
                //nop
            }
        }
    }

    splitTime(StartMinute: number) {
        const Weeks = Math.floor(StartMinute / 10080);
        const RemainderWeek = StartMinute % 10080;
        const MinuteOfWeek = Math.floor(RemainderWeek);
        // var minute=Math.floor(RemainderWeek);

        const Days = Math.floor(MinuteOfWeek / 1440);
        const RemainderDay = MinuteOfWeek % 1440;
        const MinuteOfDay = Math.floor(RemainderDay);

        const Hours = Math.floor(MinuteOfDay / 60);
        const RemainderMinute = MinuteOfDay % 60;
        const MinuteOfHour = Math.floor(RemainderMinute);

        // var Minutes=Math.floor(60*(Remainder-Hours));
        // console.log(JSON.stringify({"Weeks":Weeks,"Days":Days,"Hours":Hours,"Minutes":MinuteOfHour}));
        return { Weeks, Days, Hours, Minutes: MinuteOfHour };
    }

    urlRegEx = '[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}(.[a-z]{2,4})?\b(/[-a-zA-Z0-9@:%_+.~#?&//=]*)?';
    regex =
        '^((http|https|ftp|www)://)[-a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)$';
    URL_REGEXP =
        "/^((http|https|ftp|www)://)?([a-zA-Z0-9~!@#$%^&*()_-=+\\/?.:;',]*)(.)([a-zA-Z0-9~!@#$%^&*()_-=+\\/?.:;',]+)/g";
    public isValidUrl(urlString: string): boolean {
        try {
            const pattern = new RegExp(this.regex);
            const valid = pattern.test(urlString);
            return valid;
        } catch (TypeError) {
            return false;
        }
    }

    _replaceMediaUrl(url: string) {
        if (url) {
            let newUrl = _.replace(url, 'nimos-api', 'nimos');
            newUrl = _.replace(newUrl, '192.168.15.227', '192.168.15.158'); //kebutuhan promote awal
            newUrl = _.replace(newUrl, 'api/storage', 'local');
            newUrl = _.replace(newUrl, 'storage', 'local');
            return newUrl;
        }
        return url;
    }

    _formatYMDtoDMY(from: any) {
        return from ? from.substring(8, 10) + '-' + from.substring(5, 7) + '-' + from.substring(0, 4) : from;
    }

    _formatDMYtoYMD(from: any) {
        return from ? from.substring(6, 10) + '-' + from.substring(3, 5) + '-' + from.substring(0, 2) : from;
    }
}
