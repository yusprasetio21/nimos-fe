import { environment } from 'src/environments/environment';
import { User } from './../domain/user';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem } from 'primeng/api';
import { MoreComponent } from './_more.component';
import { Station } from '../domain/station';
import { BaseComponent } from './_base.component';
import { Organization } from '../domain/organization';

@Component({
    templateUrl: './contact.component.html',
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
export class ContactComponent extends BaseComponent implements OnInit {
    state$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    unsubscribe: Subscription[] = [];

    datas: any[] = [];
    data: User;
    selectedDatas: User[] = [];

    station: any;
    stations: Station[];
    filteredStations: any[];

    station_id: any;
    station_name: any;
    station_identifier: any;
    station_wigos_id: any;

    constructor(
        protected confirmationService: ConfirmationService,
        protected http: HttpClient,

        router: Router,
        messageService: MessageService,
        spinnerService: NgxSpinnerService
    ) {
        super(router, messageService, spinnerService);
        this.unsubscribe.push(this.state$.asObservable().subscribe());
    }

    ngOnInit() {
        this.station_id = localStorage.getItem('station_id');
        this.station_name = localStorage.getItem('station_name');
        this.station_identifier = localStorage.getItem('station_identifier');
        this.station_wigos_id = localStorage.getItem('station_wigos_id');

        console.log('station: ' + JSON.stringify(this.station));
        if (this.station_id) {
            this.spinnerService.show();
            this.http
                .get(`${environment.app.apiUrl}/api/stations/${localStorage.getItem('station_id')}/contacts`)
                .subscribe({
                    next: response => {
                        console.log('users: ' + JSON.stringify(response));
                        this.datas = response as any[];
                        if (this.datas.length <= 0) {
                            //this._generateMsg('error', 'Error Message', 'There are no contact found');
                        } else {
                            this.datas.forEach(data => {
                                switch (data.organization.category) {
                                    case Organization.CAT_PEMERINTAH: {
                                        data.organization.category = 'Instansi Pemerintah';
                                        break;
                                    }
                                    case Organization.CAT_BUMN: {
                                        data.organization.category = 'BUMN';
                                        break;
                                    }
                                    case Organization.CAT_SWASTA: {
                                        data.organization.category = 'Perusahaan Swasta';
                                        break;
                                    }
                                    case Organization.CAT_UNIV: {
                                        data.organization.category = 'Universitas';
                                        break;
                                    }
                                    case Organization.CAT_NGO: {
                                        data.organization.category = 'Non Government Organization (NGO)';
                                        break;
                                    }
                                    case Organization.CAT_MANDIRI: {
                                        data.organization.category = 'Pengamatan Mandiri';
                                        break;
                                    }
                                }
                            });
                        }
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

        //exportCsv purpose
        this.cols = [];
    }
}
