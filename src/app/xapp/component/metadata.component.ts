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
    selector: 'app-metadata',
    templateUrl: './metadata.component.html'
})
export class MetadataComponent extends MoreComponent implements OnInit, AfterViewInit {
    map: any;
    markersLayer: any;

    model: any;

    options = {};

    //institution_name: string;

    station: any = new Object();
    stations: any[];
    filteredStations: any[];

    usageType: number;
    usageTypeOptions: SelectItem[] = [];

    status = '';
    statusOptions: SelectItem[] = [];

    institutions: Institution[];
    selectedInstitutions: Institution[];

    datas: any[] = [];

    station_id: any;
    station_name: any;

    date_established: any;
    date_closed: any;
    wigos_id: any;
    station_url: any;
    other_url: any;
    usage_type_id: any;
    wmo_region_type: any;
    station_type_id: any;
    identifier: any;
    province_id: any;
    station_coordinator: any;

    station_type: any;
    station_local_type: any;
    usage_type: any;

    station_aliases: any[] = [];
    station_usage: any[] = [];
    country_territories: any[] = [];
    coordinates: any[] = [];
    timezones: any[] = [];
    supervising_organizations: any[] = [];
    site_descriptions: any[] = [];
    climate_zones: any[] = [];
    predominant_surface_covers: any[] = [];
    surface_roughnesses: any[] = [];
    topography_bathymetries: any[] = [];
    populations: any[] = [];
    platform_event_logbooks: any[] = [];
    photo_gallery: any[] = [];
    program_network_affiliations: any[] = [];

    contacts: any[] = [];
    documents: any[] = [];
    document: any[] = [];

    //bibtext: any[] = [];
    bibliographic_references: any[] = [];

    img: GalleriaImage[] = [];
    dialogPhoto = false;

    //Observation Variable
    dataObs: any[] = [];
    observationList: any[] = [];
    programNetworksMap = new Map();
    instrumentMap = new Map();
    reportingTime = new Map();

    responsiveOptions: any;

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
        this._generateParam('edit');
        this.responsiveOptions = [
            {
                breakpoint: '1024px',
                numVisible: 5,
                numScroll: 5
            },
            {
                breakpoint: '768px',
                numVisible: 2,
                numScroll: 2
            },
            {
                breakpoint: '560px',
                numVisible: 1,
                numScroll: 1
            }
        ];

