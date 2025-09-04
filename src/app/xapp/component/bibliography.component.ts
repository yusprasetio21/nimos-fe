import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { MoreComponent } from './_more.component';

import { BibtexParser } from 'bibtex-js-parser';
import { Station } from '../domain/station';

class Document {
    id?: string;
    text?: string;
    bibtex?: string;
    author?: string;
    year?: string;
}

@Component({
    templateUrl: './bibliography.component.html',
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
export class BibliographyComponent extends MoreComponent implements OnInit {
    datas: any[] = [];
    data: any;
    selectedDatas: any[] = [];
    indexHelper = 0;
    display = false;
    isLoading = true;

    station: any;
    stations: any[];
    filteredStations: any[];

    station_id: any;
    station_name: any;
    station_identifier: any;
    station_wigos_id: any;

    disabled = true;

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
        this.isLoading = true;
        this.station_id = localStorage.getItem('station_id');
        this.station_name = localStorage.getItem('station_name');
        this.station_identifier = localStorage.getItem('station_identifier');
        this.station_wigos_id = localStorage.getItem('station_wigos_id');

        if (this.station_id) {
            this.spinnerService.show();
            this.http.get(`${environment.app.apiUrl}/api/stations/${this.station_id}/bibliographies`).subscribe({
                next: (response) => {
                    this.datas = response as any[];
                    this.datas.forEach(data => {
                        const bibJSON = BibtexParser.parseToJSON(data.bibtex);
                        data.text = this.convertToAPA(bibJSON[0]);
                    });
                    if (!this.datas) this.datas = [];
                    console.log('this.datas: ' + JSON.stringify(this.datas));
                    this.spinnerService.hide();
                    this.isLoading = false;
                    this.state$.next(true);
                },
                error: (err) => {
                    this.isLoading = false;
                    this._errorHandler(err);
                }
            });
        } else {
            this.isLoading = false;
            setTimeout(() => {
                this.router.navigate(['/my-stations']);
            }, 3000);
        }

        this.createDataForm(new Document());
    }

    generateStr(data: any): any {
        return data;
    }

    createDataForm(data: any) {
        if (data == null) data = new Document();
        this.dataForm = this.fb.group({
            id: new FormControl(data.id),
            text: new FormControl(data.text),
            bibtex: new FormControl(data.bibtex, Validators.required),
            author: new FormControl(data.author),
            year: new FormControl(data.year)
        });
    }

    addData() {
        this.dialogForm = true;
        this.submitted = false;
        this.newData = true;
        this.createDataForm(new Document());
    }

    editData(data: Document) {
        this.dialogForm = true;
        this.submitted = false;
        this.newData = false;
        this.createDataForm(data);
    }

    saveToList() {
        if (!this.dataForm.controls.id.value) {
            this.dataForm.patchValue({ id: '_' + this.indexHelper++ });
        }
        try {
            const bibJSON = BibtexParser.parseToJSON(this.dataForm.controls.bibtex.value);
            console.log(bibJSON);

            this.dataForm.patchValue({ text: this.convertToAPA(bibJSON[0]) });
            if (bibJSON[0]?.author) this.dataForm.patchValue({ author: bibJSON[0]?.author });
            if (bibJSON[0]?.year) this.dataForm.patchValue({ year: bibJSON[0]?.year });
            
            // Pastikan this.datas tidak null/undefined
            const currentDatas = this.datas || [];
            this.setDatas(this._updateTableDisplay(currentDatas, this.dataForm.value));
            
            this.dialogForm = false;
            this.display = false;
            this.disabled = false;
            this.createDataForm(new Document());
        } catch (error) {
            this._generateMsg('error', 'Error Message', error as string);
        }
    }

    convertToAPA(text: any): string {
        if (!text) return '';
        
        const author = text.author ? text.author + ', ' : '';
        const year = text.year ? '(' + text.year + '), ' : '';
        const title = text.title ? text.title + ', ' : '';
        const pages = text.pages ? text.pages + ', ' : '';
        const url = text.url ? text.url + ', ' : '';
        
        let result = author + year + title + pages + url;
        // Hapus koma di akhir jika ada
        if (result.endsWith(', ')) {
            result = result.slice(0, -2);
        }
        return result;
    }

    onFileChange(event: any) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            this.dataForm.patchValue({
                fileSource: file
            });
        }
    }

    deleteWithConfirm(data: any) {
        this.submitted = false;
        this.setSelectedDatas([]);
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.disabled = false;
                this.setDatas(this.getDatas().filter(val => val.id !== data.id));
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    deleteMoreWithConfirm() {
        // Implementasi jika diperlukan
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

    // Override atau tambahkan method _updateTableDisplay jika diperlukan
    _updateTableDisplay(datas: any[], newData: any): any[] {
        if (!datas) datas = [];
        
        const index = datas.findIndex(item => item.id === newData.id);
        if (index >= 0) {
            // Update existing item
            datas[index] = newData;
        } else {
            // Add new item
            datas.push(newData);
        }
        return datas;
    }

    showExample() {
        this.display = !this.display;
    }

    onSelect(event: any) {
        console.log('event: ' + JSON.stringify(event));
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/api/stations/${event.id}/bibliographies`).subscribe({
            next: (response) => {
                this.datas = response as any[];
                this.datas.forEach(data => {
                    const bibJSON = BibtexParser.parseToJSON(data.bibtex);
                    data.text = this.convertToAPA(bibJSON[0]);
                });
                if (!this.datas) this.datas = [];
                console.log('this.datas: ' + JSON.stringify(this.datas));
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: (err) => {
                this._errorHandler(err);
            }
        });
    }

    save() {
        this.spinnerService.show();
        this.datas.forEach(data => {
            this.changeValueInJson('id', null, data);
        });
        console.log('before save: ' + JSON.stringify(this.datas));
        this.http
            .post(`${environment.app.apiUrl}/api/stations/${this.station_id}/bibliographies`, {
                bibliographies: this.getDatas()
            })
            .subscribe({
                next: (response) => {
                    this.datas = response as any[];
                    if (!this.datas) this.datas = [];
                    this.datas.forEach(data => {
                        const bibJSON = BibtexParser.parseToJSON(data.bibtex);
                        data.text = this.convertToAPA(bibJSON[0]);
                    });
                    this._generateMsg('success', 'Successful', 'Data is saved successfully');
                    this.disabled = true;
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: (err) => {
                    this._errorHandler(err);
                }
            });
    }

    searchStationById(event: any) {
        this.spinnerService.show();
        this.http
            .get(`${environment.app.apiUrl}/api/lists/stations`, {
                params: new HttpParams().append('filter[station_code]', event.query)
            })
            .subscribe({
                next: (response) => {
                    console.log('stations: ' + JSON.stringify(response));
                    this.filteredStations = response as any[];
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: (err) => {
                    this._errorHandler(err);
                }
            });
    }

    searchStationByName(event: any) {
        this.spinnerService.show();
        this.http
            .get(`${environment.app.apiUrl}/api/lists/stations`, {
                params: new HttpParams().append('filter[name]', event.query)
            })
            .subscribe({
                next: (response) => {
                    console.log('stations: ' + JSON.stringify(response));
                    this.filteredStations = response as any[];
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: (err) => {
                    this._errorHandler(err);
                }
            });
    }

    // Helper method untuk mengubah nilai dalam JSON
    changeValueInJson(key: string, value: any, json: any) {
        if (json.hasOwnProperty(key)) {
            json[key] = value;
        }
    }
}