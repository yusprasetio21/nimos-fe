import { UrlDialogComponent } from './deployment/dialog/dataURL/url-dialog.component';
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/base.component';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, LazyLoadEvent, MenuItem, MessageService, SelectItem, TreeNode } from 'primeng/api';

import {FlatTreeControl} from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { Observation, Program } from './model/observation';
import { MatDialog } from '@angular/material/dialog';
import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { ExposureOfInstrumentTypes } from './model/exposureOfInstrumentTypes';
import { SourceType } from './model/sourceType';
import { TypeReferenceSurface } from './model/type_reference_surface_type';
import { DatePipe } from '@angular/common';
import { end } from '@popperjs/core';
import { Deployment } from './model/deployment';
import { FrequencyType } from './model/frequency_types';
import { MatTableDataSource } from '@angular/material/table';
import { TreeModel } from './model/tree';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DeploymentDialogComponent } from './deployment/deployment-dialog.component';
import { AplicationAreaDialogComponent } from './deployment/dialog/aplicationArea/aplication-area-dialog.component';
import { DataObservationDialogComponent } from './observations/data-observation-dialog.component';
import { DataGenerationDialogComponent } from './deployment/dialog/data_generation/data-generation-dialog.component';
import { InsertObservationDialogComponent } from './observations/dialog/insert_observation/insert-observation-dialog.component';
// import {Observation} from '@model/observation';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'Observation',
    templateUrl: './observation.component.html',
    styleUrls: ['./observation.component.scss'],
    providers: [MessageService, ConfirmationService,DialogService]
})
export class ObservationComponent extends MoreComponent implements OnInit{

    private _transformer = (node: TreeModel, level: number) => {
        return {
          id:node.id,
          index:node.index,
          path:node.path,
          expandable: !!node.children && node.children.length > 0,
          text: node.text,
          variable:node.text!=undefined && node.text!=null ?node.text.split(">")[1]:'',
          level: level,
        };
    };

    treeControl: FlatTreeControl<ExampleFlatNode>;
    treeFlattener: MatTreeFlattener<TreeModel, any>;

    dataSource: MatTreeFlatDataSource<TreeModel, any>;

    treeObservation: MatTreeFlatDataSource<TreeModel, any>;
    treeMethod: MatTreeFlatDataSource<TreeModel, any>;

    //Observation
    idDummyObservation:number=0;
    dataObs:any[] = [];
    observationList:any[] = [];
    programOption:SelectItem[] = [];
    programNetworksMap = new Map();
    lastUpdateMap = new Map();
    //Deployement
    idDummyDeployment:number=0;
    deployList : any[]= [];
    deployMap = new Map();
    instrumentMap = new Map();
    //KONSEPNYA NTUH SPRTI INI map.set('<path_geometry>', 'deploylist');
    //<path_geometry> untuk get data deploynya.. jdi tidk mnggunakan array
    exposureTypeOptions:SelectItem[]=[];
    sourceObsOptions:SelectItem[]=[];
    referenceSurfaceOptions:SelectItem[]=[];
    reprObsTypeOptions: SelectItem[] = [];
    measurementUnitOptions: SelectItem[] = [];
    measurementLeadOptions: SelectItem[] = [];
    organizationOptions: SelectItem[] = [];
    dataComunicationMethodsOption: SelectItem[] = [];

    aplicationAreaOption: SelectItem[] = [];
    dataCentersOption: SelectItem[] = [];
    polarizationOption: SelectItem[] = [];
    transmissionOption: SelectItem[] = [];
    geopositioningOption: SelectItem[] = [];
    statusOption: SelectItem[] = [];
    frequencyTypes: FrequencyType[] = [];
    frequencyUnitTypeOption: SelectItem[] = [];
    locationTypesOption: SelectItem[] = [];
    standartTypeOption: SelectItem[] = [];
    activityResultOption: SelectItem[] = [];
    uncertaintyEstimateProductOption: SelectItem[] = [];

    //data generation
    intervalUnitOption: SelectItem[] = [];
    samplingStrategyOption: SelectItem[] = [];
    samplingProcedureOption: SelectItem[] = [];
    samplingTreatmentOption: SelectItem[] = [];
    dataPoliciesOption: SelectItem[] = [];
    levelOption: SelectItem[] = [];
    formatsOption: SelectItem[] = [];
    referenceTimesOption: SelectItem[] = [];
    qualityOption: SelectItem[] = [];
    timestampMeaningsOption:SelectItem[] = [];
    // processingOption: SelectItem[] = [];

    station_id:any;
    station_name :any;
    station_identifier: any;
    

    insManufacturerOption: SelectItem[] = [];
    insModelOption: SelectItem[] = [];

    coordinateColumns: string[] = ['latitude', 'longitude','elevation','geopositioning','from'];

    hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
    getLevel = (node: ExampleFlatNode) => node.level;

    id_station:number;
    jsonRequest:Observation[]=[];
    geomteryOptions:SelectItem[]=[];
    form: FormGroup;
    constructor(
      public dialogService: DialogService,
      public datepipe: DatePipe,
      private dialog: MatDialog,
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
      this.form = this.fb.group({
        credentials: this.fb.array([]),
      });
  }

  ref: DynamicDialogRef;
  reportingTime = new Map();

