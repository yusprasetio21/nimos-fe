import { Station } from '../domain/station';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { ConfirmationService, MessageService, SelectItem, TreeNode } from 'primeng/api';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm, FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { environment } from 'src/environments/environment';
import { cloneDeep } from 'lodash';

import { NodeService } from './nodeservice';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

interface FoodNode {
    index?: number;
    id: number;
    path?: number;
    text: string;
    children?: FoodNode[];
}

interface ExampleFlatNode {
    id: number;
    expandable: boolean;
    text: string;
    level: number;
}
@Component({
    selector: 'app-station-new',
    templateUrl: './station-new.component.html'
})
export class StationNewComponent extends MoreComponent implements OnInit {
    //tree
    private _transformer = (node: FoodNode, level: number) => {
        return {
            id: node.id,
            index: node.index,
            path: node.path,
            expandable: !!node.children && node.children.length > 0,
            text: node.text,
            variable: node.text !== undefined && node.text != null ? node.text.split('>')[1] : '',
            level
        };
    };

    treeControl: FlatTreeControl<ExampleFlatNode>;
    treeFlattener: MatTreeFlattener<FoodNode, any>;
    dataSourceProgram: MatTreeFlatDataSource<FoodNode, any>;
    dataSourceEvent: MatTreeFlatDataSource<FoodNode, any>;

    hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

    treeEvent: any[];
    treeProgram: any[];
    selectedNodes1: any[] = [];
    selectedNode: TreeNode;

    nodeIdEvent: any[];
    nodeNameEvent: any[];

    nodeIdProgram: any[];
    nodeNameProgram: any[];

    //Field
    name: string;
    date_established: Date;
    date_closed: Date;

    datas: any[] = [];
    data: any;
    selectedDatas: any[] = [];

    //Table
    cols: any[] = [];

    assessed_status: SelectItem;
    assessed_statusOptions: SelectItem[];

    decl_status: SelectItem;
    decl_statusOptions: SelectItem[];
    declared_statusOptions: SelectItem[];

    station_type: SelectItem;
    station_typeOptions: SelectItem[];

    region: SelectItem;
    regionOptions: SelectItem[];

    provinsi: SelectItem;
    provinsiOptions: SelectItem[];

    kabupaten: SelectItem;
    kabupatenOptions: SelectItem[];

    kecamatan: SelectItem;
    kecamatanOptions: SelectItem[];

    kelurahan: SelectItem;
    kelurahanOptions: SelectItem[];

    wmo_idOptions: SelectItem[];

    local_typeOptions: SelectItem[];

    usage_typeOptions: SelectItem[];

    //alias
    aliases: any[] = [];
    dialogAlias = false;
    dataFormAlias: FormGroup;

    //WigosStation
    // wigos_stations: any[] = [];
    // dialogWigosStation = false;
    // dataFormWigosStation: FormGroup;

    //country
    countries: any[] = [];
    dialogCountry = false;
    dataFormCountry: FormGroup;
    countryOptions: SelectItem[];

    //Coordinates
    coordinates: any[] = [];
    dialogCoordinates = false;
    dataFormCoordinates: FormGroup;
    geopositioning_methodOptions: SelectItem[];

    //TimeZone
    timezone: any[] = [];
    dialogTimeZone = false;
    dataFormTimeZone: FormGroup;
    timezoneOptions: SelectItem[];

    //SupervisingOrg
    supervising_organization: any[] = [];
    dialogSupervisingOrg = false;
    dataFormSupervisingOrg: FormGroup;
    supervisingOrgOptions: SelectItem[];

    //SiteDesc
    site_description: any[] = [];
    dialogSiteDesc = false;
    dataFormSiteDesc: FormGroup;

    //ClimateZone
    climate_zone: any[] = [];
    dialogClimateZone = false;
    dataFormClimateZone: FormGroup;
    climate_zoneOptions: SelectItem[];

    //Predominant
    predominant_surface_cover: any[] = [];
    dialogPredominant = false;
    dataFormPredominant: FormGroup;
    surface_cover_classification_Options: SelectItem[];
    surface_cover_Options: SelectItem[];

    //SurfaceRoughness
    surface_roughness: any[] = [];
    dialogSurfaceRoughness = false;
    dataFormSurfaceRoughness: FormGroup;
    surface_roughness_Options: SelectItem[];

    //Topography
    topography_bathymetry: any[] = [];
    dialogTopography = false;
    dataFormTopography: FormGroup;
    local_topography_Options: SelectItem[];
    relative_elevation_Options: SelectItem[];
    topographic_context_Options: SelectItem[];
    altitude_depth_Options: SelectItem[];

    //Population
    population: any[] = [];
    dialogPopulation = false;
    dataFormPopulation: FormGroup;

    //PlatformEventLogbook
    platform_event_logbook: any[] = [];
    dialogPlatformEventLogbook = false;
    dataFormPlatformEventLogbook: FormGroup;

    //PhotoGallery
    photo_gallery: any[] = [];
    dialogPhotoGallery = false;
    dataFormPhotoGallery: FormGroup;
    direction_of_view_Options: SelectItem[];
    angle_of_view_Options: SelectItem[];

    //StationUsage
    station_usages: any[] = [];
    dialogStationUsage = false;
    dataFormStationUsage: FormGroup;
    nameStationUsage: any;
    stationUsageOptions: SelectItem[];

    //Affiliation
    program_network_affiliation: any[] = [];
    dialogAffiliation = false;
    dataFormAffiliation: FormGroup;

    //declared_status
    declared_status: any[] = [];
    dialogDeclaredStatus = false;
    dataFormDeclaredStatus: FormGroup;
    declared_status_name: any[];
    declared_status_from: any[];
    declared_status_to: any[];

    //Program Tree
    programTrees: any[] = [];
    dialogProgramTree = false;
    dataFormProgramTree: FormGroup;

    //Event Tree
    eventTrees: any[] = [];
    dialogEventTree = false;

    coordinatorOptions: SelectItem[];
    station_coordinator: any[] = [];
    station: Station = new Station();
    filteredStations: Station[];
    indexHelper = 0;

    minDate: Date;

    public datePipe: DatePipe = new DatePipe(navigator.language);
    idStationUsage: any;
    disabled = true;
    isBasicOptions: any[];
    isBasic = true; //basic
    city: string;

    constructor(
        private fb: FormBuilder,
        //more
        confirmationService: ConfirmationService,
        http: HttpClient,
        public nodeService: NodeService,

        //base
        router: Router,
        messageService: MessageService,
        spinnerService: NgxSpinnerService
    ) {
        super(confirmationService, http, router, messageService, spinnerService);
    }

