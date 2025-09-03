import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { SelectItem, ConfirmationService, MessageService } from 'primeng/api';
import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MoreComponent } from './_more.component';
import * as L from 'leaflet';
@Component({
    selector: 'app-dashboard-user',
    templateUrl: './dashboard-user.component.html'
})
export class DashboardUserComponent extends MoreComponent implements OnInit, AfterViewInit {
    map: any;
    markersLayer: any;
    legend: any;

    station_id: string;
    station_name: string;

    institution_name: string;
    station_class: string;
    status: string;

    pieData: any;
    highestLocationData: any;
    highestInstrumentData: any;
    horizontalOptions: any;
    chartOptions: any;

    instrumentCondition: any = {};

    stations: any[] = [];

    usageType: number;
    usageTypeOptions: SelectItem[] = [];

    mapType: string;
    mapTypeOptions: SelectItem[] = [];

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
        this.http.get(`${environment.app.apiUrl}/api/lists/instruments/group-by/statuses`).subscribe({
            next: data => {
                console.log('instrument:' + JSON.stringify(data));

                const labels1: any[] = [];
                const data1: any[] = [];
                for (const [k, v] of Object.entries(data)) {
                    labels1.push(k);
                    data1.push(v);
                }

                this.pieData = {
                    labels: labels1,
                    datasets: [
                        {
                            data: data1,
                            backgroundColor: ['blue', 'green', 'yellow', 'orange', 'red'],
                            hoverBackgroundColor: ['blue', 'green', 'yellow', 'orange', 'red']
                        }
                    ]
                };

                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });

        // this.model = this.layout.getConfig();
        // this.router.navigate(['/login']);

        this.mapTypeOptions.push({ label: '- Type Information? -', value: null });
        this.mapTypeOptions.push({ label: 'Performa Pencapaian Pengisian', value: 'progress' });
        this.mapTypeOptions.push({ label: 'Level Exposure', value: 'expos' });

        this._createDropdownList(
            'api/lists/types/usage-types',
            new HttpParams(),
            'name',
            'id',
            '- pilih usage type -',
            this.usageTypeOptions
        );

        this.horizontalOptions = {
            indexAxis: 'y'
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12
                    }
                }
            }
        };
    }

    ngAfterViewInit(): void {
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
                    this.changeMarker();
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
        } catch (error) {
            document.location.reload();
        }
    }

    onSelectUsage(event: any) {
        this.usageType = event.value;
        this.changeMarker();
    }

    onSelectMap(event: any) {
        this.mapType = event.value;
        this.changeMarker();
    }

    changeMarker() {
        console.log('usageType:' + this.usageType);
        console.log('mapType:' + this.mapType);

        this.markersLayer.clearLayers();

        this.stations.forEach(station => {
            let include = true;

            if (station.lat && station.long) {
                //nop
            } else {
                include = false;
            }

            if (this.usageType && this.usageType !== station.usage_type_id) {
                include = false;
            }

            let popup: string;
            let colorMarker = 'red';
            if (!this.mapType || this.mapType === 'progress') {
                popup = `<div style="text-align: left">
                <a href="station-edits/${station.id}"><b>${station.name}</b></a><br>
                Progress: ${station.progress ? (station.progress * 100).toFixed(2) : 0} % [Detail]<br>
                </div>
                `;

                if (station.progress <= 0.5) {
                    colorMarker = 'red';
                } else if (station.progress > 0.5 && station.progress <= 0.8) {
                    colorMarker = 'yellow';
                } else if (station.progress > 0.8) {
                    colorMarker = 'green';
                }
            } else {
                popup = `<div style="text-align: left">
                <a href="station-edits/${station.id}"><b>${station.name}</b></a><br>
                `;

                switch (station.max_level_of_exposure) {
                    case 1: {
                        colorMarker = 'blue';
                        break;
                    }
                    case 2: {
                        colorMarker = 'green';
                        break;
                    }
                    case 3: {
                        colorMarker = 'yello';
                        break;
                    }
                    case 4: {
                        colorMarker = 'orange';
                        break;
                    }
                    case 5: {
                        colorMarker = 'red';
                        break;
                    }
                    default: {
                        colorMarker = 'red';
                        break;
                    }
                }
            }

            if (include) {
                const marker = L.circle([station.lat, station.long], {
                    color: colorMarker
                })
                    .addTo(this.map)
                    .bindPopup(popup)
                    .on('mouseover', function (e) {
                        marker.openPopup();
                    });
                this.markersLayer.addLayer(marker);
            }
        });

        this.markersLayer.addTo(this.map);
        this.spinnerService.hide();
        this.state$.next(true);

        if (this.legend) this.map.removeControl(this.legend);

        if (!this.mapType || this.mapType === 'progress') {
            console.log('masuuuuk progress');
            this.legend = L.control.attribution({ position: 'bottomleft' });

            this.legend.onAdd = function () {
                const div = L.DomUtil.create('div', 'legend');
                div.innerHTML += '<h4>Progress</h4>';
                div.innerHTML += '<i style="background: red"></i><span>kurang dari 50%</span><br>';
                div.innerHTML += '<i style="background: yellow"></i><span>50% sampai dengan 80%</span><br>';
                div.innerHTML += '<i style="background: green"></i><span>lebih dari 80%</span><br>';

                return div;
            };

            this.legend.addTo(this.map);
        } else {
            console.log('masuuuuk expos');
            this.legend = L.control.attribution({ position: 'bottomleft' });

            this.legend.onAdd = function () {
                const div = L.DomUtil.create('div', 'legend');
                div.innerHTML += '<h4>Level Exposure</h4>';
                div.innerHTML += '<i style="background: blue"></i><span>Class 1</span><br>';
                div.innerHTML += '<i style="background: green"></i><span>Class 2</span><br>';
                div.innerHTML += '<i style="background: yellow"></i><span>Class 3</span><br>';
                div.innerHTML += '<i style="background: orange"></i><span>Class 4</span><br>';
                div.innerHTML += '<i style="background: red"></i><span>Class 5</span><br>';

                return div;
            };

            this.legend.addTo(this.map);
        }
    }

    /*onSelectUsage(event: any) {
        console.log('event:' + event.value);
        this.markersLayer.clearLayers();

        this.stations.forEach(station => {
            let include = true;

            if (station.lat && station.long) {
                //nop
            } else {
                include = false;
            }

            if (event && event.value !== station.usage_type_id) {
                include = false;
            }

            if (include) {
                const marker = L.marker([station.lat, station.long])
                    .addTo(this.map)
                    .bindPopup(
                        `<div style="text-align: left">
                        <a href="station-edits/${station.id}"><b>${station.name}</b></a><br>
                        Progress: ${station.progress ? station.progress * 100 : 0} % <br>
                        Exposure: ${station.max_level_of_exposure ? station.max_level_of_exposure : ''}<br>
                        Instrument: ${station.total_instrument ? station.total_instrument : ''}
                        </div>
                        `
                    )
                    .openPopup();
                this.markersLayer.addLayer(marker);
            }
        });

        this.markersLayer.addTo(this.map);
        this.spinnerService.hide();
        this.state$.next(true);
    }

    onSelectMap(event: any) {
        console.log('event:' + event.value);
        if (this.legend) this.map.removeControl(this.legend);

        if (event.value === 'progress') {
            console.log('masuuuuk progress');
            this.legend = L.control.attribution({ position: 'bottomleft' });

            this.legend.onAdd = function () {
                const div = L.DomUtil.create('div', 'legend');
                div.innerHTML += '<h4>Progress</h4>';
                div.innerHTML += '<i style="background: red"></i><span>x <= 50%</span><br>';
                div.innerHTML += '<i style="background: yellow"></i><span>50% < x <= 80% </span><br>';
                div.innerHTML += '<i style="background: green"></i><span>80% < x</span><br>';

                return div;
            };

            this.legend.addTo(this.map);
        } else if (event.value === 'expos') {
            console.log('masuuuuk expos');
            this.legend = L.control.attribution({ position: 'bottomleft' });

            this.legend.onAdd = function () {
                const div = L.DomUtil.create('div', 'legend');
                div.innerHTML += '<h4>Level Exposure</h4>';
                div.innerHTML += '<i style="background: blue"></i><span>Class 1</span><br>';
                div.innerHTML += '<i style="background: green"></i><span>Class 2</span><br>';
                div.innerHTML += '<i style="background: yellow"></i><span>Class 3</span><br>';
                div.innerHTML += '<i style="background: orange"></i><span>Class 4</span><br>';
                div.innerHTML += '<i style="background: red"></i><span>Class 5</span><br>';

                return div;
            };

            this.legend.addTo(this.map);
        }
    }*/

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