  obserDialog():void{
    let dialog = this.dialogService.open(DataObservationDialogComponent, {
      header: 'Management Observation',
      width: '70%',
      contentStyle: {"max-height": "50%", "overflow": "auto"},
      baseZIndex: 10000,
      data: {dataSource:JSON.parse(JSON.stringify(this.jsonRequest)),idDummy:this.idDummyObservation,dataSourceTree:this.treeObservation.data,
        geomteryOptions:this.geomteryOptions,treeMethod:this.treeMethod.data,programOption:this.programOption}
    });

    dialog.onClose.subscribe((result) =>{
      if(result!=undefined){
        // console.log(JSON.stringify(result));
        this.idDummyObservation = result.idDummy;

        // Debug: lihat struktur jsonRequest
        console.log('jsonRequest type:', typeof result.jsonRequest);
        console.log('jsonRequest value:', result.jsonRequest);

        for(var request of result.jsonRequest){
          console.log(JSON.stringify(request))
          this.controllDataObservation(request);
        }
      }
    });
  }
  
  idDummyGeneration:number=0;

  deploymentDialog(idObservation:any,dataUpdate?:any){
    let dialog = this.dialogService.open(DeploymentDialogComponent, {
      header: 'Management Deployment',
      width: '70%',
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000,
      data: {observation_id:idObservation,dataUpdate:dataUpdate,
        //general info
        sourceObsOptions:this.sourceObsOptions,
        referenceSurfaceOptions:this.referenceSurfaceOptions,
        exporsureTypeOptions:this.exposureTypeOptions,
        reprObsTypeOptions:this.reprObsTypeOptions,
        measurementOptions:this.measurementUnitOptions,
        measurementLeadOptions:this.measurementLeadOptions,
        organizationOptions:this.organizationOptions,
        dataComunicationMethodsOption:this.dataComunicationMethodsOption,
        aplicationAreaOption:this.aplicationAreaOption,
        dataCentersOption:this.dataCentersOption,
        
        //instrument characteristic
        manufacturerOptions:this.insManufacturerOption,
        modelOptions:this.insModelOption,
        treeMethod:this.treeMethod.data,
        geopositioningOption:this.geopositioningOption,// dialog coordinate
        statusOption:this.statusOption,// dialog status
        uncertaintyEstimateProductOption:this.uncertaintyEstimateProductOption,
        frequencyTypes:this.frequencyTypes,//dialog frequency
        frequencyUnitTypeOption:this.frequencyUnitTypeOption,//dialog frequency
        transmissionOption:this.transmissionOption,//dialog frequency
        polarizationOption:this.polarizationOption,// dialog frequency
        maintenancePartyOption:this.organizationOptions,//dialog maintenance
        locationTypesOption:this.locationTypesOption,//dialog quality
        standartTypeOption:this.standartTypeOption,//dialog quality
        activityResultOption:this.activityResultOption,//dialog quality

        //data_generation
        intervalUnitOption:this.intervalUnitOption,
        samplingStrategyOption:this.samplingStrategyOption,
        samplingTreatmentOption:this.samplingTreatmentOption,
        samplingProcedureOption:this.samplingProcedureOption,
        dataPoliciesOption:this.dataPoliciesOption,
        levelOption:this.levelOption,
        formatsOption:this.formatsOption,
        referenceTimesOption:this.referenceTimesOption,
        qualityOption:this.qualityOption,
        processingOption:this.organizationOptions,
        timestampMeaningsOption:this.timestampMeaningsOption,

        idDummy:this.idDummyDeployment,
        idDummyGeneration:this.idDummyGeneration
        }
    });

    dialog.onClose.subscribe((result) =>{
      // console.log(idDeployment);
      if(result!=undefined)this.controllDataDeployment(result,idObservation);
    });
  }

  ngOnInit() {
    // this.loadDatas();
    this.station_id = localStorage.getItem('station_id');
    //console.log("station id="+this.station_id)
    this.station_name = localStorage.getItem('station_name');
    this.station_identifier = localStorage.getItem('station_identifier');

    this.treeControl = new FlatTreeControl<ExampleFlatNode>(node => node.level,node => node.expandable,);
    this.treeFlattener = new MatTreeFlattener(this._transformer,node => node.level,node => node.expandable,node => node.children,);

    this.treeObservation  = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.treeMethod= new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    // var x :any = new Date("2023-01-09T17:00:00.000Z");
    // console.log(x);
    // console.log(this.datepipe.transform(Date.parse(x), 'yyyy-MM-dd'));
    if(this.station_id!=null)this.loadDatas();
    else{
      setTimeout(() => {
        this.router.navigate(['/my-stations']);
    }, 3000);
    }
  }

