import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfirmationService, LazyLoadEvent, MessageService, SelectItem, FilterMatchMode } from 'primeng/api';
import { MoreComponent } from './_more.component';
import { User } from '../domain/user';

@Component({
    templateUrl: './station-assign-adm.component.html',
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
export class StationAssignAdmComponent extends MoreComponent implements OnInit {
    datas: User[];
    data: User;
    selectedUser: User;

    selectedStations: any[] = [];

    roleOptions: SelectItem[];
    isActiveOptions: SelectItem[];
    categoryOrgOptions: SelectItem[];
    organizationOptions: SelectItem[] = [];

    matchModeOptions2: SelectItem[] = [{ label: 'Equals', value: FilterMatchMode.EQUALS }];

    provinces: any[];
    filteredProvinces: any[];

    usages: any[];
    selectedUsages: any[];

    organization_id: number;

    stations: any[] = [];
    station: any;

    totalRecords1: number;

    station_name: string;

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
        this.roleOptions = [];
        this.roleOptions.push({ label: '- Role? -', value: null });
        this.roleOptions.push({ label: 'Administrator', value: 2 });
        this.roleOptions.push({ label: 'PIC User', value: 3 });
        this.roleOptions.push({ label: 'User Station', value: 4 });

        this._createDropdownList(
            'api/lists/organizations',
            new HttpParams(),
            'long_name',
            'id',
            '- pilih instansi -',
            this.organizationOptions
        );

        this.http.get(`${environment.app.apiUrl}/api/lists/types/usage-types?filter[lang]=${this.lang}`).subscribe({
            next: data => {
                console.log('data:' + JSON.stringify(data));
                this.usages = data as any;
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    loadDatas(event: LazyLoadEvent) {
        this._loadDatas('api/users', event);
    }

    generateStr(data: any): any {
        if (0 === data.is_active) {
            data.is_active = 'Not Active';
        } else if (1 === data.is_active) {
            data.is_active = 'Active';
        } else if (2 === data.is_active) {
            data.is_active = 'Deleted';
        }

        if ('admin' === data.roles[0]?.name) {
            data.role_str = 'Administrator';
        } else if ('station' === data.roles[0]?.name) {
            data.role_str = 'User Station';
        } else if ('pic' === data.roles[0]?.name) {
            data.role_str = 'PIC User';
        } else if ('superadmin' === data.roles[0]?.name) {
            data.role_str = 'Superadmin';
        }
        return data;
    }

    searchStation(page: number | null) {
        if (!this.selectedUser) {
            this._generateMsg('error', 'Error Message', 'Please select user first');
        } else {
            this.spinnerService.show();
            if (!page) page = 1;
            this.http
                .get(
                    //`${environment.app.apiUrl}/api/lists/stations?include=usageType,province,organizations${filterStation}${filterUsage}${filterOrg}`
                    `${environment.app.apiUrl}/api/lists/stations/users/${
                        this.selectedUser.id
                    }/assigned?${this.createQueryString()}&page=${page}`
                )
                .subscribe({
                    next: response => {
                        console.log(JSON.stringify(response));
                        const page1 = response as any;
                        this.stations = page1.data as any[];
                        if (this.stations.length > 0) {
                            this.selectedStations = [];
                            this.stations.forEach(station => {
                                if (station.users_exists) {
                                    this.selectedStations.push(station);
                                }
                            });
                            this.totalRecords1 = page1.total as number;
                        } else {
                            this._generateMsg('error', 'Error Message', 'There are no station found');
                        }
                        this.spinnerService.hide();
                        this.state$.next(true);
                    },
                    error: err => {
                        this._errorHandler(err);
                    }
                });
        }
    }

    createQueryString(): string {
        let filterStation = '';
        if (this.provinces && this.provinces.length > 0) {
            console.log('province: ' + JSON.stringify(this.provinces));
            filterStation = '&filter[province.id]=';
            this.provinces.forEach(province => {
                filterStation += province.id + ',';
            });
            filterStation = filterStation.substring(0, filterStation.length - 1);
        }
        let filterUsage = '';
        if (this.selectedUsages && this.selectedUsages.length > 0) {
            console.log('usages: ' + JSON.stringify(this.selectedUsages));
            filterUsage = '&filter[usageType.id]=';
            this.selectedUsages.forEach(usage => {
                filterUsage += usage.id + ',';
            });
            filterUsage = filterUsage.substring(0, filterUsage.length - 1);
        }
        let filterOrg = '';
        if (this.organization_id) {
            console.log('organization_id: ' + JSON.stringify(this.organization_id));
            filterOrg = '&filter[organizations.id]=' + this.organization_id;
        }
        let filterName = '';
        if (this.station_name) {
            console.log('station_name: ' + filterName);
            filterName = '&filter[name]=' + this.station_name;
        }
        return filterStation + filterUsage + filterOrg + filterName;
    }

    paginate(event: any) {
        //event.first = Index of the first record
        //event.rows = Number of rows to display in new page
        //event.page = Index of the new page
        //event.pageCount = Total number of pages
        this.searchStation(event.page + 1);
    }

    selectRow(station: any) {
        const newstation: any[] = [];

        let lastUrl = '';
        this.stations.forEach(station1 => {
            if (station1.id === station.id) {
                if (station1.users_exists) {
                    station1.users_exists = false;
                    lastUrl = 'detach';
                } else {
                    station1.users_exists = true;
                    lastUrl = 'attach';
                }
            }
            newstation.push(station1);
        });

        this.stations = newstation;
        console.log('selectRow:' + JSON.stringify(this.stations));

        this.spinnerService.show();
        this.http
            .post(`${environment.app.apiUrl}/api/users/${this.selectedUser.id}/stations/${station.id}/${lastUrl}`, null)
            .subscribe({
                next: resp => {
                    this._generateMsg('success', 'Successful', 'Data is saved successfully');
                    this.spinnerService.hide(); //aneh kalau sebelum _generateMsg, tetap loading
                    //window.location.reload();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
    }

    searchProvince(event: any) {
        this.spinnerService.show();
        this.http
            .get(`${environment.app.apiUrl}/api/provinces`, {
                params: new HttpParams().append('filter[name]', event.query)
            })
            .subscribe({
                next: response => {
                    console.log('provinces: ' + JSON.stringify(response));
                    this.filteredProvinces = response as any[];
                    this.spinnerService.hide();
                    console.log('provinces chosen: ' + JSON.stringify(this.provinces));
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
    }

    //deprecated
    assignUser() {
        if (!this.selectedUser) {
            this._generateMsg('error', 'Error Message', 'Please select user first');
        } else if (!this.selectedStations || this.selectedStations.length === 0) {
            this._generateMsg('error', 'Error Message', 'Please select station first');
        } else {
            this.spinnerService.show();
            const stationArr: number[] = [];
            this.selectedStations.forEach(data => {
                stationArr.push(data.id);
            });
            this.http
                .post(`${environment.app.apiUrl}/api/users/${this.selectedUser.id}/stations`, {
                    stations: stationArr
                })
                .subscribe({
                    next: resp => {
                        //this.setDatas(this.updateTableDisplay(datas, req, resp));
                        //this.createDataForm(null);
                        this.dialogForm = false;
                        this._generateMsg('success', 'Successful', 'Data is saved successfully');
                        this.spinnerService.hide(); //aneh kalau sebelum _generateMsg, tetap loading
                        //window.location.reload();
                        this.state$.next(true);
                    },
                    error: err => {
                        this._errorHandler(err);
                    }
                });
        }
    }
    getDatas() {
        return this.datas;
    }

    setDatas(datas: any[]) {
        this.datas = datas;
    }

    protected getSelectedDatas(): any[] {
        throw new Error('Method not implemented.');
    }
    protected setSelectedDatas(datas: any) {
        throw new Error('Method not implemented.');
    }
    protected createDataForm(data: any) {
        throw new Error('Method not implemented.');
    }

    updateTableDisplay(datas: any[], req: any, resp: any) {
        return this._updateTableDisplay(datas, resp);
    }
}