        this.station_id = this.route.snapshot.params.id;
        this.img = [];
    }

    ngAfterViewInit(): void {
        this.spinnerService.show();

        try {
            L.Icon.Default.imagePath = 'assets/leaflet/';

            this.map = L.map('map', {
                //center: latLng(-0.789275, 113.921327)
                center: [-0.789275, 113.921327],
                zoom: 10
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
                    // console.log('stations:' + JSON.stringify(response));
                    this.stations = response as any[];

                    this.markersLayer.clearLayers();

                    this.stations.forEach(station => {
                        if (station.lat && station.long) {
                            const marker = L.circle([station.lat, station.long], {
                                color: 'blue',
                                opacity: 0.8
                            })
                                .addTo(this.map)
                                .bindPopup(`${station.name}`)
                                .on('mouseover', function (e) {
                                    marker.openPopup();
                                });
                            this.markersLayer.addLayer(marker);
                        }
                    });

                    this.markersLayer.addTo(this.map);

                    console.log(this.station_id);
                    if (this.station_id) {
                        this.getStation(this.station_id);
                    }

                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
        } catch (error) {
            document.location.reload(); //tetap harus ada ini karena suka error
        }
    }

    getStation(id: number) {
    this.spinnerService.show();
    this.http.get(`${environment.app.apiUrl}/api/stations/${id}`).subscribe({
        next: response => {
            console.log('response: ' + JSON.stringify(response));

            const data = response as any;
            this.station_id = data.id;
            this.station_name = data.name;
            this.date_established = data.date_established;
            this.date_closed = data.date_closed;
            this.wigos_id = data.wigos_id;
            this.station_url = data.station_url;
            this.other_url = data.other_url;
            
            // PERBAIKAN: Gunakan optional chaining untuk menghindari null reference
            this.station_local_type = data.station_local_type?.name;
            this.usage_type = data.usage_type?.name;
            this.wmo_region_type = data.wmo_region_type;
            this.station_type_id = data.station_type_id;
            this.identifier = data.identifier;
            this.province_id = data.province_id;
            
            // INI KEMUNGKINAN SUMBER ERROR - line 226
            this.station_type = data.station_type?.name; // Gunakan optional chaining
            this.station_coordinator = data.station_coordinator?.name;

            this.station_aliases = data.station_aliases;
            this.station_usage = data.station_usage;
            this.coordinates = data.coordinates;
            this.country_territories = data.country_territories;
            this.timezones = data.timezones;
            this.supervising_organizations = data.supervising_organizations;
            this.site_descriptions = data.site_descriptions;
            this.climate_zones = data.climate_zones;
            this.predominant_surface_covers = data.predominant_surface_covers;
            this.surface_roughnesses = data.surface_roughnesses;
            this.topography_bathymetries = data.topography_bathymetries;
            this.populations = data.populations;
            this.platform_event_logbooks = data.platform_event_logbooks;

            this.photo_gallery = [];
            if (data.photo_gallery && data.photo_gallery.length > 0) {
                const medias = data.photo_gallery as any[];
                medias.forEach(element => {
                    // PERBAIKAN: Tambahkan optional chaining untuk custom_properties
                    const photo = {
                        id: element.id,
                        photo: this._replaceMediaUrl(element.original_url),
                        caption: element.custom_properties?.caption,
                        date_taken: element.custom_properties?.date_taken ? 
                                  new Date(element.custom_properties.date_taken) : null,
                        direction_of_view: element.custom_properties?.direction_of_view,
                        direction_of_view_id: element.custom_properties?.direction_of_view?.id,
                        direction_of_view_name: element.custom_properties?.direction_of_view?.name,
                        angle_of_view: element.custom_properties?.angle_of_view,
                        angle_of_view_id: element.custom_properties?.angle_of_view?.id,
                        angle_of_view_name: element.custom_properties?.angle_of_view?.value,
                        owner: element.custom_properties?.owner
                    };
                    this.photo_gallery.push(photo);
                });
            }

            this.program_network_affiliations = data.program_network_affiliations;

            // PERBAIKAN: Tambahkan null check untuk program_network_affiliations
            const programNetworkAffiliationsNew: any[] = [];
            if (this.program_network_affiliations && this.program_network_affiliations.length > 0) {
                this.program_network_affiliations.forEach(prog => {
                    let first = true;
                    if (prog && prog.declared_statuses && prog.declared_statuses.length > 0) {
                        prog.declared_statuses.forEach((declared_status: any) => {
                            let prog1 = {};
                            if (first) {
                                prog1 = {
                                    program_type_text: prog.program_type?.text,
                                    program_specific_identifier: prog.affiliationStatus,
                                    affiliation_status: prog.affiliation_status,
                                    declared_statuses_name: declared_status.declared_status_name,
                                    declared_statuses_from: declared_status.from,
                                    declared_statuses_to: declared_status.to
                                };
                            } else {
                                prog1 = {
                                    program_type_text: '',
                                    program_specific_identifier: '',
                                    affiliation_status: '',
                                    declared_statuses_name: declared_status.declared_status_name,
                                    declared_statuses_from: declared_status.from,
                                    declared_statuses_to: declared_status.to
                                };
                            }
                            first = false;
                            programNetworkAffiliationsNew.push(prog1);
                        });
                    }
                });
            }
            this.program_network_affiliations = programNetworkAffiliationsNew;

            this.contacts = data.contacts || [];
            this.documents = data.documents || [];

            const bibtext = data.bibliographic_references || [];
            this.bibliographic_references = [];
            bibtext.forEach((data_bib: any) => {
                if (data_bib.bibtex) {
                    try {
                        const bibJSON = BibtexParser.parseToJSON(data_bib.bibtex);
                        const text = this.convertToAPA(bibJSON[0]);
                        this.bibliographic_references.push({ text });
                    } catch (error) {
                        console.error('Error parsing bibtex:', error);
                    }
                }
            });

            this.observationList = [];
            if (data.observation && data.observation.length > 0) {
                this.controllObservation(data.observation);
            }

            // PERBAIKAN: Tambahkan null check untuk coordinates
            const latitude = data.coordinates && data.coordinates[0]?.latitude;
            const longitude = data.coordinates && data.coordinates[0]?.longitude;

            if (latitude && longitude) {
                const marker = L.circle([latitude, longitude], {
                    color: 'blue',
                    weight: 15,
                    opacity: 0.9
                })
                    .addTo(this.map)
                    .bindPopup(`${this.station_name}`)
                    .on('mouseover', function (e) {
                        marker.openPopup();
                    });
                this.markersLayer.addLayer(marker);
                this.map.setView({ lat: latitude, lng: longitude }, 7);
            }

            this.markersLayer.addTo(this.map);
            this.spinnerService.hide();
            this.state$.next(true);
        },
        error: err => {
            this._errorHandler(err);
            this.spinnerService.hide(); // Pastikan spinner dihide bahkan saat error
        }
    });
}

    editPhoto() {
        console.log('masukkkk sini ga siiii');
        this.dialogPhoto = true;
    }

    convertToAPA(text: any): string {
        const author = text.author ? text.author + ', ' : '';
        const year = text.year ? '(' + text.year + '), ' : '';
        const title = text.title ? text.title + ', ' : '';
        const pages = text.pages ? text.pages + ', ' : '';
        const url = text.url ? text.url + ', ' : '';
        console.log('author' + text.author);
        console.log('year' + year);
        return author + year + title + pages + url;
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
        this.getStation(event.id);
    }

    edit() {
        console.log('edit: ' + this.station_id);
        this.router.navigate(['/station-edits', this.station_id]);
        //this.router.navigate(['/station-edits']);
    }

    controllObservation(results: any[]) {
        console.log(JSON.stringify(results));
        for (const result of results) {
            const tittle = result.observed_variable?.text + ' - [Geometry: ' + result.geometry?.name + ']';
            const lastUpdate =
                result.updated_at !== undefined
                    ? this.datepipe.transform(Date.parse(result.updated_at), 'dd-MM-yyyy') +
                      ' by-' +
                      result.updated_by.name
                    : '';
            if (result.programs != null) {
                for (const program of result.programs) {
                    const programNetworks: Program[] = [];
                    programNetworks.push({ id: program.id, desc: program.program_type.text });
                    this.programNetworksMap.set(result.id, programNetworks);
                }
            }
            //deployment
            if (result.deployments != null) {
                for (const deployment of result.deployments) {
                    let tittleDeployment = 'From ' + this.datepipe.transform(Date.parse(deployment.from), 'dd-MM-yyyy');
                    const toDate = this.datepipe.transform(Date.parse(deployment.to), 'dd-MM-yyyy');
                    if (toDate !== null) tittleDeployment = tittleDeployment + ' To ' + toDate;

                    //Table
                    const dataSourceCoordinates = new MatTableDataSource<any>();
                    const dataSourceStatus = new MatTableDataSource<any>();
                    const dataSourceFrequencyPolarization = new MatTableDataSource<any>();
                    const dataSourceTelecomunication = new MatTableDataSource<any>();
                    const dataSourceMaintenance = new MatTableDataSource<any>();
                    const dataSourceQuality = new MatTableDataSource<any>();
                    // Coordinate
                    for (const coor of JSON.parse(JSON.stringify(deployment.instrument?.coordinates))) {
                        coor.geopositioning_name = deployment.instrument?.coordinates.geopositioning_method?.name;
                        const date: any = this.datepipe.transform(Date.parse(coor.from), 'dd-MM-yyyy');
                        if (date != null) coor.from = date;

                        console.log(JSON.stringify(coor));
                        dataSourceCoordinates.data.push(coor);
                    }
                    //Create Tabel Operating Status
                    for (const status of JSON.parse(JSON.stringify(deployment.instrument?.operating_statuses))) {
                        status.instrument_operating_status_desc = deployment.instrument?.operating_statuses?.value;

                        const dateFrom: any = this.datepipe.transform(Date.parse(status.from), 'dd-MM-yyyy');
                        if (dateFrom != null) status.from = dateFrom;

                        const dateTo: any = this.datepipe.transform(Date.parse(status.to), 'dd-MM-yyyy');
                        if (dateTo != null) status.to = dateTo;

                        dataSourceStatus.data.push(status);
                    }
                    //Create Tabel Frequency Polarization
                    for (const polarization of JSON.parse(
                        JSON.stringify(deployment.instrument?.observation_frequency_and_polarization)
                    )) {
                        polarization.frequency_type_desc =
                            deployment.instrument?.observation_frequency_and_polarization.frequency_type?.name;
                        polarization.frequency_unit_desc =
                            deployment.instrument?.observation_frequency_and_polarization.frequency_unit?.value;
                        polarization.bandwidth_unit_desc =
                            deployment.instrument?.observation_frequency_and_polarization.bandwidth_unit?.value;
                        polarization.transmission_desc =
                            deployment.instrument?.observation_frequency_and_polarization.transmission_mode?.name;
                        polarization.polarization_desc =
                            deployment.instrument?.observation_frequency_and_polarization.polarization?.name;

                        dataSourceFrequencyPolarization.data.push(polarization);
                    }

                    //Create Tabel Telecomunication Frequency
                    for (const frquency of JSON.parse(
                        JSON.stringify(deployment.instrument?.telecommunication_frequencies)
                    )) {
                        frquency.frequency_type_desc =
                            deployment.instrument?.telecommunication_frequencies.frequency_type?.name;
                        frquency.frequency_unit_desc =
                            deployment.instrument?.telecommunication_frequencies.frequency_unit?.value;
                        frquency.bandwidth_unit_desc =
                            deployment.instrument?.telecommunication_frequencies.bandwidth_unit?.value;

                        dataSourceTelecomunication.data.push(frquency);
                    }

                    // Create Tabel Maintenance Logbook
                    for (const maintenance of JSON.parse(JSON.stringify(deployment.instrument?.maintenance_logbooks))) {
                        maintenance.maintenance_party_desc =
                            deployment.instrument?.maintenance_logbooks.maintenance_party?.long_name;

                        dataSourceMaintenance.data.push(maintenance);
                    }

                    // Create Tabel Quality Assurance
                    for (const qualitys of JSON.parse(
                        JSON.stringify(deployment.instrument?.quality_assurance_logbooks)
                    )) {
                        // qualitys.location_desc=deployment.instrument?.quality_assurance_logbooks.control_location?.name;
                        // qualitys.standart_desc=deployment.instrument?.quality_assurance_logbooks.control_standard?.name;
                        // // qualitys.activity_desc=deployment.instrument?.quality_assurance_logbooks.instrument_control_result?.name;

                        dataSourceQuality.data.push(qualitys);
                    }

                    if (dataSourceCoordinates.data.length > 0)
                        this.instrumentMap.set(deployment.instrument?.id + '_coordinate', dataSourceCoordinates.data);
                    if (dataSourceStatus.data.length > 0)
                        this.instrumentMap.set(deployment.instrument?.id + '_operating_status', dataSourceStatus.data);
                    if (dataSourceFrequencyPolarization.data.length > 0)
                        this.instrumentMap.set(
                            deployment.instrument?.id + '_frequency_polarization',
                            dataSourceFrequencyPolarization.data
                        );
                    if (dataSourceTelecomunication.data.length > 0)
                        this.instrumentMap.set(
                            deployment.instrument?.id + '_telecomunication_frequency',
                            dataSourceTelecomunication.data
                        );
                    if (dataSourceMaintenance.data.length > 0)
                        this.instrumentMap.set(deployment.instrument?.id + '_maintenance', dataSourceMaintenance.data);
                    if (dataSourceQuality.data.length > 0)
                        this.instrumentMap.set(deployment.instrument?.id + '_quality', dataSourceQuality.data);

                    deployment.tittle = tittleDeployment;
                    if (deployment.data_generation != null) {
                        for (const generation of deployment.data_generation) {
                            let tittleGeneration =
                                'From ' + this.datepipe.transform(Date.parse(generation.from), 'dd-MM-yyyy');
                            const toDateGen = this.datepipe.transform(Date.parse(generation.to), 'dd-MM-yyyy');
                            if (toDateGen !== null) tittleGeneration = tittleGeneration + ' To ' + toDateGen;

                            generation.tittle = tittleGeneration;
                            const time = generation.reporting.schedule.reporting_interval;
                            this.reportingTime.set(generation.id, this.splitTime(time));
                        }
                    }
                    // console.log(result.deployments.tittle);
                }
            }

            result.last_update = lastUpdate;
            const observation = this.observationList.find((o: { content: any }) => o.content.id === result.id);
            if (observation === undefined) {
                //insert
                this.observationList[this.observationList.length] = {
                    tittle,
                    content: result,
                    panelOpenState: true
                };
            } else {
                //update
                // console.log(JSON.stringify(content));
                this.observationList[this.observationList.findIndex(item => item.content.id === result.id)] = {
                    tittle,
                    content: result,
                    panelOpenState: true
                };
                // console.log(JSON.stringify(this.jsonRequest));
            }
            // console.log(JSON.stringify(this.observationList));
        }
    }

    /*download() {
        this.spinnerService.show();
        this.http
            .get(`${environment.app.apiUrl}/api/stations/${this.station_id}/xml`, {
                params: new HttpParams()
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
    */

    download() {
        this.spinnerService.show();
        const filename = this.wigos_id + '.xml';

        this.http
            .get(`${environment.app.apiUrl}/api/stations/${this.station_id}/xml`, {
                params: new HttpParams(),
                responseType: 'blob'
            })
            .subscribe({
                next: x => {
                    // It is necessary to create a new blob object with mime-type explicitly set
                    // otherwise only Chrome works like it should
                    const newBlob = new Blob([x], { type: 'application/xml' });

                    // IE doesn't allow using a blob object directly as link href
                    // instead it is necessary to use msSaveOrOpenBlob
                    /* if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(newBlob);
                        return;
                    }*/

                    // For other browsers:
                    // Create a link pointing to the ObjectURL containing the blob.
                    const data = window.URL.createObjectURL(newBlob);

                    const link = document.createElement('a');
                    link.href = data;
                    link.download = filename;
                    // this is necessary as link.click() does not work on the latest firefox
                    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

                    setTimeout(function () {
                        // For Firefox it is necessary to delay revoking the ObjectURL
                        window.URL.revokeObjectURL(data);
                        link.remove();
                    }, 100);

                    this.spinnerService.hide();
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
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