  loadDatas() {
    //get geomtery for dialog
    this.spinnerService.show();
    this._createDropdownList2('api/lists/types/geometries?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Geometry -',this.geomteryOptions);

    this.http.get<any>(`${environment.app.apiUrl}/api/lists/programs?filter[stations.id]=`+this.station_id).subscribe({
      next: data => {
        const _dataOptions = <any[]>data;
        this.programOption.push({ label:'- Program / Network Affiliation -' , value: null });
        for(var data of _dataOptions){
          this.programOption.push({ value:data.id ,label: data.program_type.text });  
        }
        this.state$.next(true);
      }});

    //For Deployment
    //General INFO
    this._createDropdownList2('api/lists/types/source-of-observations?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Source Observation -',this.sourceObsOptions);

    this.http.get(`${environment.app.apiUrl}/api/lists/types/exposure-of-instruments?filter[lang]=`+this.lang).subscribe({
      next: datas => {
        this.exposureTypeOptions.push({ label: "- Esposure Of Instrument -", value: null });
        const _dataOptions = <any[]>datas;
        for(var data of _dataOptions){
          var label : string = data.name+" ("+data.description+")";
          this.exposureTypeOptions.push({ label:label ,value: data.id });
        }
      },
      error: err => {
          this._errorHandler(err);
    }});

    this._createDropdownList2('api/lists/types/reference-surface-types?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Type Reference Surface -',this.referenceSurfaceOptions);

    this._createDropdownList2('api/lists/users',new HttpParams(),'name','id',
    '- Users -',this.measurementLeadOptions);

    this._createDropdownList2('api/lists/types/measurement-units',new HttpParams(),'name','id',
    '- Type Measurment Unit-',this.measurementUnitOptions);

    this._createDropdownList2('api/lists/organizations',new HttpParams(),'long_name','id',
    '- Organization -',this.organizationOptions);

    this._createDropdownList2('api/lists/types/data-communication-methods?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Data Comnication Method -',this.dataComunicationMethodsOption);

    this._createDropdownList2('api/lists/types/representativeness?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Representativeness of observation -',this.reprObsTypeOptions);

    this._createDropdownList2('api/lists/types/data-centers?filter[lang]='+this.lang,new HttpParams(),'value','id',
    '- Data Centre -',this.dataCentersOption);

    this._createDropdownList2('api/lists/types/application-areas?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Aplication Area -',this.aplicationAreaOption);

    this._createDropdownList2('api/lists/types/polarizations?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Polarization -',this.polarizationOption);

    this._createDropdownList2('api/lists/types/transmission-modes?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Tranmission -',this.transmissionOption);

    this._createDropdownList2('api/lists/types/geopositioning-methods?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Geopositioning -',this.geopositioningOption);

    this._createDropdownList2('api/lists/types/operating-statuses?filter[lang]='+this.lang,new HttpParams(),'value','id',
    '- Status -',this.statusOption);
    
    this._createDropdownList2('api/lists/types/uncertainty-estimate-procedures?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Uncertainty Estimate Procedure -',this.uncertaintyEstimateProductOption);

    this.http.get(`${environment.app.apiUrl}/api/lists/types/frequency-units?filter[lang]=`+this.lang).subscribe({ 
      next: datas => {
      const _dataOptions = <any[]>datas;
      for(var data of _dataOptions){
        var value = data.value+" ("+data.description+")"
        this.frequencyUnitTypeOption.push({ label:value ,value: data.id });
      }
    }});

    this.http.get(`${environment.app.apiUrl}/api/lists/types/frequency-types?filter[lang]=`+this.lang).subscribe(datas =>{ 
      this.frequencyTypes = <any[]>datas;
    });

    this.http.get(`${environment.app.apiUrl}/api/lists/types/control-locations?filter[lang]=`+this.lang).subscribe({ 
      next: datas => {
        this.locationTypesOption=[];
        this.locationTypesOption.push({ label:'- Location -' ,value:null });
        const _dataOptions = <any[]>datas;
        for(var data of _dataOptions){
          var value = data.name+" ("+data.description+")"
          this.locationTypesOption.push({ label:value ,value: data.id });
        }
    }});

    this._createDropdownList2('api/lists/types/control-standards?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Standart -',this.standartTypeOption);

    this._createDropdownList2('api/lists/types/instrument-control-results?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Reulst -',this.activityResultOption);

    this._createDropdownList2('api/lists/types/manufacturers?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Manufacturer -',this.insManufacturerOption);

    this._createDropdownList2('api/lists/types/instrument-models?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Instrument -',this.insModelOption);
   
    this.http.get(`${environment.app.apiUrl}/api/lists/types/interval-units?filter[lang]=`+this.lang).subscribe({
      next: datas => {
        const _dataOptions = <any[]>datas;
        // console.log(JSON.stringify(_dataOptions))
        for(var data of _dataOptions){
          var label = data.value+" "+data.description;
          this.intervalUnitOption.push({ label:label ,value: data.id });
        }
        this.state$.next(true);
      },
      error: err => {
          this._errorHandler(err);
      }
    });
    this._createDropdownList2('api/lists/types/sampling-strategies?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Strategy -',this.samplingStrategyOption);
    this._createDropdownList2('api/lists/types/sample-treatments?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Treatment -',this.samplingTreatmentOption);
    this._createDropdownList2('api/lists/types/sampling-procedures?filter[lang]='+this.lang,new HttpParams(),'value','id',
    '- Procedure -',this.samplingProcedureOption);
    this._createDropdownList2('api/lists/types/data-policies?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Policie -',this.dataPoliciesOption);
    this._createDropdownList2('api/lists/types/level-of-data?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Level Data -',this.levelOption);  
    this._createDropdownList2('api/lists/types/data-formats?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Format -',this.formatsOption);  
    this._createDropdownList2('api/lists/types/reference-times?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Reference -',this.referenceTimesOption);    
    this._createDropdownList2('api/lists/types/quality-flag-systems?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Flag System -',this.qualityOption);  
    // this._createDropdownList2('api/lists/organizations',new HttpParams(),'long_name','id',
    // '- Organization -',this.processingOption);  
    this._createDropdownList2('api/lists/types/timestamp-meanings?filter[lang]='+this.lang,new HttpParams(),'name','id',
    '- Timestamp Meaning -',this.timestampMeaningsOption);  
    
    //END for Deployment

    // get observation treefull
    this.spinnerService.show();
    this.http.get<any>(`${environment.app.apiUrl}/api/lists/tree/variables`).subscribe({
      next: data => {
        this.treeObservation.data=JSON.parse(JSON.stringify(data));
        // get method
        this.spinnerService.show();
        this.http.get<any>(`${environment.app.apiUrl}/api/lists/tree/methods`).subscribe({
          next: data => {
            this.treeMethod.data=JSON.parse(JSON.stringify(data));
            // this.spinnerService.show();
            this.spinnerService.show();
            this.http.get(`${environment.app.apiUrl}/api/stations/`+this.station_id+`/observations`).subscribe({
              next: data => {
                  var datas = <any[]>data;
                  // console.log(JSON.stringify(data));
                  if(datas.length >0){
                     for(var request of datas){
                      this.controllDataObservation(request);
                      for(var deployment of request.deployments){
                        this.renameNameJSON("aggregation_period","aggregation_priod",deployment.data_generation);
                        this.renameNameJSON("station_elevation","elevation",deployment.data_generation);
                        this.renameNameJSON("interval","sampling_interval",deployment.data_generation);
                        for(let generation of deployment.data_generation){
                          this.renameNameJSON("interval_unit_id","sampling_interval_unit_id",generation.sampling);
                        }
                        this.renameNameJSON("period","sampling_period",deployment.data_generation);
                        this.renameNameJSON("period_unit","sampling_period_unit",deployment.data_generation);
                        this.controllDataDeployment(deployment,request.id);
                      }
                      this.spinnerService.hide();
                  }
                  }else{
                    this.spinnerService.hide();
                  }
              },
              error: err => {
                  this._errorHandler(err);
            }});
          },
          error: err => {
            this._generateMsg('error', 'Error', err?.error?.message);
        }
        });
      }
    });
  }

