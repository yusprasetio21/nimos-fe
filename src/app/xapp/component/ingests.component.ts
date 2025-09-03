import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { MoreComponent } from './_more.component';

@Component({
    templateUrl: './ingests.component.html',
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
export class IngestComponent extends MoreComponent implements OnInit {
    uploadedFiles: any[] = [];

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
        this.createDataForm(null);
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

    save() {
        this.spinnerService.show();
        const formData = new FormData();
        formData.append('document', this.dataForm.controls.fileSource.value);
        this.http.post(`${environment.app.apiUrl}/api/stations/ingest-metadata`, formData).subscribe({
            next: response => {
                const medias = response as any[];
                console.log('medias: ' + JSON.stringify(medias));
                this.createDataForm(null);
                this._generateMsg('success', 'Successful', 'Data is saved successfully');
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    onUpload(event: any) {
        for (const file of event.files) {
            this.uploadedFiles.push(file);
        }

        this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
    }

    protected getSelectedDatas(): any[] {
        throw new Error('Method not implemented.');
    }
    protected setSelectedDatas(datas: any) {
        throw new Error('Method not implemented.');
    }
    protected generateStr(event: any) {
        throw new Error('Method not implemented.');
    }
    protected getDatas(): any[] {
        throw new Error('Method not implemented.');
    }
    protected setDatas(datas: any[]): void {
        throw new Error('Method not implemented.');
    }
    protected updateTableDisplay(datas: any[], req: any, resp: any) {
        throw new Error('Method not implemented.');
    }
    protected createDataForm(data: any) {
        this.dataForm = this.fb.group({
            document: new FormControl('', Validators.required),
            fileSource: new FormControl('')
        });
    }
}
