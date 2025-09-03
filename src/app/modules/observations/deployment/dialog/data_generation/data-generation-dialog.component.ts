import { FlatTreeControl } from '@angular/cdk/tree';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Tree } from 'primeng/tree';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { DataGeneration } from 'src/app/modules/observations/model/data_generation';
import { Processing } from 'src/app/modules/observations/model/processings';
import { Reportings } from 'src/app/modules/observations/model/reportings';
import { Samplings } from 'src/app/modules/observations/model/samplings';
import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { environment } from 'src/environments/environment';
  
@Component({
  selector: 'deployment-dialog',
  templateUrl: 'data-generation-dialog.component.html',
  styleUrls: ['./data-generation.component.scss'],
  providers: [MessageService, ConfirmationService]
})

export class DataGenerationDialogComponent extends MoreComponent implements OnInit {
  // export class DataGenerationDialogComponent implements OnInit {
  //Data Generation
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
  processingOption: SelectItem[] = [];

  selectedValue: number;
  tittle :string="";
  state$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  unsubscribe: Subscription[] = [];
  hourOptions:SelectItem[] = [];
  dayOptions:SelectItem[] = [];
  mounthOptions:SelectItem[] = [];

  idGeneration :number|string;
  idSampling:number|string;
  idProcessing:number|string;
  idReporting:number|string;

  isUsedForInternationalReporting:boolean=false;

  isBasic:boolean= true; //basic
  isBasicOptions: any[];
  constructor(
    private datepipe: DatePipe,
    private _snackBar: MatSnackBar,
    confirmationService: ConfirmationService,
    http: HttpClient,
    private fb: FormBuilder,
    // //base
    router: Router,
    messageService: MessageService,
    spinnerService: NgxSpinnerService,
    public ref: DynamicDialogRef, public config: DynamicDialogConfig) { 
      super(confirmationService, http, router, messageService, spinnerService);
      this.unsubscribe.push(this.state$.asObservable().subscribe());
    }
  
  ny:any;