  findNodeById(list: TreeModel[], id: number): TreeModel | undefined {
    for (const n of list) {
      if (n.id === id){
        return n;
      }
    }
    for (const n of list) {
      const res = this.findNodeById(n.children!=undefined?n.children:[], id);
      if (res) {
        if(res.id === id)
        return res;
      }
    }
  }

  controllDataDeployment(result:any,key:any){
    result.photos=[];

    // console.log(result.from);
    // console.log(this.datepipe.transform(Date.parse(result.from), 'dd-MM-yyyy'));
    // var x = new Intl.DateTimeFormat("en-id");
    // var tittle = "FROM "+x.format()?
    var tittle = "FROM "+this.datepipe.transform(Date.parse(result.from), 'dd-MM-yyyy');
    var toDateDep = this.datepipe.transform(Date.parse(result.to), 'dd-MM-yyyy');
    if(toDateDep!== null)tittle = tittle +" TO "+toDateDep;
    result.tittle = tittle;
    

    // General Info
    var idTemp =result.id;//create id 


    //Instrument Characteristic
    if(result.instrument!=null && result.instrument!=undefined){
      result.instrument.manufacturer_desc = this.insManufacturerOption.find((o: { value: any; }) => o.value === result.instrument.manufacturer_id)?.label;
      result.instrument.instrument_model_desc = this.insModelOption.find((o: { value: any; }) => o.value === result.instrument.instrument_model_id)?.label;
      result.instrument.observing_method_desc = this.findNodeById(this.treeMethod.data,result.instrument.observing_method_id)?.text;;

      result.instrument.instrument_assigned_type_desc= this.insModelOption.find((o: { value: any; }) => o.value === result.instrument.instrument_model_id)?.label;
      result.instrument.uncertainty_evaluation_procedure_desc= this.insModelOption.find((o: { value: any; }) => o.value === result.instrument.instrument_model_id)?.label;
    }
    //Data generation
    if(result.data_generation!=null && result.data_generation.length>0){
      for(var position:number=0;position<result.data_generation.length;position++){
        var tittle = "FROM "+this.datepipe.transform(Date.parse(result.data_generation[position].from), 'dd-MM-yyyy');
        var toDate = this.datepipe.transform(Date.parse(result.data_generation[position].to), 'dd-MM-yyyy');;
        if(toDate!== null)tittle = tittle +" TO "+toDate;
        result.data_generation[position].tittle = tittle;
        //sampling
        if(result.data_generation[position].sampling!=null){
          if(result.data_generation[position].sampling.sampling_strategy_id!=null){
            var strategy = this.samplingStrategyOption.find((o: { value: any; }) => o.value === result.data_generation[position].sampling.sampling_strategy_id);
            result.data_generation[position].sampling.sampling_strategy_desc=strategy?.label;
          }
          if(result.data_generation[position].sampling.sampling_interval_unit_id!=null){
            var interval = this.intervalUnitOption.find((o: { value: any; }) => o.value === result.data_generation[position].sampling.sampling_interval_unit_id);
            result.data_generation[position].sampling.interval_unit_desc=interval?.label;
          }
          if(result.data_generation[position].sampling.sampling_period_unit!=null){
            var priod = this.intervalUnitOption.find((o: { value: any; }) => o.value === result.data_generation[position].sampling.sampling_period_unit);
            result.data_generation[position].sampling.priod_unit_desc=priod?.label;
          }
          if(result.data_generation[position].sampling.sampling_procedure_id!=null){
            var production = this.samplingProcedureOption.find((o: { value: any; }) => o.value === result.data_generation[position].sampling.sampling_procedure_id);
            result.data_generation[position].sampling.sampling_procedure_desc=production?.label;
          }
          if(result.data_generation[position].sampling.sample_treatment_id!=null){
            var treatment = this.samplingTreatmentOption.find((o: { value: any; }) => o.value === result.data_generation[position].sampling.sample_treatment_id);
            result.data_generation[position].sampling.sample_treatment_desc=treatment?.label;
          }
        }
        //processing
        if(result.data_generation[position].processing!=null){
          if(result.data_generation[position].processing.interval_unit_id !=null){
            var interval = this.intervalUnitOption.find((o: { value: any; }) => o.value === result.data_generation[position].processing.interval_unit_id);
            result.data_generation[position].processing.interval_unit_desc=interval?.label;
          }
          //console.log(JSON.stringify(result.data_generation[position]));
          if(result.data_generation[position].processing.processing_centre !=null){
            var centre = this.organizationOptions.find((o: { value: any; }) => o.value === result.data_generation[position].processing.processing_centre);
            result.data_generation[position].processing.processing_centre_desc=centre?.label; 
          }
        }
        //reporting
        if(result.data_generation[position].reporting!=null){
          var time = result.data_generation[position].reporting.schedule.reporting_interval;
          this.reportingTime.set(result.data_generation[position].id,this.splitTime(time));

          if(result.data_generation[position].reporting.measurement_unit_id !=null){
            var measurement = this.measurementUnitOptions.find((o: { value: any; }) => o.value === result.data_generation[position].reporting.measurement_unit_id);
            result.data_generation[position].reporting.measurement_unit_desc=measurement?.label;
          }
          if(result.data_generation[position].reporting.data_policy_id !=null){
            var policy = this.dataPoliciesOption.find((o: { value: any; }) => o.value === result.data_generation[position].reporting.data_policy_id);
            result.data_generation[position].reporting.data_policy_desc=policy?.label;
          }
          if(result.data_generation[position].reporting.timeliness_unit !=null){
            var timeliness = this.intervalUnitOption.find((o: { value: any; }) => o.value === result.data_generation[position].reporting.timeliness_unit);
            result.data_generation[position].reporting.timeliness_desc=timeliness?.label;
          }
          if(result.data_generation[position].reporting.level_of_data_id !=null){
            var level = this.levelOption.find((o: { value: any; }) => o.value === result.data_generation[position].reporting.level_of_data_id);
            result.data_generation[position].reporting.level_of_data_desc=level?.label; 
          }
          if(result.data_generation[position].reporting.data_format_id !=null){
            var format = this.formatsOption.find((o: { value: any; }) => o.value === result.data_generation[position].reporting.data_format_id);
            result.data_generation[position].reporting.data_format_desc=format?.label; 
          }
          if(result.data_generation[position].reporting.reference_time_id !=null){
            var reference = this.referenceTimesOption.find((o: { value: any; }) => o.value === result.data_generation[position].reporting.reference_time_id);
            result.data_generation[position].reporting.reference_time_desc=reference?.label; 
          }
          if(result.data_generation[position].reporting.quality_flag_system_id !=null){
            var quality = this.qualityOption.find((o: { value: any; }) => o.value === result.data_generation[position].reporting.quality_flag_system_id);
            result.data_generation[position].reporting.quality_flag_system_desc=quality?.label; 
          }
          if(result.data_generation[position].reporting.timestamp_meaning_id !=null){
            var meaning = this.timestampMeaningsOption.find((o: { value: any; }) => o.value === result.data_generation[position].reporting.timestamp_meaning_id);
            result.data_generation[position].reporting.timestamp_meaning_desc=meaning?.label; 
          }
        }
      } 
    }

    var content:Deployment = JSON.parse(JSON.stringify(result));

    //General Info
    if(result.source_of_observation_id!=null){
      let sourceObs = this.sourceObsOptions.find((o: { value: any; }) => o.value === result.source_of_observation_id);
      content.source_obs_desc= sourceObs?.label;
    }
    if(result.representativeness_id!=null){
      let reprObsType = this.reprObsTypeOptions.find((o: { value: any; }) => o.value === result.representativeness_id);
      content.representativeness_of_obs_desc = reprObsType?.label;
    }
    if(result.reference_surface_type_id!=null){
      let reprObsType = this.referenceSurfaceOptions.find((o: { value: any; }) => o.value === result.reference_surface_type_id);
      content.reference_surface_type_desc = reprObsType?.label;
    }
    if(result.exposure_id!=null){
      let reprObsType = this.exposureTypeOptions.find((o: { value: any; }) => o.value === result.exposure_id);
      content.exposure_desc = reprObsType?.label;
    }
    if(result.measurement_leader!=null){
      let reprObsType = this.measurementLeadOptions.find((o: { value: any; }) => o.value === result.measurement_leader);
      content.measurement_leader_desc = reprObsType?.label;
    }
    if(result.organization_id!=null){
      let reprObsType = this.organizationOptions.find((o: { value: any; }) => o.value === result.organization_id);
      content.organization_desc = reprObsType?.label;
    }
    if(result.data_centre_id!=null){
      let reprObsType = this.dataCentersOption.find((o: { value: any; }) => o.value === result.data_centre_id);
      content.data_centre_desc = reprObsType?.label;
    }
    if(result.data_communication_method_id!=null){
      let reprObsType = this.dataComunicationMethodsOption.find((o: { value: any; }) => o.value === result.data_communication_method_id);
      content.data_communicatino_method_desc = reprObsType?.label;
    }
    

    // console.log(JSON.stringify(result));
    if(content.instrument!=undefined){
      let manufacturer = this.insManufacturerOption.find((o: { value: any; }) => o.value === content.instrument?.manufacturer_id);
      let model = this.insModelOption.find((o: { value: any; }) => o.value ===content.instrument?.instrument_model_id);
      let pathVariable = this.findNodeById(this.treeMethod.data,content.instrument?.observing_method_id);
      content.instrument.manufacturer_desc = manufacturer?.label;
      content.instrument.instrument_model_desc=model?.label;
      content.instrument.observing_method_desc=pathVariable?.text;

      //Create Tabel Coordinate
      var dataSourceCoordinates = new MatTableDataSource<any>();
      var dataSourceStatus = new MatTableDataSource<any>();
      var dataSourceFrequencyPolarization = new MatTableDataSource<any>();
      var dataSourceTelecomunication = new MatTableDataSource<any>();
      var dataSourceMaintenance = new MatTableDataSource<any>();
      var dataSourceQuality = new MatTableDataSource<any>();
      // Create Tabel coordinate
      for(var coor of JSON.parse(JSON.stringify(content.instrument?.coordinates))){
        coor.geopositioning_name = this.geopositioningOption.find((o: { value: any; }) => o.value === coor.geopositioning_method_id)?.label;
        var date:any = this.datepipe.transform(Date.parse(coor.from), 'dd-MM-yyyy');
        if(date!=null)coor.from =date ;
        
        dataSourceCoordinates.data.push(coor);
      }
      //Create Tabel Operating Status
      for(var status of JSON.parse(JSON.stringify(content.instrument?.operating_statuses))){
        status.instrument_operating_status_desc = this.statusOption.find((o: { value: any; }) => o.value === status.instrument_operating_status_id)?.label;

        var dateFrom:any = this.datepipe.transform(Date.parse(status.from), 'dd-MM-yyyy');
        if(dateFrom!=null)status.from =dateFrom ;

        var dateTo:any = this.datepipe.transform(Date.parse(status.to), 'dd-MM-yyyy');
        if(dateTo!=null)status.to =dateTo ;

        dataSourceStatus.data.push(status);
      }
      //Create Tabel Frequency Polarization
      for(var polarization of JSON.parse(JSON.stringify(content.instrument?.observation_frequency_and_polarization))){
        polarization.frequency_type_desc=this.frequencyTypes.find((o: { id: any; }) => o.id === polarization.use_of_frequency)?.name;
        polarization.frequency_unit_desc=this.frequencyUnitTypeOption.find((o: { value: any; }) => o.value === polarization.frequency_unit_id)?.label;
        polarization.bandwidth_unit_desc=this.frequencyUnitTypeOption.find((o: { value: any; }) => o.value === polarization.bandwidth_unit_id)?.label;
        polarization.transmission_desc = this.transmissionOption.find((o: { value: any; }) => o.value === polarization.transmission_mode_id)?.label;
        polarization.polarization_desc= this.polarizationOption.find((o: { value: any; }) => o.value === polarization.polarization_id)?.label;

        dataSourceFrequencyPolarization.data.push(polarization);
      }

      //Create Tabel Telecomunication Frequency
      for(var frquency of JSON.parse(JSON.stringify(content.instrument?.telecommunication_frequencies))){
        frquency.frequency_type_desc=this.frequencyTypes.find((o: { id: any; }) => o.id === frquency.use_of_frequency)?.name;
        frquency.frequency_unit_desc=this.frequencyUnitTypeOption.find((o: { value: any; }) => o.value === frquency.frequency_unit_id)?.label;
        frquency.bandwidth_unit_desc=this.frequencyUnitTypeOption.find((o: { value: any; }) => o.value === frquency.bandwidth_unit_id)?.label;

        dataSourceTelecomunication.data.push(frquency);
      }

      // Create Tabel Maintenance Logbook
      for(var maintenance of JSON.parse(JSON.stringify(content.instrument?.maintenance_logbooks))){
        maintenance.maintenance_party_desc=this.organizationOptions.find((o: { value: any; }) => o.value === maintenance.maintenance_party)?.label;

        dataSourceMaintenance.data.push(maintenance);
      }

      // Create Tabel Quality Assurance
      for(var qualitys of JSON.parse(JSON.stringify(content.instrument?.quality_assurance_logbooks))){
        // console.log(JSON.stringify(qualitys));
        qualitys.location_desc=this.locationTypesOption.find((o: { value: any; }) => o.value === qualitys.location_id)?.label;
        qualitys.standart_desc=this.standartTypeOption.find((o: { value: any; }) => o.value === qualitys.standard_type_id)?.label;
        qualitys.activity_desc=this.activityResultOption.find((o: { value: any; }) => o.value === qualitys.activity_result_id)?.label;

        dataSourceQuality.data.push(qualitys);
      }

      if(dataSourceCoordinates.data.length > 0)this.instrumentMap.set(content.instrument?.id+"_coordinate",dataSourceCoordinates.data);
      if(dataSourceStatus.data.length > 0)this.instrumentMap.set(content.instrument?.id+"_operating_status",dataSourceStatus.data);
      if(dataSourceFrequencyPolarization.data.length > 0)this.instrumentMap.set(content.instrument?.id+"_frequency_polarization",dataSourceFrequencyPolarization.data);
      if(dataSourceTelecomunication.data.length > 0)this.instrumentMap.set(content.instrument?.id+"_telecomunication_frequency",dataSourceTelecomunication.data);
      if(dataSourceMaintenance.data.length > 0)this.instrumentMap.set(content.instrument?.id+"_maintenance",dataSourceMaintenance.data);
      if(dataSourceQuality.data.length > 0)this.instrumentMap.set(content.instrument?.id+"_quality",dataSourceQuality.data);

    }
    if(this.deployMap.get(key) == undefined){
      // kosong
      var values :any[] = [];
      values.push({tittle:tittle,content:content, panelOpenState: true});
      this.deployMap.set(key,[{tittle:tittle,content:content, panelOpenState: true}]);

      this.jsonRequest[this.jsonRequest.findIndex(data=>data.id === key)].deployments=[];
      this.jsonRequest[this.jsonRequest.findIndex(data=>data.id === key)].deployments?.push(content);
    }else{
      var count:number=0;
      var values :any[] = this.deployMap.get(key);
      for(var value of values){
        if(value.content.id == idTemp){

          values[values.findIndex(item=>item.content.id === idTemp)]={tittle:tittle,content:content, panelOpenState: true};
          this.deployMap.set(key,values);
          var deployment : Deployment[] | undefined=this.jsonRequest[this.jsonRequest.findIndex(data=>data.id === key)].deployments;
          if(deployment != undefined){
            deployment[deployment.findIndex((x: { id: any; })=>x.id === idTemp)]=content;
            this.jsonRequest[this.jsonRequest.findIndex(data=>data.id === key)].deployments = deployment;
          }
          count--;
        }
        count++;
      }
      if(count == values.length){
        //insert
        values.push({tittle:tittle,content:content, panelOpenState: true});
        // console.log(JSON.stringify(values));
        this.deployMap.set(key,values);
        this.jsonRequest[this.jsonRequest.findIndex(data=>data.id === key)].deployments?.push(content);
      }
      // this.state$.next(true);
    }
    this.state$.next(true);
    console.log(JSON.stringify(this.jsonRequest));
  }

