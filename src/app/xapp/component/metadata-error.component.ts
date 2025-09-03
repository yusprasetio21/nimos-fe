import { Samplings } from './../../modules/observations/model/samplings';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { NgForm, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MoreComponent } from './_more.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { Institution } from '../domain/institution';
import { BibtexParser } from 'bibtex-js-parser';
import { DatePipe } from '@angular/common';
import * as L from 'leaflet';
import { Program } from 'src/app/modules/observations/model/observation';
import { MatTableDataSource } from '@angular/material/table';

interface GalleriaImage {
    URL: string;
}

@Component({
    selector: 'app-metadata-error',
    templateUrl: './metadata-error.component.html'
})
export class MetadataErrorComponent extends MoreComponent implements OnInit {
    model: any;

    options = {};

    //institution_name: string;

    station: any = new Object();
    stations: any[];
    filteredStations: any[];

    constructor(
        public datepipe: DatePipe,
        private fb: FormBuilder,
        //more
        confirmationService: ConfirmationService,
        http: HttpClient,
        //base
        router: Router,
        messageService: MessageService,
        spinnerService: NgxSpinnerService,
        private route: ActivatedRoute
    ) {
        super(confirmationService, http, router, messageService, spinnerService);
    }

    ngOnInit(): void {
        //nop
    }

    searchStationById(event: any) {
        this.spinnerService.show();
        this.http
            .get(`${environment.app.apiUrl}/api/lists/stations`, {
                params: new HttpParams().append('filter[identifier]', event.query)
            })
            .subscribe({
                next: response => {
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
                    this.filteredStations = response as any[];
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
    }

    onSelect(event: any) {
        this.router.navigate(['/metadata', event.id]);
    }

    protected createDataForm(data: any) {
        throw new Error('Method not implemented.');
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
}