  ngOnInit(): void {
    this.isBasicOptions = [
      { label: 'Basic', value: true },
      { label: 'Advance', value: false }
    ];
    // console.log(JSON.stringify(this.config.data.samplingStrategyOption));
    // this.config.data.strategy=this.samplingStrategyOption.find((o: { value: any; }) => o.value === 3);
    this.dayOptions = DAY_REFERENCE;
    this.mounthOptions = MOUNTH_REFERENCE;
    this.hourOptions.push({label:"- Hours -",value:null})
    for(var i=0;i<24;i++){
      var lb:string = <any>i;
      if(i<10)lb="0"+lb;
      this.hourOptions.push({label:""+lb,value:""+lb});
    }

    this.config.data.hourFrom={label:"00",value:0};
    this.config.data.hourTo={label:"23",value:23};
    // console.log(JSON.stringify(this.hourOptions))

    if(this.config.data.action=="update"){
      console.log(JSON.stringify(this.config.data.dataUpdate))
      this.config.data.id = this.config.data.dataUpdate.id;
      this.config.data.data_generation_id=this.config.data.dataUpdate.id;
      // this.config.data.from=this.datepipe.transform(Date.parse( this.config.data.dataUpdate.from), 'MM-dd-YYYY');
      // this.config.data.to= this.datepipe.transform(Date.parse( this.config.data.dataUpdate.to), 'MM-dd-YYYY');
      // this.config.data.from= this.config.data.dataUpdate.from;
      this.config.data.from= new Date(this.config.data.dataUpdate.from);
      if(this.config.data.dataUpdate.to!=undefined)this.config.data.to= new Date(this.config.data.dataUpdate.to);
      this.idGeneration=this.config.data.dataUpdate.id;
      

      //SAMPLING
      if(this.config.data.dataUpdate.sampling!=undefined){
        this.idSampling=this.config.data.dataUpdate.sampling.id;
        this.config.data.sampling_interval= this.config.data.dataUpdate.sampling.sampling_interval;
        this.config.data.sampling_period= this.config.data.dataUpdate.sampling.sampling_period;
        this.config.data.spatial_sampling_resolution= this.config.data.dataUpdate.sampling.spatial_sampling_resolution;
        this.config.data.sampling_procedure_description= this.config.data.dataUpdate.sampling.sampling_procedure_description;

        this.config.data.sampling_strategy = this.config.data.samplingStrategyOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.sampling.sampling_strategy_id);
        this.config.data.interval_unit = this.config.data.intervalUnitOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.sampling.sampling_interval_unit_id);
        this.config.data.priod_unit = this.config.data.intervalUnitOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.sampling.sampling_period_unit);
        this.config.data.sampling_procedure = this.config.data.samplingProcedureOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.sampling.sampling_procedure_id);
        this.config.data.sample_treatment = this.config.data.samplingTreatmentOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.sampling.sample_treatment_id);
      }

      //PROCESSING
      if(this.config.data.dataUpdate.processing!=undefined){
        this.idProcessing=this.config.data.dataUpdate.processing.id;
        this.config.data.aggregation_priod=this.config.data.dataUpdate.processing.aggregation_priod;
        this.config.data.data_processing_method=this.config.data.dataUpdate.processing.data_processing_method;
        this.config.data.software_version=this.config.data.dataUpdate.processing.software_version;
        this.config.data.software_repository_url=this.config.data.dataUpdate.processing.software_repository_url;

        this.config.data.interval_unit_aggregation = this.config.data.intervalUnitOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.processing.interval_unit_id);
        this.config.data.processing_centre = this.config.data.processingOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.processing.processing_centre);
      }

      //REPORTING
      this.idReporting=this.config.data.dataUpdate.reporting.id;
      this.isUsedForInternationalReporting=this.config.data.dataUpdate.reporting.schedule.is_used_for_international_reporting==1?true:false;
      this.config.data.reporting_interval=this.config.data.dataUpdate.reporting.schedule.reporting_interval;//menit
      this.config.data.hourFrom=this.hourOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.schedule.period_of_reporting.time.from );
      this.config.data.hourTo=this.hourOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.schedule.period_of_reporting.time.to );
      this.config.data.dayFrom=this.dayOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.schedule.period_of_reporting.day.from );
      this.config.data.dayTo=this.dayOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.schedule.period_of_reporting.day.to );
      this.config.data.monthFrom=this.mounthOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.schedule.period_of_reporting.month.from );
      this.config.data.monthTo=this.mounthOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.schedule.period_of_reporting.month.to );
      var diurnal = this.config.data.dataUpdate.reporting.schedule.diurnal_base_time != null ?this.config.data.dataUpdate.reporting.schedule.diurnal_base_time.split(":"):null;
      this.config.data.diurnal1 = diurnal?diurnal[0]:"";
      this.config.data.diurnal2 = diurnal?diurnal[1]:"";
      this.config.data.observation_count= this.config.data.dataUpdate.reporting.observation_count;
      this.config.data.spatial_reporting_interval= this.config.data.dataUpdate.reporting.spatial_reporting_interval;
      this.config.data.timeliness= this.config.data.dataUpdate.reporting.timeliness;
      this.config.data.numerical_resolution= this.config.data.dataUpdate.reporting.numerical_resolution;
      this.config.data.data_format_version= this.config.data.dataUpdate.reporting.data_format_version;
      this.config.data.reference_datum= this.config.data.dataUpdate.reporting.reference_datum;
      this.config.data.is_traceable= this.config.data.dataUpdate.reporting.is_traceable==1?"yes":"no";
      this.config.data.is_primary= this.config.data.dataUpdate.reporting.is_primary==1?"yes":"no";
      //REPORTING->ATTRIBUTION
      if(this.config.data.dataUpdate.reporting.attribution!=null){
        this.config.data.title_of_work = this.config.data.dataUpdate.reporting.attribution.title_of_work;
        this.config.data.attribution_url= this.config.data.dataUpdate.reporting.attribution.attribution_url;
        this.config.data.originator_of_work= this.config.data.dataUpdate.reporting.attribution.originator_of_work;
        this.config.data.source_work_url= this.config.data.dataUpdate.reporting.attribution.source_work_url;
      }

      //measurement
      this.config.data.measurement_unit = this.config.data.measurementOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.measurement_unit_id);
      //policy
      this.config.data.data_policy = this.config.data.dataPoliciesOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.data_policy_id);
      this.config.data.timeliness_unit = this.config.data.intervalUnitOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.timeliness_unit);
      this.config.data.level_of_data = this.config.data.levelOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.level_of_data_id);
      this.config.data.data_format = this.config.data.formatsOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.data_format_id);
      this.config.data.reference_time = this.config.data.referenceTimesOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.reference_time_id);
      this.config.data.quality_flag_system = this.config.data.qualityOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.quality_flag_system_id);
      this.config.data.timestamp_meaning = this.config.data.timestampMeaningsOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reporting.timestamp_meaning_id);
    }else{
      this.idGeneration=this.config.data.idDummyGeneration;
      this.idGeneration = <number>this.idGeneration+1;
      this.config.data.id = "_"+this.idGeneration;

      this.generateId();
    }
    // this.config.data.sampling_strategy_id="";
    this.loadDatas();
  }

  generateId(){
      if(this.config.data.dataUpdate == undefined || this.config.data.dataUpdate.sampling == undefined){
        this.idSampling=this.config.data.idDummySampling;
        this.idSampling=<number>this.idSampling+1;
        this.config.data.idSampling="_"+this.idSampling; 
      }

      if(this.config.data.dataUpdate == undefined || this.config.data.dataUpdate.processing == undefined){
        this.idProcessing=this.config.data.idDummyProcessing;
        this.idProcessing=<number>this.idProcessing+1;
        this.config.data.idProcessing="_"+this.idProcessing;
      }

      
      if(this.config.data.dataUpdate == undefined || this.config.data.dataUpdate.reporting== undefined){
        this.idReporting=this.config.data.idDummyReporting;
        this.idReporting=<number>this.idReporting+1;
        this.config.data.idReporting="_"+this.idReporting;
      }
  }

  loadDatas(){

    // this.http.get(`${environment.app.apiUrl}/api/lists/types/interval-units`).subscribe({
    //     next: datas => {
    //       const _dataOptions = <any[]>datas;
    //       for(var data of _dataOptions){
    //         var label = data.value+data.description;
    //         this.intervalUnitOption.push({ label:label ,value: data.id });
    //         if(this.config.data.action=="update"){
    //           //Sample -> interval_unit_id
    //           if(this.config.data.dataUpdate.samplings!=undefined 
    //             && this.config.data.dataUpdate.samplings.interval_unit_id == data.id){
    //               this.config.data.interval_unit={label:data.name ,value: data.id }
    //           }
    //           //Sample -> priod_unit_id
    //           if(this.config.data.dataUpdate.samplings!=undefined 
    //             && this.config.data.dataUpdate.samplings.priod_unit_id == data.id){
    //               this.config.data.priod_unit={label:data.name ,value: data.id }
    //           }
    //           //Processing -> interval_unit_id
    //           if(this.config.data.dataUpdate.processing!=undefined 
    //             && this.config.data.dataUpdate.processing.interval_unit_id == data.id){
    //               this.config.data.interval_unit_aggregation={label:data.name ,value: data.id }
    //           }
    //           //Reporting -> interval_unit_id
    //           if(this.config.data.dataUpdate.reporting!=undefined 
    //             && this.config.data.dataUpdate.reporting.timeliness_unit == data.id){
    //               this.config.data.timeliness_unit={label:data.name ,value: data.id }
    //           }
    //         }
    //       }
    //       this.spinnerService.hide();
    //       this.state$.next(true);
    //     },
    //     error: err => {
    //         this._errorHandler(err);
    //     }
    // });
    // this.http.get(`${environment.app.apiUrl}/api/lists/types/sampling-strategies`).subscribe({
    //     next: datas => {
    //       const _dataOptions = <any[]>datas;
    //       for(var data of _dataOptions){
    //         this.samplingStrategyOption.push({ label:data.name ,value: data.id });
    //         if(this.config.data.action=="update" && this.config.data.dataUpdate.samplings!=undefined ){
    //           if(this.config.data.dataUpdate.samplings.sampling_strategy_id == data.id)this.config.data.sampling_strategy={label:data.name ,value: data.id }
    //         }
    //       }
    //       this.spinnerService.hide();
    //       this.state$.next(true);
    //     },
    //     error: err => {
    //         this._errorHandler(err);
    //     }
    // });
    // this.http.get(`${environment.app.apiUrl}/api/lists/types/sample-treatments`).subscribe({
    //     next: datas => {
    //       const _dataOptions = <any[]>datas;
    //       for(var data of _dataOptions){
    //         this.samplingTreatmentOption.push({ label:data.name ,value: data.id });
    //         if(this.config.data.action=="update"){
    //           //Sample -> sampling_procedure
    //           if(this.config.data.dataUpdate.samplings!=undefined 
    //             && this.config.data.dataUpdate.samplings.sample_treatment_id == data.id){
    //               this.config.data.sample_treatment={label:data.name ,value: data.id }
    //           }
    //         }
    //       }
    //       this.spinnerService.hide();
    //       this.state$.next(true);
    //     },
    //     error: err => {
    //         this._errorHandler(err);
    //     }
    // });
    // this.http.get(`${environment.app.apiUrl}/api/lists/types/sampling-procedures`).subscribe({
    //   next: datas => {
    //     const _dataOptions = <any[]>datas;
    //       for(var data of _dataOptions){
    //       this.samplingProcedureOption.push({ label:data.value ,value: data.id });
    //       if(this.config.data.action=="update"){
    //         //Sample -> sampling_procedure
    //         if(this.config.data.dataUpdate.samplings!=undefined 
    //           && this.config.data.dataUpdate.samplings.sampling_procedure_id == data.id){
    //             this.config.data.sampling_procedure={label:data.name ,value: data.id }
    //         }
    //       }
    //     }
    //     // this.config.data.strategy=this.samplingStrategyOption.find((o: { value: any; }) => o.value === 3);
    //     this.spinnerService.hide();
    //     this.state$.next(true);
    //   },
    //   error: err => {
    //       this._errorHandler(err);
    //   }
    // });   
    // this.http.get(`${environment.app.apiUrl}/api/lists/types/data-policies`).subscribe({
    //   next: datas => {
    //     const _dataOptions = <any[]>datas;
    //       for(var data of _dataOptions){
    //       this.dataPoliciesOption.push({ label:data.name ,value: data.id });
    //        //Reporting -> data_policy_id
    //        if(this.config.data.dataUpdate.reporting!=undefined 
    //         && this.config.data.dataUpdate.reporting.data_policy_id == data.id){
    //           this.config.data.data_policy={label:data.name ,value: data.id }
    //       }
    //     }
    //     this.spinnerService.hide();
    //     this.state$.next(true);
    //   },
    //   error: err => {
    //       this._errorHandler(err);
    //   }
    // });   
    // this.http.get(`${environment.app.apiUrl}/api/lists/types/level-of-data`).subscribe({
    //   next: datas => {
    //     const _dataOptions = <any[]>datas;
    //       for(var data of _dataOptions){
    //       this.levelOption.push({ label:data.name ,value: data.id });
    //       if(this.config.data.action=="update"){
    //         //Reporting -> level_of_data_id
    //         if(this.config.data.dataUpdate.reporting!=undefined 
    //           && this.config.data.dataUpdate.reporting.level_of_data_id == data.id){
    //             this.config.data.level_of_data={label:data.name ,value: data.id }
    //         }
    //       }
    //     }
    //     this.spinnerService.hide();
    //     this.state$.next(true);
    //   },
    //   error: err => {
    //       this._errorHandler(err);
    //   }
    // });   
    // this.http.get(`${environment.app.apiUrl}/api/lists/types/data-formats`).subscribe({
    //   next: datas => {
    //     const _dataOptions = <any[]>datas;
    //       for(var data of _dataOptions){
    //       this.formatsOption.push({ label:data.name ,value: data.id });
    //       if(this.config.data.action=="update"){
    //         //Reporting -> data_format_id
    //         if(this.config.data.dataUpdate.reporting!=undefined 
    //           && this.config.data.dataUpdate.reporting.data_format_id == data.id){
    //             this.config.data.data_format={label:data.name ,value: data.id }
    //         }
    //       }
    //     }
    //     this.spinnerService.hide();
    //     this.state$.next(true);
    //   },
    //   error: err => {
    //       this._errorHandler(err);
    //   }
    // });   
    // this.http.get(`${environment.app.apiUrl}/api/lists/types/reference-times`).subscribe({
    //   next: datas => {
    //     const _dataOptions = <any[]>datas;
    //       for(var data of _dataOptions){
    //       this.referenceTimesOption.push({ label:data.name ,value: data.id });
    //       if(this.config.data.action=="update"){
    //         //Reporting -> level_of_data_id
    //         if(this.config.data.dataUpdate.reporting!=undefined 
    //           && this.config.data.dataUpdate.reporting.reference_time_id == data.id){
    //             this.config.data.reference_time={label:data.name ,value: data.id }
    //         }
    //       }
    //     }
    //     this.spinnerService.hide();
    //     this.state$.next(true);
    //   },
    //   error: err => {
    //       this._errorHandler(err);
    //   }
    // });   
    // this.http.get(`${environment.app.apiUrl}/api/lists/types/quality-flag-systems`).subscribe({
    //   next: datas => {
    //     const _dataOptions = <any[]>datas;
    //       for(var data of _dataOptions){
    //       this.qualityOption.push({ label:data.name ,value: data.id });
    //       if(this.config.data.action=="update"){
    //         //Reporting -> quality_flag_system_id
    //         if(this.config.data.dataUpdate.reporting!=undefined 
    //           && this.config.data.dataUpdate.reporting.quality_flag_system_id == data.id){
    //             this.config.data.quality_flag_system={label:data.name ,value: data.id }
    //         }
    //       }
    //     }
    //     this.spinnerService.hide();
    //     this.state$.next(true);
    //   },
    //   error: err => {
    //       this._errorHandler(err);
    //   }
    // });   
    // this.http.get(`${environment.app.apiUrl}/api/lists/organizations`).subscribe({
    //   next: datas => {
    //     const _dataOptions = <any[]>datas;
    //       for(var data of _dataOptions){
    //       this.processingOption.push({ label:data.long_name ,value: data.id });
    //       if(this.config.data.action=="update"){
    //         //Processing -> processing_centre
    //         if(this.config.data.dataUpdate.processing!=undefined 
    //           && this.config.data.dataUpdate.processing.processing_centre == data.id){
    //             this.config.data.processing_centre={label:data.name ,value: data.id }
    //         }
    //         //Reproting -> measurement_unit_id
    //         if(this.config.data.dataUpdate.reporting!=undefined 
    //           && this.config.data.dataUpdate.reporting.measurement_unit_id == data.id){
    //             this.config.data.measurement_unit={label:data.name ,value: data.id }
    //         }
    //       }
    //     }
    //     this.spinnerService.hide();
    //     this.state$.next(true);
    //   },
    //   error: err => {
    //       this._errorHandler(err);
    //   }
    // }); 
    // this.http.get(`${environment.app.apiUrl}/api/lists/types/timestamp-meanings`).subscribe({
    //   next: datas => {
    //     const _dataOptions = <any[]>datas;
    //       for(var data of _dataOptions){
    //       this.timestampMeaningsOption.push({ label:data.name ,value: data.id });
    //       if(this.config.data.action=="update"){
    //         //Reporting -> timestamp_meaning_id
    //         if(this.config.data.dataUpdate.reporting!=undefined 
    //           && this.config.data.dataUpdate.reporting.timestamp_meaning_id == data.id){
    //             this.config.data.timestamp_meaning={label:data.name ,value: data.id }
    //         }
    //       }
    //     }
    //     this.spinnerService.hide();
    //     this.state$.next(true);
    //   },
    //   error: err => {
    //       this._errorHandler(err);
    //   }
    // });   

  }

  save(){
    // console.log(this.city);
    this.generateId();
   
    var sampling:Samplings={
      id:this.config.data.idSampling,
      data_generation_id:this.idGeneration,
      sampling_strategy_id:this.config.data.sampling_strategy?.value,
      sampling_interval:this.config.data.sampling_interval,
      sampling_interval_unit_id:this.config.data.sampling_interval!=null?this.config.data.interval_unit?.value:null,
      sampling_period:this.config.data.sampling_period,
      sampling_period_unit:this.config.data.sampling_period!=null?this.config.data.priod_unit?.id:null,
      spatial_sampling_resolution:this.config.data.spatial_sampling_resolution,
      sampling_procedure_id:this.config.data.sampling_procedure?.value!=null?this.config.data.sampling_procedure?.value:null,
      sampling_procedure_description:this.config.data.sampling_procedure_description,
      sample_treatment_id:this.config.data.sample_treatment?.value!=null?this.config.data.sample_treatment?.value:null,

      sampling_strategy_desc:this.config.data.sampling_strategy?.value != null ?this.config.data.sampling_strategy?.label:null,
      interval_unit_desc:this.config.data.sampling_interval!=null?this.config.data.interval_unit?.label:null,
      priod_unit_desc:this.config.data.sampling_period!=null?this.config.data.priod_unit?.label:null,
      sampling_procedure_desc:this.config.data.sampling_procedure?.value!=null?this.config.data.sampling_procedure?.label:null,
      sample_treatment_desc:this.config.data.sample_treatment?.value!=null?this.config.data.sample_treatment?.label:null,
    }

    var processing:Processing={
      id:this.config.data.idProcessing,
      data_generation_id:this.idGeneration,
      aggregation_priod:this.config.data.aggregation_priod,
      interval_unit_id:this.config.data.aggregation_priod!=null?this.config.data.interval_unit_aggregation?.value:null,
      data_processing_method:this.config.data.data_processing_method,
      software_version:this.config.data.software_version,
      software_repository_url:this.config.data.software_repository_url,
      processing_centre:this.config.data.processing_centre?.value!=null?this.config.data.processing_centre?.value:null,

      interval_unit_desc:this.config.data.aggregation_priod!=null ? this.config.data.interval_unit_aggregation?.label:null,
      processing_centre_desc:this.config.data.processing_centre?.value !=null ? this.config.data.processing_centre?.label:null,
    }

    var reporting:Reportings={
      id:this.config.data.idReporting,
      data_generation_id:this.idGeneration,
      schedule:{
          is_used_for_international_reporting:this.isUsedForInternationalReporting==true?1:0,
          reporting_interval:this.config.data.reporting_interval,//menit
          period_of_reporting:{
              time:{
                from:this.config.data.hourFrom.value!=null?this.config.data.hourFrom.label:null,
                to:this.config.data.hourTo.label!=null?this.config.data.hourTo.label:null
              },
              day:{
                from:this.config.data.dayFrom.label!=null?this.config.data.dayFrom.label:null,
                to:this.config.data.dayTo.label!=null?this.config.data.dayTo.label:null
              },
              month:{
                from:this.config.data.monthFrom.label!=null?this.config.data.monthFrom.label:null,
                to:this.config.data.monthTo.label!=null?this.config.data.monthTo.label:null
              }
          },
          diurnal_base_time:this.config.data.diurnal1!=null?this.config.data.diurnal1+":"+this.config.data.diurnal2:null
      },
      observation_count:this.config.data.observation_count,
      measurement_unit_id:this.config.data.measurement_unit?.value,
      data_policy_id:this.config.data.data_policy?.value,
      spatial_reporting_interval:this.config.data.spatial_reporting_interval,
      timeliness:this.config.data.timeliness,
      timeliness_unit:this.config.data.timeliness!=null?this.config.data.timeliness_unit?.value:null,
      numerical_resolution:this.config.data.numerical_resolution,
      level_of_data_id:this.config.data.level_of_data?.value,
      data_format_id:this.config.data.data_format?.value,
      data_format_version:this.config.data.data_format_version,
      reference_datum:this.config.data.reference_datum,
      reference_time_id:this.config.data.reference_time?.value,
      is_traceable:this.config.data.is_traceable!=null?this.config.data.is_traceable=="yes"?1:0:null,
      quality_flag_system_id:this.config.data.quality_flag_system?.value,
      is_primary:this.config.data.is_primary!=null? this.config.data.is_primary=="yes"?1:0:null,
      timestamp_meaning_id:this.config.data.timestamp_meaning?.value,

      timeliness_desc:this.config.data.timeliness!=undefined?this.config.data.timeliness+" "+this.config.data.timeliness_unit?.label:null,
      attribution:{
          title_of_work:this.config.data.title_of_work,
          attribution_url:this.config.data.attribution_url,
          originator_of_work:this.config.data.originator_of_work,
          source_work_url:this.config.data.source_work_url
      },
      measurement_unit_desc:this.config.data.measurement_unit?.value != null ?this.config.data.measurement_unit?.label:null,
      data_policy_desc:this.config.data.data_policy?.value != null ? this.config.data.data_policy?.label:null,
      level_of_data_desc:this.config.data.level_of_data?.value !=null ? this.config.data.level_of_data?.label:null,
      data_format_desc:this.config.data.data_format?.value !=null? this.config.data.data_format?.label:null,
      reference_time_desc:this.config.data.reference_time?.value !=null ? this.config.data.reference_time?.label:null,
      quality_flag_system_desc:this.config.data.quality_flag_system?.value !=null ? this.config.data.quality_flag_system?.label:null,
      timestamp_meaning_desc:this.config.data.timestamp_meaning?.value != null ? this.config.data.timestamp_meaning?.label:null,
    }
    
    var tittle = "FROM "+this.datepipe.transform(Date.parse(this.config.data.from), 'dd-MM-yyyy');
    var toDate = this.datepipe.transform(Date.parse(this.config.data.to), 'dd-MM-yyyy');
    if(toDate!== null)tittle = tittle +" TO "+toDate;

    var dataGeneration:DataGeneration={
      id:this.config.data.id,
      deployment_id:this.config.data.deployment_id,
      from: this.config.data.from instanceof Date ? this.config.data.from : new Date(this._formatDMYtoYMD(this.config.data.from)),
      to:this.config.data.to!=null?this.config.data.from instanceof Date ? this.config.data.to : new Date(this._formatDMYtoYMD(this.config.data.to)):null,
      reporting:reporting,
      tittle:tittle
    }
    // console.log(this.config.data.to!=null?this.config.data.from instanceof Date ? this.config.data.to : new Date(this._formatDMYtoYMD(this.config.data.to)):"tetes");
    
    if(sampling.sampling_strategy_id !=null || sampling.sampling_interval !=null || sampling.sampling_period !=null || 
      sampling.spatial_sampling_resolution !=null || sampling.sampling_procedure_id !=null ||
      sampling.sampling_procedure_description !=null || sampling.sample_treatment_id !=null){
        if(sampling!=undefined && JSON.stringify(sampling)!="{}")dataGeneration.sampling=sampling;
    }

    if(processing.aggregation_priod !=null ||processing.data_processing_method !=null ||
      processing.software_version !=null || processing.software_repository_url !=null ||
      processing.processing_centre !=null){
        if(processing!=undefined && JSON.stringify(processing)!="{}")dataGeneration.processing=processing;
    }

    if(reporting!=undefined && JSON.stringify(reporting)!="{}")dataGeneration.reporting=reporting;
    // if(JSON.stringify(reporting.attribution)=="{}")delete reporting.attribution; INI buat apa?

    if(this.validate(dataGeneration)){
      var result:any={};
      result.idDummyGeneration = this.idGeneration;
      result.dataGeneration = dataGeneration;
      result.idDummySampling=this.idSampling;
      result.idDummyProcessing=this.idProcessing;
      result.idDummyReporting=this.idReporting;

      console.log(JSON.stringify(result))

      this.ref.close(result);
    }
    else{ 
      this._snackBar.open("Need mandatory input","Ok",{duration: 2500,
        verticalPosition: 'top', // 'top' | 'bottom'
        horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
        panelClass: ['white-snackbar'],
      });
    }
  }

  validate(dataGeneration:any):boolean{

    if(dataGeneration.from == null )return false;

    if(dataGeneration.reporting==undefined && JSON.stringify(dataGeneration.reporting)=="{}")return false;
    if(dataGeneration.reporting.schedule.reporting_interval==null)return false;
    if(this.config.data.diurnal1==null || this.config.data.diurnal1>23)return false;
    if(this.config.data.diurnal2==null || this.config.data.diurnal2>59)return false;
    if(dataGeneration.reporting.schedule.diurnal_base_time==null)return false;
    if(dataGeneration.reporting.schedule.period_of_reporting.time.from==null)return false;
    if(dataGeneration.reporting.schedule.period_of_reporting.time.to==null)return false;
    if(dataGeneration.reporting.schedule.period_of_reporting.day.from==null)return false;
    if(dataGeneration.reporting.schedule.period_of_reporting.day.to==null)return false;
    if(dataGeneration.reporting.schedule.period_of_reporting.month.from==null)return false;
    if(dataGeneration.reporting.schedule.period_of_reporting.month.to==null)return false;

    if(dataGeneration.reporting.measurement_unit_id==null)return false;
    if(dataGeneration.reporting.data_policy_id==null)return false;
    // if(dataGeneration.reporting.spatial_reporting_interval==null)return false;
    // if(dataGeneration.reporting.reference_datum==null)return false;

    return true;
  }

  //ARRAYNYA DIBUAT CUMAN VALUE TIDAK ADA LABEL
  time(min:number){
    this.config.data.reporting_interval=min;
  }

  days:any[]=[
    {key:1,from:{label:"Monday",value:"Monday"},to:{label:"Sunday",value:"Sunday"}},
    {key:2,from:{label:"Monday",value:"Monday"},to:{label:"Friday",value:"Friday"}},
    {key:3,from:{label:"Saturday",value:"Saturday"},to:{label:"Sunday",value:"Sunday"}},
  ];

  priod(priod:number){
    this.config.data.hourFrom={label:"00",value:"00"};
    this.config.data.hourTo={label:"23",value:"23"};
    var day = this.days.find((o: { key: any; }) => o.key === priod);
    this.config.data.dayFrom=day.from;
    this.config.data.dayTo=day.to;
    this.config.data.monthFrom={label:"January",value:"January"};
    this.config.data.monthTo={label:"December",value:"December"};
    // console.log(this.config.data.mounthFrom.label!=""?this.config.data.monthFrom.label:null)
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


  refreshDataSource(datas:any[]): Observable<any[]> {
    let randomlyFilledList = datas;
    return of(randomlyFilledList);
  }
  
}

const DAY_REFERENCE=[
  {label:"- Day -",value:null},
  {label:"Monday",value:"Monday"},
  {label:"Tuesday",value:"Tuesday"},
  {label:"Wednesday",value:"Wednesday"},
  {label:"Thursday",value:"thursday"},
  {label:"Friday",value:"Friday"},
  {label:"Saturday",value:"Saturday"},
  {label:"Sunday",value:"Sunday"}
];

const MOUNTH_REFERENCE=[
  {label:"- Mounth -",value:null},
  {label:"January",value:"January"},
  {label:"February",value:"February"},
  {label:"March",value:"March"},
  {label:"April",value:"April"},
  {label:"May",value:"May"},
  {label:"June",value:"June"},
  {label:"July",value:"July"},
  {label:"August",value:"August"},
  {label:"September",value:"September"},
  {label:"October",value:"October"},
  {label:"November",value:"November"},
  {label:"December",value:"December"},
]