  refreshDataSource(datas:any[]): Observable<any[]> {
    let randomlyFilledList = datas;
    return of(randomlyFilledList);
  }

  recursiveNodeEliminator(tree: Array<TreeModel>): boolean {
    for (let index = tree.length - 1; index >= 0; index--) {
      const node = tree[index];
      if (node.children && node.data==undefined) {
        //memiliki childern
        const parentCanBeEliminated = this.recursiveNodeEliminator(node.children);
        if (parentCanBeEliminated) {
          if (node.data==undefined) {
            tree.splice(index, 1);
          }
        }
      } else {
        //mentok
        if (node.data==undefined) {
          tree.splice(index, 1);
        }else{
        }
      }
    }
    return tree.length === 0;
  }

  updateDeployment(content:any,idDeployment:any){
    // console.log(JSON.stringify(item));
    // console.log(key);
    this.deploymentDialog(idDeployment,content);
  }

  deleteDeployment(item:any,key:any){
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete data Deployment?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        var position:number =0;
        var values : any[]= this.deployMap.get(key);
        if(values!=undefined){
          for(var value of values){
            if(value.content.id==item.id){
              values.splice(position,1);
              this.deployMap.set(key,values);
              var deployment : Deployment[] | undefined=this.jsonRequest[this.jsonRequest.findIndex(data=>data.id === key)].deployments;
              if(deployment != undefined){
                deployment.splice(deployment.findIndex((x: { id: any; })=>x.id === item.id),1);
                this.jsonRequest[this.jsonRequest.findIndex(data=>data.id === key)].deployments = deployment;
                // console.log(JSON.stringify(this.jsonRequest));
              }

              this.state$.next(true);
            }
            position++;
          }
        }
      },
      reject: () => {
          
      }
    });
  }