    ngOnInit(): void {
        this.isBasicOptions = [
            { label: 'Basic', value: true },
            { label: 'Advance', value: false }
        ];
        // this.nodeService.getFilesTreeEvent().then(files => (this.treeEvent = files));
        // this.nodeService.getFilesTreeProgram().then(files => (this.treeProgram = files));
        this.createDataForm(new Station());

        this.local_typeOptions = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/station-local-types?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.local_typeOptions.push({ label: data.name, value: data.id });
                });
            });

        this.usage_typeOptions = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/usage-types?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.usage_typeOptions.push({ label: data.name, value: data.id });
                });
            });

        this.wmo_idOptions = [];
        this.wmo_idOptions.push({ label: 'V - South-West Pacific', value: '7' });

        this.station_typeOptions = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/station-types?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.station_typeOptions.push({ label: data.name, value: data.id });
                });
            });

        this.provinsiOptions = [];
        this.http.get(`${environment.app.apiUrl}/api/provinces`).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.provinsiOptions.push({ label: data.name, value: data.id });
            });
        });

        this.supervisingOrgOptions = [];
        this.http.get(`${environment.app.apiUrl}/api/lists/organizations?filter[id]=${localStorage.getItem('organizationId')}`).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.supervisingOrgOptions.push({ label: data.long_name, value: data.id + '   ' + data.long_name });
            });

            this.state$.next(true);
        });

        this.dataForm.patchValue({ wmo_region_type_id: 'V - South-West Pacific', value: '7' });
        this.dataForm.patchValue({ country_territories: 'Indonesia', value: '100' });

        //tree

        this.treeControl = new FlatTreeControl<ExampleFlatNode>(
            node => node.level,
            node => node.expandable
        );
        this.treeFlattener = new MatTreeFlattener(
            this._transformer,
            node => node.level,
            node => node.expandable,
            node => node.children
        );
        this.dataSourceProgram = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.dataSourceEvent = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.loadDatas();
    }

    treeProgramCopy: any[];
    treeEventCopy: any[];
    loadDatas() {
        // get treefull
        this.http.get<any>(`${environment.app.apiUrl}/api/lists/tree/programs`).subscribe({
            next: data => {
                this.dataSourceProgram.data = JSON.parse(JSON.stringify(data));
                this.treeProgramCopy = JSON.parse(JSON.stringify(data));
            }
        });
        // get treefull
        this.http.get<any>(`${environment.app.apiUrl}/api/lists/tree/platform-events`).subscribe({
            next: data => {
                this.dataSourceEvent.data = JSON.parse(JSON.stringify(data));
                this.treeEventCopy = JSON.parse(JSON.stringify(data));
            }
        });
    }

    onChangeDate(event: any) {
        console.log(event);
        this.minDate = new Date(event);
    }

    onSelectProvinsi(event: any) {
        this.kabupatenOptions = [];
        this.http.get(`${environment.app.apiUrl}/api/cities?filter[province_id]=` + event.value).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.kabupatenOptions.push({ label: data.name, value: data.id });
            });
        });
    }

    onSelectkabupaten(event: any) {
        this.kecamatanOptions = [];
        this.http.get(`${environment.app.apiUrl}/api/districts?filter[city.id]=` + event.value).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.kecamatanOptions.push({ label: data.name, value: data.id });
            });
        });
    }

    onSelectKecamatan(event: any) {
        this.kelurahanOptions = [];
        this.http.get(`${environment.app.apiUrl}/api/villages?filter[district_id]=` + event.value).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.kelurahanOptions.push({ label: data.name, value: data.id });
            });
        });
    }

    createDataForm(data: any) {
        if (data == null) data = new Station();
        this.dataForm = this.fb.group({
            id: new FormControl(data.id),
            name: new FormControl(data.name, Validators.required),
            identifier: new FormControl(data.identifier, Validators.required),
            station_aliases: new FormControl(this.aliases),
            date_established: new FormControl(data.date_established, Validators.required),
            date_closed: new FormControl(data.date_closed),
            // decl_status: new FormControl(data.decl_status),
            // assessed_status: new FormControl(data.assessed_status),
            station_type_id: new FormControl(data.station_type_id, Validators.required),
            station_local_type_id: new FormControl(data.station_local_type_id),
            usage_type_id: new FormControl(data.usage_type_id),
            station_usage: new FormControl(this.station_usages),
            station_coordinator: new FormControl(this.station_coordinator),
            country_territories: new FormControl(data.country_territories),
            // wigos_id: new FormControl(this.wigos_stations),
            // region: new FormControl(data.region),
            wmo_region_type_id: new FormControl(data.wmo_region_type_id),
            coordinates: new FormControl(this.coordinates),
            timezones: new FormControl(this.timezone),
            supervising_organizations: new FormControl(this.supervising_organization),
            station_url: new FormControl(data.station_url),
            other_url: new FormControl(data.other_url),
            site_descriptions: new FormControl(this.site_description),
            climate_zones: new FormControl(this.climate_zone),
            predominant_surface_covers: new FormControl(this.predominant_surface_cover),
            surface_roughnesses: new FormControl(this.surface_roughness),
            topography_bathymetries: new FormControl(this.topography_bathymetry),
            populations: new FormControl(this.population),
            platform_event_logbooks: new FormControl(this.platform_event_logbook),
            photo_gallery: new FormControl(this.photo_gallery),
            province_id: new FormControl(data.province_id),
            city_id: new FormControl(data.city_id),
            district_id: new FormControl(data.district_id),
            village_id: new FormControl(data.village_id),
            address: new FormControl(data.address),
            program_network_affiliations: new FormControl(this.program_network_affiliation)
        });
    }

    saveAll() {
        this.dataForm.patchValue({ wmo_region_type_id: '7' });

        console.log("========"+this.supervising_organization.length)
        if (this.supervising_organization.length = 0){

            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Supervising Organization not null',
                life: 3000
            });
        }
        //this.changeValueInJson('id', null, this.dataForm.value);

        const stationReq = cloneDeep(this.dataForm.value);

        this.deleteKeyInJson('id', stationReq);

        this.program_network_affiliation.map(data1 => {
            if (data1.declared_status_name != null || data1.declared_status_name == null) {
                delete data1.declared_status_name;
            }
            if (data1.declared_status_from != null || data1.declared_status_from == null) {
                delete data1.declared_status_from;
            }
            if (data1.declared_status_to != null || data1.declared_status_to == null) {
                delete data1.declared_status_to;
            }
            return data1;
        });

        const data = JSON.stringify(stationReq);

        console.log('save: ' + data);

        //this._store('api/stations', data);
        this.spinnerService.show();
        this.http.post(`${environment.app.apiUrl}/api/stations`, data).subscribe({
            next: resp => {
                const stationResp = resp as any;
                this._generateMsg('success', 'Successful', 'Data is saved successfully');
                this.spinnerService.hide(); //aneh kalau sebelum _generateMsg, tetap loading
                this.state$.next(true);
                setTimeout(() => {
                    this.router.navigate(['/station-edits', stationResp.id]);
                }, 1000);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    saveAllPhoto() {
        this.dataForm.patchValue({ wmo_region_type_id: '7' });

        if (this.supervising_organization.length === 0){
            this._generateMsg('error', 'Error Message', 'Supervising Organization not null');
            return;
        }
        if (this.coordinates.length === 0){
            this._generateMsg('error', 'Error Message', 'Coordinates not null');
            return;
        }
        if (this.timezone.length === 0){
            this._generateMsg('error', 'Error Message', 'Timezone not null');
            return;
        }

        const stationReq = cloneDeep(this.dataForm.value);

        this.deleteKeyInJson('id', stationReq);

        console.log('save: ' + JSON.stringify(stationReq));

        const formData = new FormData();

        this.buildFormData(formData, stationReq);

        console.log('length: ' + stationReq.photo_gallery.length);
        for (let i = 0; i < stationReq.photo_gallery.length; i++) {
            if (stationReq.photo_gallery[i].id) {
                formData.append('photo_gallery[' + i + '][id]', stationReq.photo_gallery[i].id);
            } else {
                formData.append('photo_gallery[' + i + '][photo]', stationReq.photo_gallery[i].fileSource);
            }
            formData.append('photo_gallery[' + i + '][caption]', stationReq.photo_gallery[i].caption);
            formData.append(
                'photo_gallery[' + i + '][direction_of_view_id]',
                stationReq.photo_gallery[i].direction_of_view_id
            );
            if (stationReq.photo_gallery[i].angle_of_view_id != null){
                formData.append('photo_gallery[' + i + '][angle_of_view_id]', stationReq.photo_gallery[i].angle_of_view_id);
            }
            formData.append('photo_gallery[' + i + '][owner]', stationReq.photo_gallery[i].owner);
            if (stationReq.photo_gallery[i].date_taken) {
                formData.append(
                    'photo_gallery[' + i + '][date_taken]',
                    new Date(stationReq.photo_gallery[i].date_taken).toISOString()
                );
            }
        }

        /*
        formData.append('id', stationReq.id);
        formData.append('name', stationReq.name);
        formData.append('identifier', stationReq.identifier);
        formData.append('station_aliases', stationReq.station_aliases);
        const dateEsta = new Date(stationReq.date_established).toISOString();
        formData.append('date_established', dateEsta);
        console.log('date esta : ' + dateEsta);
        if (stationReq.date_closed != null) {
            const dateClos = new Date(stationReq.date_closed).toISOString();
            formData.append('date_closed', dateClos);
        }

        console.log('stationReq.station_usage: ' + stationReq.station_usage);
        console.log('stationReq.station_usage: ' + JSON.stringify(stationReq.station_usage));

        formData.append(
            'station_type_id',
            stationReq.station_type_id ? new Blob([stationReq.station_type_id]) : new Blob()
        );
        formData.append('station_local_type_id', new Blob(stationReq.station_local_type_id));
        formData.append('usage_type_id', new Blob(stationReq.usage_type_id));
        formData.append('station_usage', new Blob(stationReq.station_usage));
        formData.append('station_coordinator', new Blob(stationReq.station_coordinator));
        formData.append('country_territories', new Blob(stationReq.country_territories));
        formData.append('wmo_region_type_id', new Blob(stationReq.wmo_region_type_id));
        formData.append('coordinates', new Blob(stationReq.coordinates));
        formData.append('timezones', new Blob(stationReq.timezones));
        formData.append('supervising_organizations', new Blob(stationReq.supervising_organizations));
        formData.append('station_url', new Blob(stationReq.station_url));
        formData.append('other_url', new Blob(stationReq.other_url));
        formData.append('site_descriptions', new Blob(stationReq.site_descriptions));
        formData.append('climate_zones', new Blob(stationReq.climate_zones));
        formData.append('predominant_surface_covers', new Blob(stationReq.predominant_surface_covers));
        formData.append('surface_roughnesses', new Blob(stationReq.surface_roughnesses));
        formData.append('topography_bathymetries', new Blob(stationReq.topography_bathymetries));
        formData.append('populations', new Blob(stationReq.populations));
        formData.append('platform_event_logbooks', new Blob(stationReq.platform_event_logbooks));
        formData.append('province_id', new Blob(stationReq.province_id));
        formData.append('city_id', new Blob(stationReq.city_id));
        formData.append('district_id', new Blob(stationReq.district_id));
        formData.append('village_id', new Blob(stationReq.village_id));
        formData.append('address', new Blob(stationReq.address));
        formData.append('program_network_affiliations', new Blob(stationReq.program_network_affiliations));
        */
        console.log('FORM DATA ===' + JSON.stringify(formData));
        this.spinnerService.show();
        this.http.post(`${environment.app.apiUrl}/api/stations`, formData).subscribe({
            next: resp => {
                const stationResp = resp as any;
                this._generateMsg('success', 'Successful', 'Data is saved successfully');
                this.spinnerService.hide(); //aneh kalau sebelum _generateMsg, tetap loading
                this.state$.next(true);
                setTimeout(() => {
                    this.router.navigate(['/station-edits', stationResp.id]);
                }, 1000);
            },
            error: err => {
                this._errorHandler(err);
            }
        });
    }

    selectStationCoordinator(event: any) {
        this.station_coordinator.push(event.id);
    }

    filterStation(event: any) {
        this.spinnerService.show();
        this.http
            .get(`${environment.app.apiUrl}/api/lists/stations`, {
                params: new HttpParams()
                    .append('filter[name]', '' + event.query + '')
                    .append('fields[stations]', 'id' + ',' + 'name')
            })
            .subscribe({
                next: respons => {
                    this.filteredStations = respons as Station[];
                    this.spinnerService.hide();
                    this.state$.next(true);
                    this.spinnerService.hide();
                },

                error: err => {
                    this._errorHandler(err);
                }
            });
    }

    // Begin Alias
    addAlias() {
        this.dialogAlias = true;
        this.submitted = false;
        this.newData = true;
        this.createDataFormAlias(null);
    }

    editAlias(data: any) {
        this.dialogAlias = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormAlias(data);
    }

    createDataFormAlias(data: any) {
        if (data == null) data = new Object();
        this.dataFormAlias = this.fb.group({
            id: new FormControl(data.id),
            name: new FormControl(data.name, Validators.required)
        });
    }

    deleteAliasWithConfirm(data: any) {
        this.submitted = false;
        console.log(data + '---' + JSON.stringify(data));
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.name_alias + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.aliases = this.aliases.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    saveAlias() {
        if (!this.dataFormAlias.controls.id.value) {
            this.dataFormAlias.patchValue({ id: '_' + this.indexHelper++ });
        }
        this.aliases = this._updateTableDisplay(this.aliases, this.dataFormAlias.value);
        this.dialogAlias = false;
        this.createDataFormAlias(null);
    }

    //Begin StationUsage
    editStationUsage(data: any) {
        this.dialogStationUsage = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormStationUsage(data);
    }

    deleteStationUsageWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.station_usage + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.station_usages = this.station_usages.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    selectStationUsage(event: any) {
        console.log(JSON.stringify(event));
        this.dataFormStationUsage.patchValue({ station_usage_name: event.name });
        this.dataFormStationUsage.patchValue({ station_usage_id: event.id });
    }

    addStationUsage() {
        this.dialogStationUsage = true;
        this.submitted = false;
        this.newData = true;

        // this.stationUsageOptions = [];
        // this.http.get(`${environment.app.apiUrl}/api/lists/stations`).subscribe(resp => {
        //     const datas = resp as any[];
        //     datas.forEach(data => {
        //         this.stationUsageOptions.push({label: data.name, value: data.id+" "+data.name});
        //     });
        // });

        this.createDataFormStationUsage(null);
    }

    createDataFormStationUsage(data: any) {
        if (data == null) data = new Object();
        this.dataFormStationUsage = this.fb.group({
            id: new FormControl(data.id),
            station_usage_id: new FormControl(data.station_usage_id),
            station_usage_name: new FormControl(data.station_usage_name),
            station_usage: new FormControl(data.station_usage, Validators.required)
        });
    }

    saveStationUsage() {
        console.log(JSON.stringify(this.dataFormStationUsage.value));
        if (!this.dataFormStationUsage.controls.id.value) {
            this.dataFormStationUsage.patchValue({ id: '_' + this.indexHelper++ });
        }
        this.station_usages = this._updateTableDisplay(this.station_usages, this.dataFormStationUsage.value);

        // for (const value of this.station_usages) {
        //     if (value.station_usage != null) {
        //         value.station_usage_name = this.nameStationUsage;
        //         value.station_usage_id = this.idStationUsage;
        //     }
        // }
        console.log(JSON.stringify(this.station_usages));
        this.dialogStationUsage = false;
        this.createDataFormStationUsage(null);
    }

    //Begin Country
    editCountry(data: any) {
        this.dialogCountry = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormCountry(data);
    }

    deleteCountryWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.name_country + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.countries = this.countries.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addCountry() {
        this.dialogCountry = true;

        this.submitted = false;
        this.newData = true;
        this.countryOptions = [];
        this.countryOptions.push({ label: 'Indonesia', value: '100' });

        this.createDataFormCountry(null);
    }

    createDataFormCountry(data: any) {
        if (data == null) data = new Object();
        this.dataFormCountry = this.fb.group({
            id: new FormControl(data.id),
            country_id: new FormControl(data.country_id),
            country_name: new FormControl(data.country_name, Validators.required),
            from: new FormControl(data.from ? new Date(data.from) : null, Validators.required),
            fromStr: ''
        });
    }

    saveCountry() {
        if (!this.dataFormCountry.controls.id.value) {
            this.dataFormCountry.patchValue({ id: '_' + this.indexHelper++ });
        }
        this.countries = this._updateTableDisplay(this.countries, this.dataFormCountry.value);
        for (const value of this.countries) {
            if (value.country_id === '100') {
                value.country_name = 'Indonesia';
            }
        }
        console.log(JSON.stringify(this.dataFormCountry.value));
        console.log(JSON.stringify(this.countries));
        this.dialogCountry = false;
        this.createDataFormCountry(null);
    }

    //Begin Coordinates

    editCoordinates(data: any) {
        this.dialogCoordinates = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormCoordinates(data);
    }

    deleteCoordinatesWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.latitude + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.coordinates = this.coordinates.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addCoordinates() {
        this.dialogCoordinates = true;
        this.submitted = false;
        this.newData = true;

        this.geopositioning_methodOptions = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/geopositioning-methods?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.geopositioning_methodOptions.push({ label: data.name, value: data.id + '     ' + data.name });
                });
            });

        this.createDataFormCoordinates(null);
    }

    createDataFormCoordinates(data: any) {
        if (data == null) data = new Object();
        this.dataFormCoordinates = this.fb.group({
            id: new FormControl(data.id),
            latitude: new FormControl(data.latitude, Validators.required),
            longitude: new FormControl(data.longitude, Validators.required),
            station_elevation: new FormControl(data.station_elevation, Validators.required),
            geopositioning_method: new FormControl(data.geopositioning_method, Validators.required),
            geopositioning_method_id: new FormControl(data.geopositioning_method_id),
            geopositioning_method_name: new FormControl(data.geopositioning_method_name),
            from: new FormControl(data.from ? new Date(data.from) : null, Validators.required),
            fromStr: ''
        });
    }

    saveCoordinates() {
        if (!this.dataFormCoordinates.controls.id.value) {
            this.dataFormCoordinates.patchValue({ id: '_' + this.indexHelper++ });
        }
        const from = this.dataFormCoordinates.controls.from.value;
        if (from) {
            this.dataFormCoordinates.patchValue({
                from: from instanceof Date ? from : new Date(this._formatDMYtoYMD(from)),
                
            });
        }

        console.log('this.dataFormCoordinates.value: ' + JSON.stringify(this.coordinates));
        console.log(JSON.stringify(this.dataFormCoordinates.value));
        this.coordinates = this._updateTableDisplay(this.coordinates, this.dataFormCoordinates.value);
        for (const value of this.coordinates) {
            if (value.geopositioning_method != null) {
                const geopositioningMethods = value.geopositioning_method;
                value.geopositioning_method_name = geopositioningMethods.substring(5).trim();
                value.geopositioning_method_id = geopositioningMethods.substring(0,5).trim();
            }
        }
        this.dialogCoordinates = false;
        this.createDataFormCoordinates(null);
    }

    //Begin Time Zone
    editTimeZone(data: any) {
        this.dialogTimeZone = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormTimeZone(data);
    }

    deleteTimeZonesWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.timezone + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.timezone = this.timezone.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addTimeZone() {
        this.dialogTimeZone = true;
        this.submitted = false;
        this.newData = true;

        this.timezoneOptions = [];
        this.http.get(`${environment.app.apiUrl}/api/lists/types/timezones?filter[name]=Indonesia`).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.timezoneOptions.push({ label: 'UTC ' + data.gmt, value: data.id + '     ' + data.gmt });
            });
        });

        this.createDataFormTimeZone(null);
    }

    createDataFormTimeZone(data: any) {
        if (data == null) data = new Object();
        this.dataFormTimeZone = this.fb.group({
            id: new FormControl(data.id),
            timezone: new FormControl(data.timezone, Validators.required),
            timezone_id: new FormControl(data.timezone_id),
            timezone_name: new FormControl(data.timezone_name),
            from: new FormControl(data.from ? new Date(data.from) : null, Validators.required),
            fromStr: ''
        });
    }

    saveTimeZone() {
        if (!this.dataFormTimeZone.controls.id.value) {
            this.dataFormTimeZone.patchValue({ id: '_' + this.indexHelper++ });
        }
        const from = this.dataFormTimeZone.controls.from.value;
        if (from) {
            this.dataFormTimeZone.patchValue({
                from: from instanceof Date ? from : new Date(this._formatDMYtoYMD(from)),
                
            });
        }
        this.timezone = this._updateTableDisplay(this.timezone, this.dataFormTimeZone.value);
        for (const value of this.timezone) {
            if (value.timezone != null) {
                const timezones = value.timezone;
                value.timezone_name = timezones.substring(5).trim();
                value.timezone_id = timezones.substring(0,5).trim();
            }
        }
        this.dialogTimeZone = false;
        this.createDataFormTimeZone(null);
    }

    //Begin Supervising Org
    editSupervisingOrg(data: any) {
        this.dialogSupervisingOrg = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormSupervisingOrg(data);
    }

    deleteSupervisingOrgWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.supervising_organization = this.supervising_organization.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addSupervisingOrg() {
        this.dialogSupervisingOrg = true;
        this.submitted = false;
        this.newData = true;

        this.createDataFormSupervisingOrg(null);
    }

    createDataFormSupervisingOrg(data: any) {
        if (data == null) data = new Object();
        this.dataFormSupervisingOrg = this.fb.group({
            id: new FormControl(data.id),
            organization: new FormControl(data.organization, Validators.required),
            organization_name: new FormControl(data.organization_name),
            organization_id: new FormControl(data.organization_id),
            from: new FormControl(data.from ? new Date(data.from) : null, Validators.required),
            fromStr: ''
        });
    }

    saveSupervisingOrg() {
        if (!this.dataFormSupervisingOrg.controls.id.value) {
            this.dataFormSupervisingOrg.patchValue({ id: '_' + this.indexHelper++ });
        }
        const from = this.dataFormSupervisingOrg.controls.from.value;
        if (from) {
            this.dataFormSupervisingOrg.patchValue({
                from: from instanceof Date ? from : new Date(this._formatDMYtoYMD(from)),
                
            });
        }
        this.supervising_organization = this._updateTableDisplay(
            this.supervising_organization,
            this.dataFormSupervisingOrg.value
        );
        for (const value of this.supervising_organization) {
            if (value.organization != null) {
                const organizations = value.organization;
                value.organization_name = organizations.substring(4).trim();
                value.organization_id = organizations.substring(0, 4).trim();
            }
        }
        this.dialogSupervisingOrg = false;
        this.createDataFormSupervisingOrg(null);
    }

    //Begin SiteDesc
    editSiteDesc(data: any) {
        this.dialogSiteDesc = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormSiteDesc(data);
    }

    deleteSiteDescWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.site_description + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.site_description = this.site_description.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addSiteDesc() {
        this.dialogSiteDesc = true;
        this.submitted = false;
        this.newData = true;
        this.createDataFormSiteDesc(null);
    }

    createDataFormSiteDesc(data: any) {
        if (data == null) data = new Object();
        this.dataFormSiteDesc = this.fb.group({
            id: new FormControl(data.id),
            value: new FormControl(data.value, Validators.required),
            from: new FormControl(data.from ? new Date(data.from) : null, Validators.required),
            fromStr: ''
        });
    }

    saveSiteDesc() {
        if (!this.dataFormSiteDesc.controls.id.value) {
            this.dataFormSiteDesc.patchValue({ id: '_' + this.indexHelper++ });
        }
        const from = this.dataFormSiteDesc.controls.from.value;
        if (from) {
            this.dataFormSiteDesc.patchValue({
                from: from instanceof Date ? from : new Date(this._formatDMYtoYMD(from)),
                
            });
        }
        this.site_description = this._updateTableDisplay(this.site_description, this.dataFormSiteDesc.value);
        this.dialogSiteDesc = false;
        this.createDataFormSiteDesc(null);
    }

    //Begin ClimateZone
    editClimateZone(data: any) {
        this.dialogClimateZone = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormClimateZone(data);
    }

    deleteClimateZoneWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.climate_zone + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.climate_zone = this.climate_zone.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addClimateZone() {
        this.dialogClimateZone = true;
        this.submitted = false;
        this.newData = true;

        this.climate_zoneOptions = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/climate-zones?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.climate_zoneOptions.push({ label: data.description, value: data.id + '     ' + data.description });
                });
            });

        this.createDataFormClimateZone(null);
    }

    createDataFormClimateZone(data: any) {
        if (data == null) data = new Object();
        this.dataFormClimateZone = this.fb.group({
            id: new FormControl(data.id),
            climate_zone: new FormControl(data.climate_zone, Validators.required),
            climate_zone_id: new FormControl(data.climate_zone_id),
            climate_zone_name: new FormControl(data.climate_zone_name),
            from: new FormControl(data.from ? new Date(data.from) : null, Validators.required),
            fromStr: ''
        });
    }

    saveClimateZone() {
        if (!this.dataFormClimateZone.controls.id.value) {
            this.dataFormClimateZone.patchValue({ id: '_' + this.indexHelper++ });
        }
        const from = this.dataFormClimateZone.controls.from.value;
        if (from) {
            this.dataFormClimateZone.patchValue({
                from: from instanceof Date ? from : new Date(this._formatDMYtoYMD(from)),
                
            });
        }
        this.climate_zone = this._updateTableDisplay(this.climate_zone, this.dataFormClimateZone.value);
        for (const value of this.climate_zone) {
            if (value.climate_zone != null) {
                const climateZones = value.climate_zone;
                value.climate_zone_name = climateZones.substring(5).trim();
                value.climate_zone_id = climateZones.substring(0,5).trim();
            }
        }
        this.dialogClimateZone = false;
        this.createDataFormClimateZone(null);
    }

    // Begin Predominant
    editPredominant(data: any) {
        console.log(JSON.stringify(data));

        this.dialogPredominant = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormPredominant(data);
    }

    deletePredominantWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.surface_cover_classification + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.predominant_surface_cover = this.predominant_surface_cover.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addPredominant() {
        this.dialogPredominant = true;
        this.submitted = false;
        this.newData = true;

        this.surface_cover_classification_Options = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/surface-cover-classifications?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.surface_cover_classification_Options.push({
                        label: data.name,
                        value: data.id + '     ' + data.name
                    });
                });
            });

        this.createDataFormPredominant(null);
    }

    onSelectSurfaceCover(event: any) {
        const value = event.value.substring(0, 2);
        this.surface_cover_Options = [];
        this.http
            .get(
                `${environment.app.apiUrl}/api/lists/types/surface-cover-types?filter[lang]=${this.lang}&filter[type]=` +
                    value
            )
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.surface_cover_Options.push({ label: data.name, value: data.id + '     ' + data.name });
                });
            });
    }

    createDataFormPredominant(data: any) {
        if (data == null) data = new Object();
        this.dataFormPredominant = this.fb.group({
            id: new FormControl(data.id),
            surface_cover_classification: new FormControl(data.surface_cover_classification, Validators.required),
            surface_cover_classification_id: new FormControl(data.surface_cover_classification_id),
            surface_cover_classification_name: new FormControl(data.surface_cover_classification_name),
            surface_cover: new FormControl(data.surface_cover, Validators.required),
            surface_cover_id: new FormControl(data.surface_cover_id),
            surface_cover_name: new FormControl(data.surface_cover_name),
            from: new FormControl(data.from ? new Date(data.from) : null, Validators.required),
            fromStr: ''
        });
    }
    savePredominant() {
        if (!this.dataFormPredominant.controls.id.value) {
            this.dataFormPredominant.patchValue({ id: '_' + this.indexHelper++ });
        }
        const from = this.dataFormPredominant.controls.from.value;
        if (from) {
            this.dataFormPredominant.patchValue({
                from: from instanceof Date ? from : new Date(this._formatDMYtoYMD(from)),
                
            });
        }
        this.predominant_surface_cover = this._updateTableDisplay(
            this.predominant_surface_cover,
            this.dataFormPredominant.value
        );
        for (const value of this.predominant_surface_cover) {
            if (value.surface_cover_classification != null) {
                const surfaceCoverClassifications = value.surface_cover_classification;
                value.surface_cover_classification_name = surfaceCoverClassifications.substring(5).trim();
                value.surface_cover_classification_id = surfaceCoverClassifications.substring(0,5).trim();
            }
            if (value.surface_cover != null) {
                const surfaceCovers = value.surface_cover;
                value.surface_cover_name = surfaceCovers.substring(5).trim();
                value.surface_cover_id = surfaceCovers.substring(0,5).trim();
            }
        }
        console.log(JSON.stringify(this.predominant_surface_cover));
        this.dialogPredominant = false;
        this.createDataFormPredominant(null);
    }

    // Begin Surface Roughness
    editSurfaceRoughness(data: any) {
        this.dialogSurfaceRoughness = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormSurfaceRoughness(data);
    }

    deleteSurfaceRoughnessWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.surface_roughness + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.surface_roughness = this.surface_roughness.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addSurfaceRoughness() {
        this.dialogSurfaceRoughness = true;
        this.submitted = false;
        this.newData = true;

        this.surface_roughness_Options = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/surface-roughness-types?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.surface_roughness_Options.push({ label: data.name, value: data.id + '     ' + data.name });
                });
            });

        this.createDataFormSurfaceRoughness(null);
    }

    createDataFormSurfaceRoughness(data: any) {
        if (data == null) data = new Object();
        this.dataFormSurfaceRoughness = this.fb.group({
            id: new FormControl(data.id),
            surface_roughness: new FormControl(data.surface_roughness, Validators.required),
            surface_roughness_id: new FormControl(data.surface_roughness_id),
            surface_roughness_name: new FormControl(data.surface_roughness_name),
            from: new FormControl(data.from ? new Date(data.from) : null, Validators.required),
            fromStr: ''
        });
    }
    saveSurfaceRoughness() {
        if (!this.dataFormSurfaceRoughness.controls.id.value) {
            this.dataFormSurfaceRoughness.patchValue({ id: '_' + this.indexHelper++ });
        }
        const from = this.dataFormSurfaceRoughness.controls.from.value;
        if (from) {
            this.dataFormSurfaceRoughness.patchValue({
                from: from instanceof Date ? from : new Date(this._formatDMYtoYMD(from)),
                
            });
        }
        this.surface_roughness = this._updateTableDisplay(this.surface_roughness, this.dataFormSurfaceRoughness.value);
        for (const value of this.surface_roughness) {
            if (value.surface_roughness != null) {
                const surfaceRoughnesss = value.surface_roughness;
                value.surface_roughness_name = surfaceRoughnesss.substring(5).trim();
                value.surface_roughness_id = surfaceRoughnesss.substring(0,5).trim();
            }
        }
        this.dialogSurfaceRoughness = false;
        this.createDataFormSurfaceRoughness(null);
    }

    // Begin Topography or Bathymetry
    editTopography(data: any) {
        this.dialogTopography = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormTopography(data);
    }

    deleteTopographyWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.local_topography + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.topography_bathymetry = this.topography_bathymetry.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addTopography() {
        this.dialogTopography = true;
        this.submitted = false;
        this.newData = true;

        this.local_topography_Options = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/local-topographies?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.local_topography_Options.push({
                        label: data.name + '     ' + data.description,
                        value: data.id + '     ' + data.name
                    });
                });
            });

        this.relative_elevation_Options = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/relative-elevations?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.relative_elevation_Options.push({
                        label: data.name + '     ' + data.description,
                        value: data.id + '     ' + data.name
                    });
                });
            });

        this.topographic_context_Options = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/topographic-contexts?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.topographic_context_Options.push({
                        label: data.name + '     ' + data.description,
                        value: data.id + '     ' + data.name
                    });
                });
            });

        this.altitude_depth_Options = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/altitude-depths?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.altitude_depth_Options.push({
                        label: data.name + '     ' + data.description,
                        value: data.id + '     ' + data.name
                    });
                });
            });

        this.createDataFormTopography(null);
    }

    createDataFormTopography(data: any) {
        if (data == null) data = new Object();
        this.dataFormTopography = this.fb.group({
            id: new FormControl(data.id),
            local_topography: new FormControl(data.local_topography, Validators.required),
            local_topography_id: new FormControl(data.local_topography_id),
            local_topography_name: new FormControl(data.local_topography_name),
            relative_elevation: new FormControl(data.relative_elevation, Validators.required),
            relative_elevation_id: new FormControl(data.relative_elevation_id),
            relative_elevation_name: new FormControl(data.relative_elevation_name),
            topographic_context: new FormControl(data.topographic_context, Validators.required),
            topographic_context_id: new FormControl(data.topographic_context_id),
            topographic_context_name: new FormControl(data.topographic_context_name),
            altitude_depth: new FormControl(data.altitude_depth, Validators.required),
            altitude_depth_id: new FormControl(data.altitude_depth_id),
            altitude_depth_name: new FormControl(data.altitude_depth_name),
            from: new FormControl(data.from ? new Date(data.from) : null, Validators.required),
            fromStr: ''
        });
    }
    saveTopography() {
        if (!this.dataFormTopography.controls.id.value) {
            this.dataFormTopography.patchValue({ id: '_' + this.indexHelper++ });
        }
        const from = this.dataFormTopography.controls.from.value;
        if (from) {
            this.dataFormTopography.patchValue({
                from: from instanceof Date ? from : new Date(this._formatDMYtoYMD(from)),
                
            });
        }
        this.topography_bathymetry = this._updateTableDisplay(
            this.topography_bathymetry,
            this.dataFormTopography.value
        );
        for (const value of this.topography_bathymetry) {
            if (value.local_topography != null) {
                const localTopographys = value.local_topography;
                value.local_topography_name = localTopographys.substring(5).trim();
                value.local_topography_id = localTopographys.substring(0,5).trim();
            }
            if (value.relative_elevation != null) {
                const relativeElevations = value.relative_elevation;
                value.relative_elevation_name = relativeElevations.substring(5).trim();
                value.relative_elevation_id = relativeElevations.substring(0,5).trim();
            }
            if (value.topographic_context != null) {
                const topographicContexts = value.topographic_context;
                value.topographic_context_name = topographicContexts.substring(5).trim();
                value.topographic_context_id = topographicContexts.substring(0,5).trim();
            }
            if (value.altitude_depth != null) {
                const altitudeDepths = value.altitude_depth;
                value.altitude_depth_name = altitudeDepths.substring(5).trim();
                value.altitude_depth_id = altitudeDepths.substring(0,5).trim();
            }
        }
        this.dialogTopography = false;
        this.createDataFormTopography(null);
    }

    // Begin Population
    editPopulation(data: any) {
        this.dialogPopulation = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormPopulation(data);
    }

    deletePopulationWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.population_10_km + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.population = this.population.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addPopulation() {
        this.dialogPopulation = true;
        this.submitted = false;
        this.newData = true;
        this.createDataFormPopulation(null);
    }

    createDataFormPopulation(data: any) {
        if (data == null) data = new Object();
        this.dataFormPopulation = this.fb.group({
            id: new FormControl(data.id),
            population_in_10km: new FormControl(data.population_in_10km, Validators.required),
            population_in_50km: new FormControl(data.population_in_50km, Validators.required),
            from: new FormControl(data.from ? new Date(data.from) : null, Validators.required),
            fromStr: ''
        });
    }
    savePopulation() {
        if (!this.dataFormPopulation.controls.id.value) {
            this.dataFormPopulation.patchValue({ id: '_' + this.indexHelper++ });
        }
        const from = this.dataFormPopulation.controls.from.value;
        if (from) {
            this.dataFormPopulation.patchValue({
                from: from instanceof Date ? from : new Date(this._formatDMYtoYMD(from)),
                
            });
        }
        this.population = this._updateTableDisplay(this.population, this.dataFormPopulation.value);
        this.dialogPopulation = false;
        this.createDataFormPopulation(null);
    }

    // Begin PlatformEventLogbook
    editPlatformEventLogbook(data: any) {
        this.dialogPlatformEventLogbook = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormPlatformEventLogbook(data);
    }

    deletePlatformEventLogbookWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.on_from + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.platform_event_logbook = this.platform_event_logbook.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addPlatformEventLogbook() {
        this.dialogPlatformEventLogbook = true;
        this.submitted = false;
        this.newData = true;
        this.createDataFormPlatformEventLogbook(null);
    }

    createDataFormPlatformEventLogbook(data: any) {
        const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
        if (data == null) data = new Object();
        this.dataFormPlatformEventLogbook = this.fb.group({
            id: new FormControl(data.id),
            from: new FormControl(data.from ? new Date(data.from) : null, Validators.required),
            fromStr: '',
            to: new FormControl(data.to),
            // platform_event: new FormControl(data.platform_event, Validators.required),
            platform_event_id: new FormControl(data.platform_event_id),
            platform_event_name: new FormControl(data.platform_event_name, Validators.required),
            description: new FormControl(data.description),
            author: new FormControl(data.author),
            online_reference: new FormControl(data.online_reference, Validators.pattern(reg))
        });
    }

    // nodeSelectEvent(event: any) {
    //     console.log('MASUK SINI GA');
    //     this.nodeIdEvent = event.node.id;
    //     this.nodeNameEvent = event.node.label;
    // }
    // nodeUnselectEvent(event: any) {
    //     console.log('MASUK SINI GA UN SELECT');
    //     console.log(JSON.stringify(event));
    // }

    savePlatformEventLogbook() {
        if (!this.dataFormPlatformEventLogbook.controls.id.value) {
            this.dataFormPlatformEventLogbook.patchValue({ id: '_' + this.indexHelper++ });
        }
        const from = this.dataFormPlatformEventLogbook.controls.from.value;
        if (from) {
            this.dataFormPlatformEventLogbook.patchValue({
                from: from instanceof Date ? from : new Date(this._formatDMYtoYMD(from)),
                
            });
        }
        this.platform_event_logbook = this._updateTableDisplay(
            this.platform_event_logbook,
            this.dataFormPlatformEventLogbook.value
        );

        // for (const value of this.platform_event_logbook) {
        //     if (value.platform_event != null) {
        //         value.platform_event_id = this.nodeIdEvent;
        //         value.platform_event_name = this.nodeNameEvent;
        //     }
        // }
        this.dialogPlatformEventLogbook = false;
        console.log(this.platform_event_logbook);
        this.createDataFormPlatformEventLogbook(null);
    }

    // Begin photo_gallery
    editPhotoGallery(data: any) {
        this.dialogPhotoGallery = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormPhotoGallery(data);
    }

    deletePhotoGalleryWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.photo_caption + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.photo_gallery = this.photo_gallery.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addPhotoGallery() {
        this.dialogPhotoGallery = true;
        this.submitted = false;
        this.newData = true;

        this.direction_of_view_Options = [];
        this.http.get(`${environment.app.apiUrl}/api/lists/types/direction-of-views`).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.direction_of_view_Options.push({ label: data.name, value: data.id + '     ' + data.name });
            });
        });

        this.angle_of_view_Options = [];
        this.http.get(`${environment.app.apiUrl}/api/lists/types/angle-of-views`).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.angle_of_view_Options.push({
                    label: data.value + '     ' + data.description,
                    value: data.id + '     ' + data.value + '     ' + data.description
                });
            });
        });
        this.createDataFormPhotoGallery(null);
    }

    createDataFormPhotoGallery(data: any) {
        if (data == null) data = new Object();
        this.dataFormPhotoGallery = this.fb.group({
            id: new FormControl(data.id),
            photo: new FormControl(''),
            caption: new FormControl(data.caption, Validators.required),
            date_taken: new FormControl(data.date_taken, Validators.required),
            direction_of_view: new FormControl(data.direction_of_view, Validators.required),
            direction_of_view_id: new FormControl(data.direction_of_view_id),
            direction_of_view_name: new FormControl(data.direction_of_view_name),
            angle_of_view: new FormControl(data.angle_of_view),
            angle_of_view_id: new FormControl(data.angle_of_view_id),
            angle_of_view_name: new FormControl(data.angle_of_view_name),
            owner: new FormControl(data.owner, Validators.required),
            fileSource: new FormControl('')
        });
    }

    onFileChange(event: any) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            console.log('file' + file);
            this.dataFormPhotoGallery.patchValue({
                fileSource: file
            });
        }
    }

    savePhotoGallery() {
        if (!this.dataFormPhotoGallery.controls.id.value) {
            this.dataFormPhotoGallery.patchValue({ id: '_' + this.indexHelper++ });
        }
        const date_taken = this.dataFormPhotoGallery.controls.date_taken.value;
        if (date_taken) {
            this.dataFormPhotoGallery.patchValue({
                date_taken: date_taken instanceof Date ? date_taken : new Date(this._formatDMYtoYMD(date_taken)),
                fromStr: date_taken instanceof Date ? this._formatYMDtoDMY(date_taken.toISOString().substring(0, 10)) : date_taken
            });
        }
        this.photo_gallery = this._updateTableDisplay(this.photo_gallery, this.dataFormPhotoGallery.value);
        for (const value of this.photo_gallery) {
            if (value.direction_of_view != null) {
                const directionOfViews = value.direction_of_view;
                value.direction_of_view_name = directionOfViews.substring(5).trim();
                value.direction_of_view_id = directionOfViews.substring(0,5).trim();
            }
            if (value.angle_of_view != null) {
                const angleOfViews = value.angle_of_view;
                value.angle_of_view_name = angleOfViews.substring(5).trim();
                value.angle_of_view_id = angleOfViews.substring(0,5).trim();
            }
        }
        this.dialogPhotoGallery = false;
        this.createDataFormPhotoGallery(null);
    }

    // Begin Affiliation
    editAffiliation(data: any) {
        this.dialogAffiliation = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormAffiliation(data);
    }

    deleteAffiliationWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.program_affiliation + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.program_network_affiliation = this.program_network_affiliation.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addAffiliation() {
        this.dialogAffiliation = true;
        this.submitted = false;
        this.newData = true;
        this.createDataFormAffiliation(null);
    }

    createDataFormAffiliation(data: any) {
        if (data == null) data = new Object();
        this.dataFormAffiliation = this.fb.group({
            id: new FormControl(data.id),
            // program_type: new FormControl(data.program_type),
            program_type_id: new FormControl(data.program_type_id),
            program_type_name: new FormControl(data.program_type_name, Validators.required),
            program_specific_identifier: new FormControl(data.program_specific_identifier),
            declared_statuses: new FormControl(this.declared_status),
            declared_status_name: new FormControl(data.declared_status_name),
            declared_status_from: new FormControl(data.declared_status_from),
            declared_status_to: new FormControl(data.declared_status_to)
        });
    }
    saveAffiliation() {
        const declaredStatuses = this.dataFormAffiliation.get('declared_statuses')?.value;
        declaredStatuses.forEach((declared_status: any) => {
            this.dataFormAffiliation.patchValue({ declared_status_name: declared_status.declared_status_name });
            this.dataFormAffiliation.patchValue({ declared_status_from: declared_status.from });
            this.dataFormAffiliation.patchValue({ declared_status_to: declared_status.to });
        });

        if (!this.dataFormAffiliation.controls.id.value) {
            this.dataFormAffiliation.patchValue({ id: '_' + this.indexHelper++ });
        }
        this.program_network_affiliation = this._updateTableDisplay(
            this.program_network_affiliation,
            this.dataFormAffiliation.value
        );

        console.log(JSON.stringify(this.program_network_affiliation));

        console.log(this.program_network_affiliation);
        this.dialogAffiliation = false;
        this.createDataFormAffiliation(null);
        this.declared_status = [];
    }

    // Begin DeclaredStatus
    editDeclaredStatus(data: any) {
        this.dialogDeclaredStatus = true;
        this.submitted = false;
        this.newData = false;
        this.createDataFormDeclaredStatus(data);
    }

    deleteDeclaredStatusWithConfirm(data: any) {
        this.submitted = false;
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + data.declared_status + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.declared_status = this.declared_status.filter(val => val.id !== data.id);
            },
            reject: () => {
                this.spinnerService.hide();
            }
        });
    }

    addDeclaredStatus() {
        this.dialogDeclaredStatus = true;
        this.submitted = false;
        this.newData = true;
        this.declared_statusOptions = [];
        this.http.get(`${environment.app.apiUrl}/api/declared-statuses?filter[lang]=${this.lang}`).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.declared_statusOptions.push({
                    label: data.name,
                    value: data.id + '     ' + data.name
                });
                // this.declared_statusOptions.push({ label: data.name.en, value: data.id + '     ' + data.name.en });
            });
        });
        this.createDataFormDeclaredStatus(null);
    }

    createDataFormDeclaredStatus(data: any) {
        if (data == null) data = new Object();
        this.dataFormDeclaredStatus = this.fb.group({
            id: new FormControl(data.id),
            declared_status: new FormControl(data.declared_status),
            declared_status_id: new FormControl(data.declared_status_id),
            declared_status_name: new FormControl(data.declared_status_name),
            from: new FormControl(data.from),
            to: new FormControl(data.to)
        });
    }
    saveDeclaredStatus() {
        if (!this.dataFormDeclaredStatus.controls.id.value) {
            this.dataFormDeclaredStatus.patchValue({ id: '_' + this.indexHelper++ });
            // this.dataFormDeclaredStatus.patchValue({ from: this.datePipe.transform(this.dataFormDeclaredStatus.get('from')?.value, 'dd-MM-yyyy')});
            // this.dataFormDeclaredStatus.patchValue({ from: this.datePipe.transform(this.dataFormDeclaredStatus.get('to')?.value, 'dd-MM-yyyy')});
        }
        const from = this.dataFormDeclaredStatus.controls.from.value;
        if (from) {
            this.dataFormDeclaredStatus.patchValue({
                from: from instanceof Date ? from : new Date(this._formatDMYtoYMD(from)),
                
            });
        }
        this.declared_status = this._updateTableDisplay(this.declared_status, this.dataFormDeclaredStatus.value);
        for (const value of this.declared_status) {
            if (value.declared_status != null) {
                const declaredStatuses = value.declared_status;
                value.declared_status_name = declaredStatuses.substring(5).trim();
                value.declared_status_id = declaredStatuses.substring(0,5).trim();
            }
        }
        this.dialogDeclaredStatus = false;
        this.createDataFormDeclaredStatus(null);
    }

    // Program Tree
    addProgramTree() {
        this.dialogProgramTree = true;
        this.submitted = false;
        this.newData = true;
        this.createDataFormProgramTree(null);
    }

    createDataFormProgramTree(data: any) {
        if (data == null) data = new Object();
        this.dataFormProgramTree = this.fb.group({
            id: new FormControl(data.id),
            program: new FormControl(data.program)
        });
    }

    clearProgramTree() {
        this.dataFormAffiliation.patchValue({ program_type_name: null });
    }

    insertData(data: any) {
        this.dataFormAffiliation.patchValue({ program_type_name: data.text });
        this.dataFormAffiliation.patchValue({ program_type_id: data.id });
        this.dialogProgramTree = false;
    }

    filterRecursive(filterText: string, array: any[], property: string) {
        let filteredData;

        function copy(o: any) {
            return Object.assign({}, o);
        }

        if (filterText) {
            filterText = filterText.toLowerCase();
            filteredData = array.map(copy).filter(function x(y) {
                if (y[property].toLowerCase().includes(filterText)) {
                    return true;
                }
                if (y.children) {
                    return (y.children = y.children.map(copy).filter(x)).length;
                }
            });
        } else {
            filteredData = array;
        }
        return filteredData;
    }

    filterTree(filterText: string) {
        this.dataSourceProgram.data = this.filterRecursive(filterText, this.treeProgramCopy, 'text');
    }

    applyFilter(filterText: any) {
        console.log(filterText);
        this.filterTree(filterText);
        if (filterText) {
            this.treeControl.expandAll();
        } else {
            this.treeControl.collapseAll();
        }
    }

    // Event Tree
    addEventTree() {
        this.dialogEventTree = true;
        this.submitted = false;
        this.newData = true;
    }

    clearEventTree() {
        this.dataFormPlatformEventLogbook.patchValue({ platform_event_name: null });
    }

    insertDataEvent(data: any) {
        this.dataFormPlatformEventLogbook.patchValue({ platform_event_name: data.text });
        this.dataFormPlatformEventLogbook.patchValue({ platform_event_id: data.id });
        this.dialogEventTree = false;
    }

    filterRecursiveEvent(filterText: string, array: any[], property: string) {
        let filteredData;

        function copy(o: any) {
            return Object.assign({}, o);
        }

        if (filterText) {
            filterText = filterText.toLowerCase();
            filteredData = array.map(copy).filter(function x(y) {
                if (y[property].toLowerCase().includes(filterText)) {
                    return true;
                }
                if (y.children) {
                    return (y.children = y.children.map(copy).filter(x)).length;
                }
            });
        } else {
            filteredData = array;
        }
        return filteredData;
    }

    filterTreeEvent(filterText: string) {
        this.dataSourceEvent.data = this.filterRecursiveEvent(filterText, this.treeEventCopy, 'text');
    }

    applyFilterEvent(filterText: any) {
        console.log(filterText);
        this.filterTreeEvent(filterText);
        if (filterText) {
            this.treeControl.expandAll();
        } else {
            this.treeControl.collapseAll();
        }
    }

    getSelectedDatas() {
        return this.selectedDatas;
    }

    setSelectedDatas(selectedDatas: any[]) {
        this.selectedDatas = selectedDatas;
    }
    generateStr(data: any): any {
        return data;
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

    buildFormData(formData: FormData, obj: object): void {
        for (const [k, v] of Object.entries(obj)) {
            if (v && typeof v === 'object' && !(v instanceof Date) && !(v instanceof File)) {
                //formData.append(k, new Blob([v]));
                //formData.append(k + '[]', v);
                /*formData.append(
                    k,
                    new Blob([JSON.stringify(v)], {
                        type: 'application/json'
                    })
                );*/
                //formData.append(k, JSON.stringify(v));
                if (k.includes('photo_gallery')) {
                    //photo gallery manual
                } else {
                    formData.append(k, JSON.stringify(v));
                }
            } else {
                if (v) {
                    if (k.includes('date')) {
                        formData.append(
                            k,
                            v instanceof Date ? v.toISOString() : new Date(this._formatDMYtoYMD(v)).toISOString()
                        );
                    } else {
                        formData.append(k, v);
                    }
                } else {
                    formData.append(k, '');
                }
            }
        }
    }
}
