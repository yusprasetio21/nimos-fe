import { Station } from '../domain/station';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { ConfirmationService, MessageService, SelectItem, TreeNode } from 'primeng/api';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm, FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { environment } from 'src/environments/environment';

import { NodeService } from './nodeservice';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { cloneDeep } from 'lodash';

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
    selector: 'app-station-edit',
    templateUrl: './station-edit.component.html'
})
export class StationEditComponent extends MoreComponent implements OnInit {
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
    dataFormPhotoGallery: FormGroup | null;
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

    station_id: any;
    station_name: any;
    station_identifier: any;
    station_wigos_id: any;

    minDate: Date;

    public datePipe: DatePipe = new DatePipe(navigator.language);
    idStationUsage: any;
    disabled = true;
    isBasicOptions: any[];
    isBasic = true; //basic

    cityEnable = false;
    districtEnable = false;
    villageEnable = false;

    constructor(
        private fb: FormBuilder,
        //more
        confirmationService: ConfirmationService,
        http: HttpClient,
        public nodeService: NodeService,

        //base
        router: Router,
        messageService: MessageService,
        spinnerService: NgxSpinnerService,
        private route: ActivatedRoute
    ) {
        super(confirmationService, http, router, messageService, spinnerService);
    }

    ngOnInit(): void {
        this.isBasicOptions = [
            { label: 'Basic', value: true },
            { label: 'Advance', value: false }
        ];
        this.station_id = this.route.snapshot.params.id;

        if (!this.station_id) {
            this.station_id = localStorage.getItem('station_id');
            this.station_name = localStorage.getItem('station_name');
            this.station_identifier = localStorage.getItem('station_identifier');
            this.station_wigos_id = localStorage.getItem('station_wigos_id');
        }
        // this.nodeService.getFilesTreeEvent().then(files => (this.treeEvent = files));
        // this.nodeService.getFilesTreeProgram().then(files => (this.treeProgram = files));

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
        this.http.get(`${environment.app.apiUrl}/api/lists/organizations`).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.supervisingOrgOptions.push({ label: data.long_name, value: data.id + '   ' + data.long_name });
            });

            this.state$.next(true);
        });

        this.geopositioning_methodOptions = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/geopositioning-methods?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.geopositioning_methodOptions.push({ label: data.name, value: data.id + '     ' + data.name });
                });
            });

        this.timezoneOptions = [];
        this.http.get(`${environment.app.apiUrl}/api/lists/types/timezones?filter[name]=Indonesia`).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.timezoneOptions.push({ label: 'UTC ' + data.gmt, value: data.id + '     ' + data.gmt });
            });
        });

        this.climate_zoneOptions = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/climate-zones?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.climate_zoneOptions.push({ label: data.description, value: data.id + '     ' + data.description });
                });
            });

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

        this.surface_roughness_Options = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/surface-roughness-types?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.surface_roughness_Options.push({ label: data.name, value: data.id + '     ' + data.name });
                });
            });

        this.local_topography_Options = [];
        this.http
            .get(`${environment.app.apiUrl}/api/lists/types/local-topographies?filter[lang]=${this.lang}`)
            .subscribe(resp => {
                const datas = resp as any[];
                datas.forEach(data => {
                    this.local_topography_Options.push({
                        label: data.name,
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
                        label: data.name,
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
                        label: data.name,
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
                        label: data.name,
                        value: data.id + '     ' + data.name
                    });
                });
            });

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

        //     this.state$.next(true);
        // }

        console.log(this.station_id);
        if (this.station_id) {
            this.spinnerService.show();
            this.http.get(`${environment.app.apiUrl}/api/stations/${this.station_id}/edit`).subscribe({
                next: response => {
                    console.log('response: ' + JSON.stringify(response));

                    const data = response as any;

                    localStorage.setItem('station_name', data.name);
                    localStorage.setItem('station_identifier', data.identifier);
                    localStorage.setItem('station_id', data.id);
                    const stationCoordinates: string = JSON.stringify(data.coordinates[0]);
                    localStorage.setItem('station_coordinates', stationCoordinates as string);

                    this.dataForm.patchValue(data);
                    this.dataForm.patchValue({ date_established: new Date(data.date_established) });
                    if (data.date_closed != null) {
                        console.log(data.date_closed)
                        this.dataForm.patchValue({ date_closed: new Date(data.date_closed) });
                    }
                    this.dataForm.patchValue({ station_type_id: data.station_type?.id });
                    this.dataForm.patchValue({ station_local_type_id: data.station_local_type?.id });
                    this.dataForm.patchValue({ usage_type_id: data.usage_type?.id });
                    this.dataForm.patchValue({ wmo_region_type_id: 'V - South-West Pacific' });
                    this.dataForm.patchValue({ country_territories: 'Indonesia', value: '100' });
                    this.dataForm.patchValue({ province_id: data.province?.id });
                    this.dataForm.patchValue({ city_id: data.city?.id });
                    this.dataForm.patchValue({ kabupatenName: data.city?.name });
                    this.dataForm.patchValue({ district_id: data.district?.id });
                    this.dataForm.patchValue({ kecamatanName: data.district?.name });
                    this.dataForm.patchValue({ village_id: data.village?.id });
                    this.dataForm.patchValue({ kelurahanName: data.village?.name });
                    this.dataForm.patchValue({ address: data.address });

                    this.dataForm.patchValue({ wigos_id: data.wigos_id });

                    this.aliases = this.aliases.concat(data.station_aliases);
                    // this.dataFormAlias.patchValue(data.station_aliases);

                    this.station_usages = this.station_usages.concat(data.station_usage);
                    this.coordinates = this.coordinates.concat(data.coordinates);
                    // this.country_territories = this.country_territories.concat(data.country_territories);
                    this.timezone = this.timezone.concat(data.timezones);
                    this.supervising_organization = this.supervising_organization.concat(
                        data.supervising_organizations
                    );
                    this.site_description = this.site_description.concat(data.site_descriptions);
                    this.climate_zone = this.climate_zone.concat(data.climate_zones);
                    this.predominant_surface_cover = this.predominant_surface_cover.concat(
                        data.predominant_surface_covers
                    );
                    this.surface_roughness = this.surface_roughness.concat(data.surface_roughnesses);
                    this.topography_bathymetry = this.topography_bathymetry.concat(data.topography_bathymetries);
                    this.population = this.population.concat(data.populations);
                    this.platform_event_logbook = this.platform_event_logbook.concat(data.platform_event_logbooks);
                    //this.photo_gallery = this.photo_gallery.concat(data.photo_gallery);

                    const station_usage: any[] = [];
                    this.station_usages.forEach(data1 => {
                        const newData = {
                            id: data1?.id,
                            station_usage: data1,
                            station_usage_id: data1?.id,
                            station_usage_name: data1?.name
                        };
                        station_usage.push(newData);
                    });
                    this.station_usages = station_usage;

                    this.photo_gallery = [];
                    if (data.photo_gallery.length > 0) {
                        const medias = data.photo_gallery as any[];
                        medias.forEach(element => {
                            
                            if(element.custom_properties.angle_of_view){
                                const data = {
                                    id: element.id,
                                    photo: this._replaceMediaUrl(element.original_url),
                                    caption: element.custom_properties.caption,
                                    date_taken: new Date(element.custom_properties.date_taken),
                                    direction_of_view: element.custom_properties.direction_of_view,
                                    direction_of_view_id: element.custom_properties.direction_of_view.id,
                                    direction_of_view_name: element.custom_properties.direction_of_view.name,
                                    angle_of_view: element.custom_properties.angle_of_view,
                                    angle_of_view_id: element.custom_properties.angle_of_view.id,
                                    angle_of_view_name: element.custom_properties.angle_of_view.value,
                                    owner: element.custom_properties.owner
                                };

                                this.photo_gallery.push(data);
                            }else{

                                const data2 = {
                                    id: element.id,
                                    photo: this._replaceMediaUrl(element.original_url),
                                    caption: element.custom_properties.caption,
                                    date_taken: new Date(element.custom_properties.date_taken),
                                    direction_of_view: element.custom_properties.direction_of_view,
                                    direction_of_view_id: element.custom_properties.direction_of_view.id,
                                    direction_of_view_name: element.custom_properties.direction_of_view.name,
                                    owner: element.custom_properties.owner
                                };
                                this.photo_gallery.push(data2);
                            }
                            console.log(JSON.stringify(this.photo_gallery));
                        });
                    }

                    this.program_network_affiliation = this.program_network_affiliation.concat(
                        data.program_network_affiliations
                    );

                    const coordinate1: any[] = [];
                    this.coordinates.forEach(data1 => {
                        const id = data1?.geopositioning_method?.id;
                        const name = this.changeToNameBahasa(data1?.geopositioning_method?.id, data1?.geopositioning_method?.name, this.geopositioning_methodOptions); 
                        console.log(name);
                        const newData = {
                            id: data1?.id,
                            latitude: data1?.latitude,
                            longitude: data1?.longitude,
                            station_elevation: data1?.elevation,
                            from: new Date(data1?.from),
                            geopositioning_method: id + '     ' + name,
                            geopositioning_method_id: id,
                            geopositioning_method_name: name
                        };
                        coordinate1.push(newData);
                    });
                    this.coordinates = coordinate1;
                    console.log(JSON.stringify(this.coordinates));

                    const timezone1: any[] = [];
                    this.timezone.forEach(data1 => {
                        const id = data1.timezone?.id;
                        const name = data1.timezone?.gmt;
                        const newData = {
                            id: data1.id,
                            from: new Date(data1.from),
                            fromStr: this._formatYMDtoDMY(data1.from),
                            timezone: id + '     ' + name,
                            timezone_name: name
                        };
                        timezone1.push(newData);
                    });
                    this.timezone = timezone1;

                    const supervisingOrganization1: any[] = [];
                    this.supervising_organization.forEach(data1 => {
                        const id = data1.organization?.id;
                        const name = data1.organization?.long_name;
                        const newData = {
                            id: data1.id,
                            from: new Date(data1?.from),
                            organization: id + '   ' + name,
                            organization_name: name
                        };
                        supervisingOrganization1.push(newData);
                    });
                    this.supervising_organization = supervisingOrganization1;

                    const siteDescription1: any[] = [];
                    this.site_description.forEach(data1 => {
                        const newData = {
                            id: data1.id,
                            from: new Date(data1?.from),
                            value: data1.value
                        };
                        siteDescription1.push(newData);
                    });
                    this.site_description = siteDescription1;

                    const climateZone1: any[] = [];
                    this.climate_zone.forEach(data1 => {
                        const id = data1.climate_zone?.id;
                        const name = this.changeToNameBahasa(data1?.climate_zone?.id, data1?.climate_zone?.description, this.climate_zoneOptions); 
                        const newData = {
                            id: data1.id,
                            from: new Date(data1?.from),
                            climate_zone: id + '     ' + name,
                            climate_zone_name: name
                        };
                        climateZone1.push(newData);
                    });
                    this.climate_zone = climateZone1;

                    
                    // this.predominant_surface_cover.forEach(data1 => {
                    //     const id = data1.surface_cover_classification?.id;
                    //     console.log(id);
                    //     if (this.station_id) {
                    //         this.surface_cover_Options = [];
                    //         this.http
                    //             .get(
                    //                 `${environment.app.apiUrl}/api/lists/types/surface-cover-types?filter[lang]=${this.lang}&filter[type]=` +
                    //                 id
                    //             )
                    //             .subscribe(resp => {
                    //                 const datas = resp as any[];
                    //                 datas.forEach(data2 => {
                    //                     this.surface_cover_Options.push({
                    //                         label: data2.name,
                    //                         value: data2.id + '     ' + data2.name
                    //                     });
                    //                 });
                    //             });
                    //     }
                    // });

                    const predominantSurfaceCover1: any[] = [];
                    this.predominant_surface_cover.forEach(data1 => {
                        const id = data1.surface_cover_classification?.id;
                        const name = this.changeToNameBahasa(data1?.surface_cover_classification?.id, data1?.surface_cover_classification?.name, this.surface_cover_classification_Options); 
                        const id2 = data1.surface_cover_type?.id;

                        this.surface_cover_Options = [];
                        this.http
                            .get(
                                `${environment.app.apiUrl}/api/lists/types/surface-cover-types?filter[lang]=${this.lang}&filter[type]=` +
                                id
                            )
                            .subscribe(resp => {
                                const datas = resp as any[];
                                datas.forEach(data2 => {
                                    this.surface_cover_Options.push({
                                        label: data2.name,
                                        value: data2.id + '     ' + data2.name
                                    });
                                });
                                    
                                const name2 = this.changeToNameBahasa(data1?.surface_cover_type?.id, data1?.surface_cover_type?.name, this.surface_cover_Options);

                                const newData = {
                                    id: data1.id,
                                    from: new Date(data1?.from),
                                    surface_cover_classification: id + '     ' + name,
                                    surface_cover_classification_name: name,
                                    surface_cover: id2 + '     ' + name2,
                                    surface_cover_name: name2
                                };
                                predominantSurfaceCover1.push(newData);
                        });

                    });
                    this.predominant_surface_cover = predominantSurfaceCover1;

                    const surfaceRoughness1: any[] = [];
                    this.surface_roughness.forEach(data1 => {
                        const id = data1.surface_roughness_type?.id;
                        const name = this.changeToNameBahasa(data1?.surface_roughness_type?.id, data1?.surface_roughness_type?.name, this.surface_roughness_Options);
                        const newData = {
                            id: data1.id,
                            from: new Date(data1?.from),
                            surface_roughness: id + '     ' + name,
                            surface_roughness_name: name
                        };
                        surfaceRoughness1.push(newData);
                    });
                    this.surface_roughness = surfaceRoughness1;

                    const topographyBathymetry1: any[] = [];
                    this.topography_bathymetry.forEach(data1 => {
                        const id = data1.local_topograhy?.id;
                        const name = this.changeToNameBahasa(data1?.local_topograhy?.id, data1?.local_topograhy?.name, this.local_topography_Options);
                        const id2 = data1.relative_elevation?.id;
                        // const name2 = this.changeToNameBahasa(data1?.relative_elevation?.id, data1?.relative_elevation?.name, this.relative_elevation_Options);
                        const id3 = data1.altitude_depth?.id;
                        const name3 = this.changeToNameBahasa(data1?.altitude_depth?.id, data1?.altitude_depth?.name, this.altitude_depth_Options);
                        const id4 = data1.topographic_context?.id;
                        // const name4 = this.changeToNameBahasa(data1?.topographic_context?.id, data1?.topographic_context?.name, this.topographic_context_Options);
                        // console.log(name4);
                        const newData = {
                            id: data1.id,
                            from: new Date(data1?.from),
                            local_topography: id + '     ' + name,
                            local_topography_name: name,
                            relative_elevation: id2 + '     ' + this.changeToNameBahasa(data1?.relative_elevation?.id, data1?.relative_elevation?.name, this.relative_elevation_Options),
                            relative_elevation_name: this.changeToNameBahasa(data1?.relative_elevation?.id, data1?.relative_elevation?.name, this.relative_elevation_Options),
                            altitude_depth: id3 + '     ' + name3,
                            altitude_depth_name: name3,
                            topographic_context: id4 + '     ' + this.changeToNameBahasa(data1?.topographic_context?.id, data1?.topographic_context?.name, this.topographic_context_Options),
                            topographic_context_name: this.changeToNameBahasa(data1?.topographic_context?.id, data1?.topographic_context?.name, this.topographic_context_Options),
                        };
                        topographyBathymetry1.push(newData);
                    });
                    this.topography_bathymetry = topographyBathymetry1;

                    const population1: any[] = [];
                    this.population.forEach(data1 => {
                        const newData = {
                            id: data1.id,
                            from: new Date(data1?.from),
                            population_in_10km: data1.population_in_10km,
                            population_in_50km: data1.population_in_50km
                        };
                        population1.push(newData);
                    });
                    this.population = population1;

                    const platformEventLogbook1: any[] = [];
                    this.platform_event_logbook.forEach(data1 => {
                        if (data1.to != null) {
                            const newData1 = {
                                id: data1.id,
                                from: new Date(data1?.from),
                                to: new Date(data1.to),
                                description: data1.description,
                                author: data1.author,
                                online_reference: data1.online_reference,
                                platform_event: data1.platform_event
                            };
                            platformEventLogbook1.push(newData1);
                        } else {
                            const newData2 = {
                                id: data1.id,
                                from: new Date(data1?.from),
                                description: data1.description,
                                author: data1.author,
                                online_reference: data1.online_reference,
                                platform_event: data1.platform_event
                            };
                            platformEventLogbook1.push(newData2);
                        }
                    });
                    this.platform_event_logbook = platformEventLogbook1;

                    //manipulate program_network_affiliations table..
                    const programNetworkAffiliationsNew: any[] = [];
                    const declaredStatusNew: any[] = [];
                    if (this.program_network_affiliation && this.program_network_affiliation.length > 0) {
                        this.program_network_affiliation.forEach(prog => {
                            let first = true;
                            if (prog && prog.declared_statuses && prog.declared_statuses.length > 0) {
                                prog.declared_statuses.forEach((declared_status: any) => {
                                    let prog1 = {};
                                    let prog2 = {};
                                    if (first) {
                                        prog1 = {
                                            id: prog.id,
                                            program_type_id: prog.program_type?.id,
                                            program_type_name: prog.program_type?.text,
                                            program_specific_identifier: prog.program_specific_identifier,
                                            affiliation_status: prog.affiliation_status,
                                            declared_status_name: declared_status.declared_status_name,
                                            declared_status_from: declared_status.from,
                                            declared_status_to: declared_status.to
                                        };
                                        if (declared_status.to !== null) {
                                            prog2 = {
                                                id: declared_status.id,
                                                declared_status:
                                                    declared_status.declared_status_id +
                                                    '     ' +
                                                    declared_status.declared_status_name,
                                                declared_status_id: declared_status.declared_status_id,
                                                declared_status_name: declared_status.declared_status_name,
                                                from: new Date(declared_status.from),
                                                to: new Date(declared_status?.to)
                                            };
                                        } else {
                                            prog2 = {
                                                id: declared_status.id,
                                                declared_status:
                                                    declared_status.declared_status_id +
                                                    '     ' +
                                                    declared_status.declared_status_name,
                                                declared_status_id: declared_status.declared_status_id,
                                                declared_status_name: declared_status.declared_status_name,
                                                from: new Date(declared_status.from),
                                                to: declared_status?.to
                                            };
                                        }
                                    } else {
                                        prog1 = {
                                            program_type_text: '',
                                            program_specific_identifier: '',
                                            affiliation_status: '',
                                            declared_statuses_name: declared_status.declared_status_name,
                                            declared_statuses_from: declared_status.from,
                                            declared_statuses_to: declared_status.to
                                        };
                                        if (declared_status.to != null) {
                                            prog2 = {
                                                id: declared_status.id,
                                                declared_status:
                                                    declared_status.declared_status_id +
                                                    '     ' +
                                                    declared_status.declared_status_name,
                                                declared_status_id: declared_status.declared_status_id,
                                                declared_status_name: declared_status.declared_status_name,
                                                from: new Date(declared_status.from),
                                                to: new Date(declared_status?.to)
                                            };
                                        } else {
                                            prog2 = {
                                                id: declared_status.id,
                                                declared_status:
                                                    declared_status.declared_status_id +
                                                    '     ' +
                                                    declared_status.declared_status_name,
                                                declared_status_id: declared_status.declared_status_id,
                                                declared_status_name: declared_status.declared_status_name,
                                                from: new Date(declared_status.from),
                                                to: declared_status?.to
                                            };
                                        }
                                    }
                                    first = false;
                                    programNetworkAffiliationsNew.push(prog1);
                                    declaredStatusNew.push(prog2);
                                });
                            }
                        });
                    }
                    this.program_network_affiliation = programNetworkAffiliationsNew;
                    this.declared_status = declaredStatusNew;

                    if (data.province == null ){

                        //nop

                    }else if(data.city == null ){

                        this.cityEnable = true;
                        this.newData = true;

                        this.kabupatenOptions = [];
                        this.http.get(`${environment.app.apiUrl}/api/cities?filter[province_id]=` + data.province?.id).subscribe(resp => {
                            const datas = resp as any[];
                            datas.forEach(data => {
                                this.kabupatenOptions.push({ label: data.name, value: data.id });
                            });
                        });

                    }else if(data.district == null){
                        
                        this.districtEnable = true;
                        this.newData = true;

                        this.kecamatanOptions = [];
                        this.http.get(`${environment.app.apiUrl}/api/districts?filter[city.id]=` + data.city?.id).subscribe(resp => {
                            const datas = resp as any[];
                            datas.forEach(data => {
                                this.kecamatanOptions.push({ label: data.name, value: data.id });
                            });
                        });

                    }else if (data.village == null){

                        this.villageEnable = true;
                        this.newData = true;

                        this.kelurahanOptions = [];
                        this.http.get(`${environment.app.apiUrl}/api/villages?filter[district_id]=` + data.district?.id).subscribe(resp => {
                            const datas = resp as any[];
                            datas.forEach(data => {
                                this.kelurahanOptions.push({ label: data.name, value: data.id });
                            });
                        });

                    }
                    

                    this.spinnerService.hide();
                    this.state$.next(true);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
        }else {
            setTimeout(() => {
                this.router.navigate(['/my-stations']);
            }, 3000);
        }
        this.createDataForm(new Station());

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

    changeToNameBahasa(id: any, name: any, listOptionsIndonesia: any) {
        let returnValue: any ;

        if (this.lang === 'en') {

            returnValue = name;

        } else {
            for(const data of listOptionsIndonesia){
                const index = data.value.indexOf(" ");
                const dataId = data.value.substring(0, index).trim();
                
                if (dataId === id.toString()) {
                    console.log(data.label)
                    returnValue = data.label; 
                    break;          
                }
            }
            // listOptionsIndonesia.forEach((data: any) => {
            //     let index = data.value.indexOf(" ");
            //     let dataId = data.value.substring(0, index).trim();
                
            //     if (dataId === id.toString()) {
            //         console.log(data.label)
            //         returnValue = data.label;            
            //     }
            // });
        }
        return returnValue;
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
        console.log('>> ' + event);
        this.minDate = new Date(event);
    }

    onSelectProvinsi(event: any) {
        this.cityEnable = true;
        this.newData = true;

        this.kabupatenOptions = [];
        this.http.get(`${environment.app.apiUrl}/api/cities?filter[province_id]=` + event.value).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.kabupatenOptions.push({ label: data.name, value: data.id });
            });
        });
    }

    onSelectkabupaten(event: any) {
        this.districtEnable = true;
        this.newData = true;

        this.kecamatanOptions = [];
        this.http.get(`${environment.app.apiUrl}/api/districts?filter[city.id]=` + event.value).subscribe(resp => {
            const datas = resp as any[];
            datas.forEach(data => {
                this.kecamatanOptions.push({ label: data.name, value: data.id });
            });
        });
    }

    onSelectKecamatan(event: any) {
        this.villageEnable = true;
        this.newData = true;

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
            name: new FormControl(data.name),
            identifier: new FormControl(data.identifier),
            station_aliases: new FormControl(this.aliases),
            date_established: new FormControl(data.date_established),
            date_closed: new FormControl(data.date_closed),
            // decl_status: new FormControl(data.decl_status),
            // assessed_status: new FormControl(data.assessed_status),
            station_type_id: new FormControl(data.station_type_id),
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
            program_network_affiliations: new FormControl(this.program_network_affiliation),

            wigos_id: new FormControl(data.wigos_id),
            kabupatenName: new FormControl(data.kabupatenName),
            kecamatanName: new FormControl(data.kecamatanName),
            kelurahanName: new FormControl(data.kelurahanName)
        });
    }

    // saveAllTest() {
    //     this.dataForm.patchValue({ station_aliases: this.aliases });
    //     this.aliases.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ station_usage: this.station_usages });
    //     this.station_usages.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     if (this.station_coordinator != null) {
    //         this.dataForm.patchValue({ station_coordinator: this.station_coordinator });
    //     }
    //     this.dataForm.patchValue({ coordinates: this.coordinates });
    //     this.coordinates.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ timezones: this.timezone });
    //     this.timezone.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ supervising_organizations: this.supervising_organization });
    //     this.supervising_organization.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ site_descriptions: this.site_description });
    //     this.site_description.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ climate_zones: this.climate_zone });
    //     this.climate_zone.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ predominant_surface_covers: this.predominant_surface_cover });
    //     this.predominant_surface_cover.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ surface_roughnesses: this.surface_roughness });
    //     this.surface_roughness.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ topography_bathymetries: this.topography_bathymetry });
    //     this.topography_bathymetry.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ populations: this.population });
    //     this.population.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ platform_event_logbooks: this.platform_event_logbook });
    //     this.platform_event_logbook.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ photo_gallery: this.photo_gallery });
    //     this.photo_gallery.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ program_network_affiliations: this.program_network_affiliation });
    //     this.program_network_affiliation.map(data1 => {
    //         const id = data1.id?.toString() || '';
    //         if (id.startsWith('_')) {
    //             delete data1.id;
    //         }
    //         if (data1.declared_status_name != null) {
    //             delete data1.declared_status_name;
    //         }
    //         if (data1.declared_status_from != null) {
    //             delete data1.declared_status_from;
    //         }
    //         if (data1.declared_status_to != null) {
    //             delete data1.declared_status_to;
    //         }
    //         return data1;
    //     });
    //     this.dataForm.patchValue({ wmo_region_type_id: '7' });

    //     const data = JSON.stringify(this.dataForm.value);

    //     console.log('save: ' + data);

    //     this.http.put(`${environment.app.apiUrl}/api/stations/${this.station_id}`, data).subscribe({
    //         next: response => {
    //             const datas = response as any[];
    //             console.log('datas: ' + JSON.stringify(datas));

    //             this._generateMsg('success', 'Successful', 'Data is saved successfully');
    //             this.disabled = true;
    //             this.spinnerService.hide();
    //             this.state$.next(true);
    //         },
    //         error: err => {
    //             this._errorHandler(err);
    //         }
    //     });
    // }

    saveAll() {
        this.dataForm.patchValue({ station_aliases: this.aliases });
        this.dataForm.patchValue({ station_usage: this.station_usages });
        if (this.station_coordinator != null) {
            this.dataForm.patchValue({ station_coordinator: this.station_coordinator });
        }
        this.dataForm.patchValue({ coordinates: this.coordinates });
        this.dataForm.patchValue({ timezones: this.timezone });
        this.dataForm.patchValue({ supervising_organizations: this.supervising_organization });
        this.dataForm.patchValue({ site_descriptions: this.site_description });
        this.dataForm.patchValue({ climate_zones: this.climate_zone });
        this.dataForm.patchValue({ predominant_surface_covers: this.predominant_surface_cover });
        this.dataForm.patchValue({ surface_roughnesses: this.surface_roughness });
        this.dataForm.patchValue({ topography_bathymetries: this.topography_bathymetry });
        this.dataForm.patchValue({ populations: this.population });
        this.dataForm.patchValue({ platform_event_logbooks: this.platform_event_logbook });
        this.dataForm.patchValue({ photo_gallery: this.photo_gallery });
        this.dataForm.patchValue({ program_network_affiliations: this.program_network_affiliation });
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

        // const data = JSON.stringify(this.dataForm.value);
        const stationReq = cloneDeep(this.dataForm.value);

        this.deleteKeyInJson('id', stationReq);
        // eslint-disable-next-line @typescript-eslint/dot-notation
        delete stationReq['photo_gallery'];

        // this.program_network_affiliation.map(data1 => {
        //     if (data1.declared_status_name != null || data1.declared_status_name == null) {
        //         delete data1.declared_status_name;
        //     }
        //     if (data1.declared_status_from != null || data1.declared_status_from == null) {
        //         delete data1.declared_status_from;
        //     }
        //     if (data1.declared_status_to != null || data1.declared_status_to == null) {
        //         delete data1.declared_status_to;
        //     }
        //     return data1;
        // });

        const data = JSON.stringify(stationReq);

        console.log('save: ' + data);

        this.http.put(`${environment.app.apiUrl}/api/stations/${this.station_id}`, data).subscribe({
            next: response => {
                const datas = response as any[];
                console.log('datas: ' + JSON.stringify(datas));

                this._generateMsg('success', 'Successful', 'Data is saved successfully');
                this.disabled = true;
                this.spinnerService.hide();
                this.state$.next(true);
            },
            error: err => {
                this._errorHandler(err);
            }
        });

        this.dataForm.patchValue({ wmo_region_type_id: 'V - South-West Pacific' });
        this.dataForm.patchValue({ country_territories: 'Indonesia' });
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

        console.log('masuk sini ga alias' + JSON.stringify(this.aliases));
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
        this.dataFormStationUsage.patchValue({ station_usage: event });
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
        if (!this.dataFormStationUsage.controls.id.value) {
            this.dataFormStationUsage.patchValue({ id: '_' + this.indexHelper++ });
        }
        this.station_usages = this._updateTableDisplay(this.station_usages, this.dataFormStationUsage.value);

        // for (const value of this.station_usages) {
        //     if (value.station_usages != null) {
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
                console.log('masuk sini ga ' + value.timezone);
                const timezoneOri = value.timezone;
                value.timezone_name = timezoneOri.substring(5).trim();
                value.timezone_id = timezoneOri.substring(0,5).trim();
            }
        }
        console.log(JSON.stringify(this.timezone));
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
                const organization = value.organization;
                value.organization_name = organization.substring(4).trim();
                value.organization_id = organization.substring(0, 4).trim();
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
                const climateZoneOri = value.climate_zone;
                value.climate_zone_name = climateZoneOri.substring(5).trim();
                value.climate_zone_id = climateZoneOri.substring(0,5).trim();
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
                const surfaceCoverClassificationOri = value.surface_cover_classification;
                value.surface_cover_classification_name = surfaceCoverClassificationOri.substring(5).trim();
                value.surface_cover_classification_id = surfaceCoverClassificationOri.substring(0,5).trim();
            }
            if (value.surface_cover != null) {
                const surfaceCoverOri = value.surface_cover;
                value.surface_cover_name = surfaceCoverOri.substring(5).trim();
                value.surface_cover_id = surfaceCoverOri.substring(0,5).trim();
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
                const surfaceRoughnessOri = value.surface_roughness;
                value.surface_roughness_name = surfaceRoughnessOri.substring(5).trim();
                value.surface_roughness_id = surfaceRoughnessOri.substring(0,5).trim();
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
                const localTopograhyOri = value.local_topography;
                value.local_topography_name = localTopograhyOri.substring(5).trim();
                value.local_topography_id = localTopograhyOri.substring(0,5).trim();
            }
            if (value.relative_elevation != null) {
                const relativeElevationOri = value.relative_elevation;
                value.relative_elevation_name = relativeElevationOri.substring(5).trim();
                value.relative_elevation_id = relativeElevationOri.substring(0,5).trim();
            }
            if (value.topographic_context != null) {
                const topographicContextOri = value.topographic_context;
                value.topographic_context_name = topographicContextOri.substring(5).trim();
                value.topographic_context_id = topographicContextOri.substring(0,5).trim();
            }
            if (value.altitude_depth != null) {
                const altitudeDepthOri = value.altitude_depth;
                value.altitude_depth_name = altitudeDepthOri.substring(5).trim();
                value.altitude_depth_id = altitudeDepthOri.substring(0,5).trim();
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
            message: 'Are you sure you want to delete ' + data.caption + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (!isNaN(data.id)) {
                    //localhost:8090/api/stations/8/documents/11
                    this.spinnerService.show();
                    this.http
                        .delete(`${environment.app.apiUrl}/api/stations/${this.station_id}/documents/${data.id}`)
                        .subscribe({
                            next: () => {
                                this.setDatasPhoto(this.getDatasPhoto().filter(val => val.id !== data.id));
                                //this.totalRecords -= 1;
                                this.createDataFormPhotoGallery(null);
                                this._generateMsg('success', 'Successful', 'Data is deleted successfully');
                                this.spinnerService.hide();
                                this.state$.next(true);
                            },
                            error: err => {
                                this._errorHandler(err);
                            }
                        });
                } else {
                    this.setDatasPhoto(this.getDatasPhoto().filter(val => val.id !== data.id));
                    // this.photo_gallery = this.photo_gallery.filter(val => val.id !== data.id);
                }
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
        this.createDataFormPhotoGallery(new Object());
    }

    createDataFormPhotoGallery(data: any) {
        if (data !== null) {
            this.dataFormPhotoGallery = this.fb.group({
                id: new FormControl(data.id),
                photo: new FormControl(''),
                caption: new FormControl(data.caption),
                date_taken: new FormControl(data.date_taken),
                direction_of_view: new FormControl(data.direction_of_view),
                direction_of_view_id: new FormControl(data.direction_of_view_id),
                direction_of_view_name: new FormControl(data.direction_of_view_name),
                angle_of_view: new FormControl(data.angle_of_view),
                angle_of_view_id: new FormControl(data.angle_of_view_id),
                angle_of_view_name: new FormControl(data.angle_of_view_name),
                owner: new FormControl(data.owner),
                fileSource: new FormControl('')
            });
        } else {
            this.dataFormPhotoGallery = null;
        }
    }

    onFileChange(event: any) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            console.log('file' + file);
            this.dataFormPhotoGallery?.patchValue({
                fileSource: file
            });
        }
    }

    savePhotoGallery() {
        this.spinnerService.show();

        const photoGallery = cloneDeep(this.dataFormPhotoGallery?.value);

        //console.log('photoGallery >>>' + JSON.stringify(photoGallery));

        if (photoGallery.direction_of_view !== null) {
            photoGallery.direction_of_view_name = photoGallery.direction_of_view.substring(5).trim();
            photoGallery.direction_of_view_id = photoGallery.direction_of_view.substring(0,5).trim();
        }
        if (photoGallery.angle_of_view !== null) {
            photoGallery.angle_of_view_name = photoGallery.angle_of_view.substring(5).trim();
            photoGallery.angle_of_view_id = photoGallery.angle_of_view.substring(0,5).trim();
        }

        //console.log('this.photo_gallery: ' + JSON.stringify(this.photo_gallery));

        const formData = new FormData();

        formData.append('photo_gallery[0][photo]', photoGallery.fileSource);
        formData.append('photo_gallery[0][caption]', photoGallery.caption);
        formData.append('photo_gallery[0][direction_of_view_id]', photoGallery.direction_of_view_id);
        if (photoGallery.angle_of_view_id != null){
            formData.append('photo_gallery[0][angle_of_view_id]', photoGallery.angle_of_view_id);
        }
        formData.append('photo_gallery[0][owner]', photoGallery.owner);
        if (photoGallery.date_taken) {
            formData.append('photo_gallery[0][date_taken]', new Date(this._formatDMYtoYMD(photoGallery.date_taken)).toISOString());
        }

        this.http
            .post(`${environment.app.apiUrl}/api/stations/${this.station_id}/photo-galleries`, formData)
            .subscribe({
                next: response => {
                    const medias = response as any[];
                    console.log('medias: ' + JSON.stringify(medias));
                    this.photo_gallery = [];
                    if (medias) {
                        medias.forEach(element => {
                            console.log(JSON.stringify(element))
                            if(element.custom_properties.angle_of_view){
                                const data = {
                                    id: element.id,
                                    photo: this._replaceMediaUrl(element.original_url),
                                    caption: element.custom_properties.caption,
                                    date_taken: new Date(element.custom_properties.date_taken),
                                    direction_of_view: element.custom_properties.direction_of_view,
                                    direction_of_view_id: element.custom_properties.direction_of_view.id,
                                    direction_of_view_name: element.custom_properties.direction_of_view.name,
                                    angle_of_view: element.custom_properties.angle_of_view,
                                    angle_of_view_id: element.custom_properties.angle_of_view.id,
                                    angle_of_view_name: element.custom_properties.angle_of_view.value,
                                    owner: element.custom_properties.owner
                                };

                                this.photo_gallery.push(data);
                            }else{

                                const data2 = {
                                    id: element.id,
                                    photo: this._replaceMediaUrl(element.original_url),
                                    caption: element.custom_properties.caption,
                                    date_taken: new Date(element.custom_properties.date_taken),
                                    direction_of_view: element.custom_properties.direction_of_view,
                                    direction_of_view_id: element.custom_properties.direction_of_view.id,
                                    direction_of_view_name: element.custom_properties.direction_of_view.name,
                                    owner: element.custom_properties.owner
                                };
                                this.photo_gallery.push(data2);
                            }

                        });
                    }
                    this._generateMsg('success', 'Successful', 'Data is saved successfully');
                    this.disabled = true;
                    this.spinnerService.hide();
                    this.state$.next(true);
                    this.createDataFormPhotoGallery(null);
                },
                error: err => {
                    this._errorHandler(err);
                }
            });
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
        this.dialogAffiliation = false;
        this.createDataFormAffiliation(null);
    }

    // Begin DeclaredStatus
    editDeclaredStatus(data: any) {
        this.dialogDeclaredStatus = true;
        this.submitted = false;
        this.newData = false;
        console.log(JSON.stringify(data));
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
    getDatasPhoto() {
        return this.photo_gallery;
    }

    setDatas(datas: any[]) {
        this.datas = datas;
    }
    setDatasPhoto(datas: any[]) {
        this.photo_gallery = datas;
    }
    updateTableDisplay(datas: any[], req: any, resp: any) {
        return this._updateTableDisplay(datas, resp);
    }
}