controllDataObservation(result:any){
    // Tambahkan null check untuk result
    if (!result) {
        console.error('Result is undefined in controllDataObservation');
        return;
    }

    // this.changeDateFormatInJson("from",result);
    // this.changeDateFormatInJson("to",result);
    // this.changeDateFormatInJson("created_at",result);
    // this.changeDateFormatInJson("updated_at",result);
    let pathVariable = this.findNodeById(this.treeObservation.data,result.observed_variable_id);
    let geometry = this.geomteryOptions.find((o: { value: any; }) => o.value === result.geometry_id);

    let last_update = result.updated_at != null && result.updated_by != null?this.datepipe.transform(Date.parse(result.updated_at), 'dd-MM-yyyy')+' by-'+result.updated_by.name:"";
    var content:Observation={
      id:result.id,//mandatory
      observed_variable_id:result.observed_variable_id,//mandatory
      programs:result.programs || [], // BERIKAN DEFAULT VALUE array kosong
      geometry_id:result.geometry_id,//mandatory
      observing_method_id:result.observing_method_id,
      // observed_since:this.datepipe.transform(Date.parse(result.observed_since), 'yyyy-MM-dd'),
      observed_since:result.observed_since,

      last_update:last_update,
      variable:pathVariable?.text,
      geometryName: geometry?.label,
    };
    
    //Set data Program Netwok Affiliation
    // PERBAIKAN: Gunakan optional chaining dan null check
    if(result.programs && Array.isArray(result.programs) && result.programs.length>0){
      let programNetworks :Program[]=[];
      for(let program of result.programs){
        // this.instrumentMap.set(content.instrument?.id,dataSourceCoordinates);
        let item = this.programOption.find((o: { value: any; }) => o.value === program.id);
        if(item!=undefined)programNetworks.push({id:program.id,desc:item.label});
      }
      this.programNetworksMap.set(result.id,programNetworks);
    }

    //lastUpdate map
    if(result.updated_at == undefined){

    }else{
      this.lastUpdateMap.set(result.id,"");
    }
    
    var tittle = pathVariable?.text+" - [Geometry: "+geometry?.label+"]";
    var observation = this.observationList.find((o: { content: any; }) => o.content.id === result.id);
    if(observation == undefined){
      //insert
      this.observationList[this.observationList.length]={tittle:tittle , content: content, panelOpenState: true};
      this.jsonRequest.push(content); 
    }else{
      //update
      this.observationList[this.observationList.findIndex(item=>item.content.id === result.id)]={tittle:tittle , content: content, panelOpenState: true};
      content.deployments = this.jsonRequest[this.jsonRequest.findIndex(item=>item.id === result.id)].deployments;
      this.jsonRequest[this.jsonRequest.findIndex(item=>item.id === result.id)]=content;
    }
    
    this.refreshDataSource(this.observationList).subscribe({next: data => {
      this.observationList = data;
      this.state$.next(true);
    }});
}

  updateObservation(content:any){

    let dialog = this.dialogService.open(InsertObservationDialogComponent, {
      header: 'Management Observation',
      width: '70%',
      contentStyle: {"max-height": "50%", "overflow": "auto"},
      baseZIndex: 10000,
      data: {dataSource:JSON.parse(JSON.stringify(this.jsonRequest)),node:content,action:"update",
      geomteryOptions:this.geomteryOptions,treeMethod:this.treeMethod.data,
      programOption:this.programOption}
    });

    dialog.onClose.subscribe((result) =>{
      // console.log(JSON.stringify(result));
      if(result!== null && result!=undefined){
        var programs:Program[]=[];
        if(result.programs.length>0){
          for(let program of result.programs){
            programs.push({id:program.value})
          }
        }
        var request:Observation={
          id:result.id,//mandatory
          observed_variable_id:result.observed_variable_id,//mandatory
          programs:programs,//mandatory
          geometry_id:result.geometry_id,//mandatory
          observed_since:result.observed_since,//mandatory
          observing_method_id:result.methodNode?.id,//mandatory
        };
        console.log(JSON.stringify(request));
        this.controllDataObservation(request);
      }
    });
  }

  deleteObservation(content:any){
    // console.log(JSON.stringify(content));
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete data Observation?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if(isNaN(content.id)){
        //  console.log("local data")
          this.observationList.splice(this.observationList.findIndex(item=>item.content.id === content.id),1);
          this.jsonRequest.splice(this.jsonRequest.findIndex(item=>item.id === content.id),1);
          this._generateMsg('success', 'Successful', 'Data is deleted successfully');
          this.refreshDataSource(this.observationList).subscribe({next: data => {
            this.observationList = data;
            this.state$.next(true);
          }});
        }else{
         // console.log("db data");
          this.spinnerService.show();
          this.http.delete(`${environment.app.apiUrl}/api/stations/${this.station_id}/observations/`+content.id).subscribe({
              next: resp => {
                this._generateMsg('success', 'Successful', 'Data is deleted successfully');
                this.observationList.splice(this.observationList.findIndex(item=>item.content.id === content.id),1);
                this.jsonRequest.splice(this.jsonRequest.findIndex(item=>item.id === content.id),1);
                this.refreshDataSource(this.observationList).subscribe({next: data => {
                  this.observationList = data;
                  this.state$.next(true);
                }});
                this.spinnerService.hide();
              },
              error: err => {
                this.spinnerService.hide();
                  this._errorHandler(err);
              }
          });
        }
      },
      reject: () => {
          
      }
    });

  }

  save(){
    var jsonReq =  JSON.parse(JSON.stringify(this.jsonRequest))
    this.renameNameJSON("elevation","station_elevation",jsonReq);
    this.renameNameJSON("aggregation_priod","aggregation_period",jsonReq);

    // this.changeDateFormatInJson2("from",jsonReq);
    // this.changeDateFormatInJson2("to",jsonReq);
    // this.changeDateFormatInJson2("maintenance_date",jsonReq);
    // this.changeDateFormatInJson2("activity_date",jsonReq);
    // this.changeDateFormatInJson2("created_at",jsonReq);
    // this.changeDateFormatInJson2("updated_at",jsonReq);
    // console.log(JSON.stringify(this.jsonRequest))

    // this.renameNameJSON("sampling_interval","interval",this.jsonRequest);
    // this.renameNameJSON("sampling_interval_unit_id","interval_unit_id",this.jsonRequest);
    // this.renameNameJSON("sampling_period","period",this.jsonRequest);
    // this.renameNameJSON("sampling_period_unit","period_unit",this.jsonRequest);
    this.changeValueInJson('id', null, this.jsonRequest);
    this.removeValueJSON('id', null, jsonReq);
    this.changeValueInJson('observation_id', null, jsonReq);
    this.changeValueInJson('deployment_id', null, jsonReq);
    this.changeValueInJson('instrument_id', null, jsonReq);
    this.changeValueInJson('data_generation_id', null, jsonReq);

    for(var position=0;position<jsonReq.length;position++){

      delete jsonReq[position].variable;
      delete jsonReq[position].geometryName;
    }
    
    this.dataForm = this.fb.group({});

    this.removeValueIsNull(jsonReq);
    // this.removeValueJSON('spatial_reporting_interval', null, jsonReq);
    
    console.log(JSON.stringify(jsonReq));
    this.spinnerService.show();
    this.http.post(`${environment.app.apiUrl}/api/stations/${this.station_id}/observations`, jsonReq).subscribe({
      next: resp => {
          const respons = resp as any[];
          // console.log(JSON.stringify(respons));
          this._generateMsg('success', 'Successful', 'Data is saved successfully');
          this.jsonRequest = [];
          this.observationList=[];
          this.deployMap.clear();
          for(var request of respons){
            this.controllDataObservation(request);
            for(var deployment of request.deployments){
              this.renameNameJSON("aggregation_period","aggregation_priod",deployment.data_generation);
              this.renameNameJSON("station_elevation","elevation",deployment.data_generation);
              this.renameNameJSON("interval","sampling_interval",deployment.data_generation);
              for(let generation of deployment.data_generation){
                this.renameNameJSON("interval_unit_id","sampling_interval_unit_id",generation.sampling);
              }
              // this.renameNameJSON("interval_unit_id","sampling_interval_unit_id",deployment.data_generation);
              this.renameNameJSON("period","sampling_period",deployment.data_generation);
              this.renameNameJSON("period_unit","sampling_period_unit",deployment.data_generation);
              this.controllDataDeployment(deployment,request.id);
            }
          }
          this.spinnerService.hide();
      },
      error: err => {
        this.spinnerService.hide();
          this._errorHandler(err);
      }
    });
  }

  protected getSelectedDatas(): any[] {
    throw new Error('Method not implemented.');
  }
  protected setSelectedDatas(datas: any) {
    // throw new Error('Method not implemented.');
  }
  protected generateStr(event: any) {
    // throw new Error('Method not implemented.');
  }
  protected getDatas(): any[] {
    // throw new Error('Method not implemented.');
    return this.jsonRequest;
  }
  protected setDatas(datas: any[]): void {
    // this.jsonRequest=datas;
  }
  protected createDataForm(data: any) {
    // throw new Error('Method not implemented.');
  }
  protected updateTableDisplay(datas: any[], req: any, resp: any) {
    
  }
}

interface ExampleFlatNode {
  // id:number;
  index?:number
  expandable: boolean;
  text: string;
  level: number;
}
