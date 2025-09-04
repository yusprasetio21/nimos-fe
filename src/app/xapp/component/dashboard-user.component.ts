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
    map: L.Map;
    markersLayer: L.LayerGroup;
    legend: L.Control;

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

    private allMarkers: L.Circle[] = []; // Menyimpan semua markers

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
                center: [-0.789275, 113.921327],
                zoom: 5
            });

            const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                minZoom: 3,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            });

            this.map.addLayer(tiles);
            this.markersLayer = L.layerGroup().addTo(this.map);

            this.http.get(`${environment.app.apiUrl}/api/lists/stations/statistics`).subscribe({
                next: response => {
                    console.log('stations:' + JSON.stringify(response));
                    this.stations = response as any[];
                    this.changeMarker();
                    
                    // Zoom ke semua markers setelah data loaded
                    this.zoomToMarkers();
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
        } catch (error) {
            console.error('Map initialization error:', error);
            document.location.reload();
        }
    }

    // Fungsi untuk zoom ke semua markers
    private zoomToMarkers(): void {
        if (this.allMarkers.length > 0) {
            const group = L.featureGroup(this.allMarkers);
            this.map.fitBounds(group.getBounds().pad(0.1), {
                maxZoom: 15,
                animate: true
            });
        }
    }

    // Fungsi untuk reset zoom
    resetMapView(): void {
        if (this.allMarkers.length > 0) {
            const group = L.featureGroup(this.allMarkers);
            this.map.fitBounds(group.getBounds().pad(0.1), {
                maxZoom: 15,
                animate: true
            });
        } else {
            this.map.setView([-0.789275, 113.921327], 5);
        }
    }

    onSelectUsage(event: any): void {
        this.usageType = event.value;
        this.changeMarker();
    }

    onSelectMap(event: any): void {
        this.mapType = event.value;
        this.changeMarker();
    }

    changeMarker(): void {
        console.log('usageType:' + this.usageType);
        console.log('mapType:' + this.mapType);

        // Clear existing markers
        this.markersLayer.clearLayers();
        this.allMarkers = [];

        this.stations.forEach(station => {
            let include = true;

            if (!station.lat || !station.long) {
                include = false;
            }

            if (this.usageType && this.usageType !== station.usage_type_id) {
                include = false;
            }

            if (include) {
                let popup: string;
                let colorMarker = 'red';
                
                if (!this.mapType || this.mapType === 'progress') {
                    popup = `<div style="text-align: left">
                    <a href="station-edits/${station.id}"><b>${station.name}</b></a><br>
                    Progress: ${station.progress ? (station.progress * 100).toFixed(2) : 0} %<br>
                    </div>`;

                    if (station.progress <= 0.5) {
                        colorMarker = 'red';
                    } else if (station.progress > 0.5 && station.progress <= 0.8) {
                        colorMarker = 'orange';
                    } else if (station.progress > 0.8) {
                        colorMarker = 'green';
                    }
                } else {
                    popup = `<div style="text-align: left">
                    <a href="station-edits/${station.id}"><b>${station.name}</b></a><br>
                    Level Exposure: ${station.max_level_of_exposure || 'N/A'}<br>
                    </div>`;

                    switch (station.max_level_of_exposure) {
                        case 1: colorMarker = 'blue'; break;
                        case 2: colorMarker = 'green'; break;
                        case 3: colorMarker = 'yellow'; break;
                        case 4: colorMarker = 'orange'; break;
                        case 5: colorMarker = 'red'; break;
                        default: colorMarker = 'gray'; break;
                    }
                }

                const marker = L.circle([station.lat, station.long], {
                    color: colorMarker,
                    fillColor: colorMarker,
                    fillOpacity: 0.7,
                    radius: 50, // Radius dalam meter
                    weight: 2
                }).bindPopup(popup);

                marker.on('mouseover', function (e) {
                    marker.openPopup();
                });

                this.markersLayer.addLayer(marker);
                this.allMarkers.push(marker);
            }
        });

        // Zoom ke markers yang ditampilkan
        if (this.allMarkers.length > 0) {
            const group = L.featureGroup(this.allMarkers);
            this.map.fitBounds(group.getBounds().pad(0.1), {
                maxZoom: 15,
                animate: true
            });
        }

        this.updateLegend();

        this.spinnerService.hide();
        this.state$.next(true);
    }

    private updateLegend(): void {
    if (this.legend) {
        this.map.removeControl(this.legend);
    }

    const LegendControl = L.Control.extend({
        options: { position: 'bottomleft' },

        onAdd: (map: L.Map) => {
            const div = L.DomUtil.create('div', 'legend');

            if (!this.mapType || this.mapType === 'progress') {
                div.innerHTML = `
                    <h4>Progress</h4>
                    <div><span style="background: red"></span> Kurang dari 50%</div>
                    <div><span style="background: orange"></span> 50% - 80%</div>
                    <div><span style="background: green"></span> Lebih dari 80%</div>
                `;
            } else {
                div.innerHTML = `
                    <h4>Level Exposure</h4>
                    <div><span style="background: blue"></span> Class 1</div>
                    <div><span style="background: green"></span> Class 2</div>
                    <div><span style="background: yellow"></span> Class 3</div>
                    <div><span style="background: orange"></span> Class 4</div>
                    <div><span style="background: red"></span> Class 5</div>
                `;
            }

            return div;
        }
    });

    this.legend = new LegendControl();
    this.legend.addTo(this.map);
}


    // Implementasi abstract methods
    protected getSelectedDatas(): any[] {
        throw new Error('Method not implemented.');
    }
    protected setSelectedDatas(datas: any): void {
        throw new Error('Method not implemented.');
    }
    protected generateStr(event: any): string {
        throw new Error('Method not implemented.');
    }
    protected getDatas(): any[] {
        throw new Error('Method not implemented.');
    }
    protected setDatas(datas: any[]): void {
        throw new Error('Method not implemented.');
    }
    protected createDataForm(data: any): void {
        throw new Error('Method not implemented.');
    }
    protected updateTableDisplay(datas: any[], req: any, resp: any): void {
        throw new Error('Method not implemented.');
    }
}