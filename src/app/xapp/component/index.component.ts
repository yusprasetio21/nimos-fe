import { Router } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { FormBuilder } from '@angular/forms';
import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpParams, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Component, OnInit, Renderer2, ViewChild, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styles: [
        `
            #map {
                height: 100%;
            }
        `
    ]
})
export class IndexComponent extends MoreComponent implements OnInit, AfterViewInit {
    map: any;
    markersLayer: any;

    model: any;

    options = {};

    station_id: string;
    station_name: string;

    //institution_name: string;

    station: any = new Object();
    stations: any[];
    filteredStations: any[];

    usageType: number;
    usageTypeOptions: SelectItem[] = [];

    status = '';
    statusOptions: SelectItem[] = [];

    institutionId: number;
    institutionOptions: SelectItem[] = [];

    news: any[] = [];

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

    ngOnInit(): void {
        // this.model = this.layout.getConfig();
        // this.router.navigate(['/login']);

        this.statusOptions = [];
        this.statusOptions.push({ label: '- Status? -', value: null });
        this.statusOptions.push({ label: 'Operational', value: 'opr' });
        this.statusOptions.push({ label: 'Closed', value: 'cls' });

        this._createDropdownList(
            'api/lists/organizations',
            new HttpParams(),
            'long_name',
            'id',
            '- pilih institution -',
            this.institutionOptions
        );

        this._createDropdownList(
            'api/lists/types/usage-types',
            new HttpParams().append('filter[lang]', this.lang),
            'name',
            'id',
            '- pilih usage type -',
            this.usageTypeOptions
        );

        this.http
            .get(`${environment.app.apiUrl}/api/news?sort=-id&page[size]=3&page[number]=1&filter[is_active]=true`)
            .subscribe({
                next: response => {
                    //console.log('resp: ' + JSON.stringify(response));
                    const page = response as any;
                    const news1 = page.data as any[];
                    news1.forEach(new1 => {
                        const new2 = {
                            id: new1.id,
                            created_at: new1.created_at,
                            title: new1.title,
                            news: new1.news.length > 230 ? new1.news.slice(0, 230) : new1.news,
                            is_read_more: new1.news.length > 230 ? true : false
                        };
                        this.news.push(new2);
                    });
                    //this.news = page.data as any[];
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
    }

    ngAfterViewInit(): void {
        this.spinnerService.show();

        L.Icon.Default.imagePath = 'assets/leaflet/';

        try {
            this.map = L.map('map', {
                //center: latLng(-0.789275, 113.921327)
                center: [-0.789275, 113.921327],
                zoom: 5
            });
            const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                minZoom: 3,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            });

            //tiles.addTo(this.map);
            this.map.addLayer(tiles);

            this.markersLayer = new L.LayerGroup();

            this.http.get(`${environment.app.apiUrl}/api/lists/stations/statistics`).subscribe({
                next: response => {
                    console.log('stations:' + JSON.stringify(response));
                    this.stations = response as any[];

                    this.markersLayer.clearLayers();

                    this.stations.forEach(station => {
                        if (station.lat && station.long) {
                            const marker = L.circle([station.lat, station.long], {
                                color: 'blue'
                            })
                                .addTo(this.map)
                                .bindPopup(`<a href="metadata/${station.id}">${station.name}</a>`)
                                .on('mouseover', function (e) {
                                    marker.openPopup();
                                });
                            this.markersLayer.addLayer(marker);
                        }
                    });

                    this.markersLayer.addTo(this.map);
                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
        } catch (error) {
            document.location.reload();
        }
    }

    onSelectInstitutions(event: any) {
        //console.log('inst even:' + JSON.stringify(event));
        this.institutionId = event.value;
        this.onSelectFilter();
    }
    onSelectStatus(event: any) {
        //console.log('status even:' + JSON.stringify(event));
        this.status = event.value;
        this.onSelectFilter();
    }
    onSelectUsage(event: any) {
        //console.log('usage even:' + JSON.stringify(event));
        this.usageType = event.value;
        this.onSelectFilter();
    }

    onSelectFilter() {
        this.markersLayer.clearLayers();

        this.stations.forEach(station => {
            let include = true;

            if (station.lat && station.long) {
                //nop
            } else {
                include = false;
            }

            if (this.institutionId && this.institutionId !== station.supervising_organization_id) {
                include = false;
            }

            if (this.usageType && this.usageType !== station.usage_type_id) {
                include = false;
            }

            //console.log('station.date_closed: ' + station.date_closed);
            if (this.status) {
                if (this.status === 'opr' && station.date_closed !== null) {
                    include = false;
                }
                if (this.status === 'cls' && station.date_closed === null) {
                    include = false;
                }
            }

            if (include) {
                const marker = L.circle([station.lat, station.long], {
                    color: 'blue'
                })
                    .addTo(this.map)
                    .bindPopup(`<a href="metadata/${station.id}">${station.name}</a>`)
                    .on('mouseover', function (e) {
                        marker.openPopup();
                    });
                this.markersLayer.addLayer(marker);
            }
        });

        this.markersLayer.addTo(this.map);
        this.spinnerService.hide();
        this.state$.next(true);
    }

    searchStationById(event: any) {
        this.spinnerService.show();
        this.http
            .get(`${environment.app.apiUrl}/api/lists/stations`, {
                params: new HttpParams().append('filter[identifier]', event.query)
            })
            .subscribe({
                next: response => {
                    //console.log('stations: ' + JSON.stringify(response));
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
                    //console.log('stations: ' + JSON.stringify(response));
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
        //console.log('metadata: ' + event.id);
        this.router.navigate(['/metadata', event.id]);
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
    protected createDataForm(data: any) {
        throw new Error('Method not implemented.');
    }
    protected updateTableDisplay(datas: any[], req: any, resp: any) {
        throw new Error('Method not implemented.');
    }
}
