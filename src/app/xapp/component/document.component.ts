import { environment } from 'src/environments/environment';
import { Document } from './../domain/document';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { MoreComponent } from './_more.component';
import { Station } from '../domain/station';

@Component({
    templateUrl: './document.component.html',
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
export class DocumentComponent extends MoreComponent implements OnInit {
    datas: any[] = [];
    data: any;
    selectedDatas: any[] = [];
    indexHelper = 0;

    station: any;
    stations: any[];
    filteredStations: any[];

    station_id: any;
    station_name: any;
    station_identifier: any;
    station_wigos_id: any;

    disabled = true;

    displayPdfViewer = false;
    pdfSrc = '';

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
        this.station_id = localStorage.getItem('station_id');
        this.station_name = localStorage.getItem('station_name');
        this.station_identifier = localStorage.getItem('station_identifier');
        this.station_wigos_id = localStorage.getItem('station_wigos_id');

        this.test();
        this.createDataForm(new Document());
        if (this.station_id) {
            this.spinnerService.show();
            this.http.get(`${environment.app.apiUrl}/api/stations/${this.station_id}/documents`).subscribe({
                next: response => {
                    console.log('response: ' + JSON.stringify(response));
                    const medias = response as any[];
                    this.datas = [];
                    medias.forEach(media => {
                        const data = {
                            id: media.id,
                            title: media.custom_properties.title,
                            author: media.custom_properties.author,
                            description: media.custom_properties.description,
                            date: new Date(media.custom_properties.date),
                            original_url: media.original_url
                        };
                        this.datas.push(data);
                    });

                    console.log('this.datas: ' + JSON.stringify(this.datas));
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
        } else {
            setTimeout(() => {
                this.router.navigate(['/my-stations']);
            }, 3000);
        }
    }

    generateStr(data: any): any {
        return data;
    }

    createDataForm(data: Document) {
        if (data == null) data = new Document();
        if (this.newData) {
            this.dataForm = this.fb.group({
                id: new FormControl(data.id),
                document: new FormControl('', Validators.required),
                title: new FormControl(data.title, Validators.required),
                author: new FormControl(data.author),
                description: new FormControl(data.description),
                date: new FormControl(data.date),
                fileSource: new FormControl('')
            });
        } else {
            this.dataForm = this.fb.group({
                id: new FormControl(data.id),
                document: new FormControl(''),
                title: new FormControl(data.title, Validators.required),
                author: new FormControl(data.author),
                description: new FormControl(data.description),
                date: new FormControl(data.date),
                fileSource: new FormControl('')
            });
        }
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
        if (data.original_url) {
            this.pdfSrc = this._replaceMediaUrl(data.original_url);
        }
        this.createDataForm(data);
    }

    saveToList() {
        if (!this.dataForm.controls.id.value) {
            this.dataForm.patchValue({ id: '_' + this.indexHelper++ });
        }
        this.dataForm.patchValue({ date: Date.parse(this.dataForm.controls.date.value) });
        console.log('this.dataForm.value:' + JSON.stringify(this.dataForm.value));
        this.setDatas(this._updateTableDisplay(this.datas, this.dataForm.value));
        this.dialogForm = false;
        this.disabled = false;
        this.createDataForm(new Document());
    }

    save() {
        this.spinnerService.show();
        this.datas.forEach(data => {
            this.changeValueInJson('id', null, data);
        });
        console.log('datas: ' + JSON.stringify(this.datas));
        const formData = new FormData();
        console.log('length: ' + this.datas.length);
        for (let i = 0; i < this.datas.length; i++) {
            console.log('this.datas[i].id: ' + this.datas[i].id);
            if (this.datas[i].id) {
                //formData.append('documents[' + i + '][document]', '');
                formData.append('documents[' + i + '][id]', this.datas[i].id);
            } else {
                formData.append('documents[' + i + '][document]', this.datas[i].fileSource);
            }
            formData.append('documents[' + i + '][title]', this.datas[i].title);
            formData.append('documents[' + i + '][author]', this.datas[i].author);
            formData.append('documents[' + i + '][description]', this.datas[i].description);
            if (this.datas[i].date) {
                formData.append('documents[' + i + '][date]', new Date(this.datas[i].date).toISOString());
            }
        }

        this.http.post(`${environment.app.apiUrl}/api/stations/${this.station_id}/documents`, formData).subscribe({
            next: response => {
                const medias = response as any[];
                console.log('medias: ' + JSON.stringify(medias));
                this.datas = [];
                if (medias) {
                    medias.forEach(media => {
                        const data = {
                            id: media.id,
                            title: media.custom_properties.title,
                            author: media.custom_properties.author,
                            description: media.custom_properties.description,
                            date: media.custom_properties.date,
                            original_url: media.original_url
                        };

                        this.datas.push(data);
                    });
                }
                this._generateMsg('success', 'Successful', 'Data is saved successfully');
                this.disabled = true;
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    onFileChange(event: any) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            console.log('file' + file);
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
                //this.disabled = false;
                if (!isNaN(data.id)) {
                    //localhost:8090/api/stations/8/documents/11
                    this.spinnerService.show();
                    this.http
                        .delete(`${environment.app.apiUrl}/api/stations/${this.station_id}/documents/${data.id}`)
                        .subscribe({
                            next: () => {
                                this.setDatas(this.getDatas().filter(val => val.id !== data.id));
                                //this.totalRecords -= 1;
                                this.createDataForm(new Document());
                                this._generateMsg('success', 'Successful', 'Data is deleted successfully');
                                this.spinnerService.hide();
                                this.state$.next(true);
                            },
                            error: err => {
                                this._errorHandler(err);
                            }
                        });
                } else {
                    this.setDatas(this.getDatas().filter(val => val.id !== data.id));
                }
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    showPdfViewer() {
        this.displayPdfViewer = true;
    }

    deleteMoreWithConfirm() {}

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

    test() {
        const objs = [
            {
                id: 1,
                name: 'a',
                childs: [
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                    { id: '_2', name: 'c' }
                ]
            },
            { id: 2, name: 'b' },
            { id: '_2', name: 'c' },
            { id: null, name: 'b' }
        ];

        this.changeValueInJson('id', null, objs);

        console.log(JSON.stringify(objs));
    }

    onSelect(event: any) {
        console.log('event: ' + JSON.stringify(event));
        this.spinnerService.show();
        this.http.get(`${environment.app.apiUrl}/api/stations/${event.id}/documents`).subscribe({
            next: response => {
                const medias = (response as any).media as any[];
                this.datas = [];
                medias.forEach(media => {
                    this.datas.push(media.custom_properties);
                });

                console.log('this.datas: ' + JSON.stringify(this.datas));
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
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
                next: response => {
                    console.log('stations: ' + JSON.stringify(response));
                    this.filteredStations = response as any[];
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
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
                next: response => {
                    console.log('stations: ' + JSON.stringify(response));
                    this.filteredStations = response as any[];
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
    }
}
