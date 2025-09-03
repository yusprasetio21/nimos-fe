import { Instrument } from './../model/instrument_characteristic';
import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { MethodDialogComponent } from '../dialogs/dialog_method/method-dialog.component';
import { Coordinates } from '../model/coordinates';
import { DataGeneration } from '../model/data_generation';
import { DataUrls } from '../model/data_urls';
import { Deployment } from '../model/deployment';
import { TreeModel } from '../model/tree';
import { AplicationAreaDialogComponent } from './dialog/aplicationArea/aplication-area-dialog.component';
import { CoordinatesDialogComponent } from './dialog/coordinates/coordinates-dialog.component';
import { UrlDialogComponent } from './dialog/dataURL/url-dialog.component';
import { DataGenerationDialogComponent } from './dialog/data_generation/data-generation-dialog.component';
import { FrequencyDialogComponent } from './dialog/frequency/frequency-dialog.component';
import { MaintenanceDialogComponent } from './dialog/maintenance/maintenance-dialog.component';
import { QualityAssuranceDialogComponent } from './dialog/qulity_assurance/quality-assurance-dialog.component';
import { StatusDialogComponent } from './dialog/status/status-dialog.component';
import { BaseComponent } from 'src/app/base.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { MoreComponent } from 'src/app/xapp/component/_more.component';
  
@Component({
  selector: 'deployment-dialog',
  templateUrl: 'deployment-dialog.component.html',
  styleUrls: ['form-deployment.component.scss'],
  providers: [MessageService,DialogService]
})

export class DeploymentDialogComponent extends MoreComponent implements OnInit {
  
  selectedValue: number;
  tittle :string="";
  state$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  unsubscribe: Subscription[] = [];

  reportingTime = new Map();


  dataURL : any[]=[];
  idDummy:number=0;
  aplicationAreas : any[]=[];

  //Instrument Characteristic
  // coordinateColumns: string[] = ['latitude', 'longitude','elevation','geopositioning','from','actions'];
  dataSourceCoordinates = new MatTableDataSource<Coordinates>();

  statusColumns: string[] = ['status', 'from','to','actions'];
  dataSourceInsStatus = new MatTableDataSource<any>();

  obsFrequencyColumns: string[] = ['useOfFrequency', 'frequency','bandwidth','transmission','polarization','actions'];
  dataSourceObsFrequency = new MatTableDataSource<any>();  
  teleFrequencyColumns: string[] = ['useOfFrequency', 'frequency','bandwidth','actions'];
  dataSourceTeleFrequency = new MatTableDataSource<any>();  

  maintenanceColumns: string[] = ['maintenance_date', 'maintenance_party','individual','description','author','document_url','actions'];
  dataSourceMaintenance = new MatTableDataSource<any>();

  qualityColumns: string[] = ['location', 'activity_date','standart_type','standart_name','standart_serial_number','activity_result','document_url','author','actions'];
  dataSourceQuality = new MatTableDataSource<any>();

  instrumentId:number|string;
  instrument_assigned_type_id:number=2;
  isBasic:boolean= true; //basic
  isBasicOptions: any[];
    form: FormGroup;
    constructor(
      public dialogService: DialogService,
      public datepipe: DatePipe,
      private fb: FormBuilder,
      //more
      confirmationService: ConfirmationService,
      http: HttpClient,
      //base
      router: Router,
      messageService: MessageService,
      spinnerService: NgxSpinnerService,
      private _snackBar: MatSnackBar,
      public ref: DynamicDialogRef, 
      public config: DynamicDialogConfig,
  ) {
    super(confirmationService, http, router, messageService, spinnerService);
      this.form = this.fb.group({
        credentials: this.fb.array([]),
      });
  }
  ngOnInit(){
    this.isBasicOptions = [
      { label: 'Basic', value: true },
      { label: 'Advance', value: false }
    ];

    this.idDummy = this.config.data.idDummy;
    this.instrument_assigned_type_id = 2;
    if(this.config.data.dataUpdate!=undefined){
      // console.log(JSON.stringify(this.config.data.dataUpdate));

      this.config.data.idDeployment = this.config.data.dataUpdate.id;
      this.config.data.id = this.config.data.dataUpdate.id;
      this.config.data.observation_id= this.config.data.dataUpdate.observation_id;
      this.config.data.from = new Date(this.config.data.dataUpdate.from);
      this.config.data.to = this.config.data.dataUpdate.to!=null?new Date(this.config.data.dataUpdate.to):null;
      this.config.data.distance_from_reference_surface = this.config.data.dataUpdate.distance_from_reference_surface;
      this.config.data.configuration= this.config.data.dataUpdate.configuration;
      this.config.data.is_near_real_time= ""+this.config.data.dataUpdate.is_near_real_time;
      this.config.data.near_real_time_url= this.config.data.dataUpdate.near_real_time_url;
      this.config.data.qaqc_schedule= this.config.data.dataUpdate.qaqc_schedule;
      this.config.data.maintenance_schedule= this.config.data.dataUpdate.maintenance_schedule;
      this.config.data.is_certified_observation= ""+this.config.data.dataUpdate.is_certified_observation;
      this.config.data.comments= this.config.data.dataUpdate.comments;
      //GENERAL INFO
      if(this.config.data.dataUpdate.application_areas!=null){
        for(var item of this.config.data.dataUpdate.application_areas){
          let area = this.config.data.aplicationAreaOption.find((o: { value: any; }) => o.value === item.application_area_id);
          this.aplicationAreas.push({
            id:item.id,
            application_area_id:item.application_area_id,
            desc:area?.label});
        }
        this.refreshDataSource(this.aplicationAreas).subscribe({next: data => {
          this.aplicationAreas = data;
          this.state$.next(true);
        }});
      }
    
      //data urls
      // console.log(JSON.stringify(this.config.data.dataUpdate.data_urls));
      if(this.config.data.dataUpdate.data_urls != null){
        for(var itemUrl of this.config.data.dataUpdate.data_urls){
          this.dataURL.push({id:itemUrl.id,url:itemUrl.url});
        } 
        this.refreshDataSource(this.dataURL).subscribe({next: data => {
          this.dataURL = data;
          this.state$.next(true);
        }});
      }  
      //observation
      if(this.config.data.dataUpdate.source_of_observation_id !=null){
        this.config.data.source_of_observation  = this.config.data.sourceObsOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.source_of_observation_id);
      }
      //reference_surface_type_id
      if(this.config.data.dataUpdate.reference_surface_type_id !=null){
        this.config.data.reference_surface_type = this.config.data.referenceSurfaceOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.reference_surface_type_id);
      }
      //exposure_id
      if(this.config.data.dataUpdate.exposure_id !=null){
        this.config.data.exposure  = this.config.data.exporsureTypeOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.exposure_id);
      }
      //measurement_leader
      if(this.config.data.dataUpdate.exposure_id !=null){
        this.config.data.measurementLeader  = this.config.data.measurementLeadOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.measurement_leader);
      }
      //representativeness_id
      if(this.config.data.dataUpdate.representativeness_id !=null){
        this.config.data.representativeness = this.config.data.reprObsTypeOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.representativeness_id);
      }
      // organization_id
      if(this.config.data.dataUpdate.organization_id !=null){
        this.config.data.organization = this.config.data.organizationOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.organization_id);
      }
      // data_centre_id
      if(this.config.data.dataUpdate.data_centre_id !=null){
        this.config.data.data_centre = this.config.data.dataCentersOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.data_centre_id);
      }
      // data_communication_method_id
      if(this.config.data.dataUpdate.data_communication_method_id !=null){
        this.config.data.data_communication_method = this.config.data.dataComunicationMethodsOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.data_communication_method_id);
      }

      //INSTRUMENT
      if(this.config.data.dataUpdate.instrument!=undefined){
        // console.log(this.config.data.dataUpdate.instrument.instrument_assigned_type_id)
        this.instrumentId = this.config.data.dataUpdate.instrument.id;
        this.instrument_assigned_type_id=this.config.data.dataUpdate.instrument.instrument_assigned_type_id == undefined?2:this.config.data.dataUpdate.instrument.instrument_assigned_type_id;
        this.config.data.instrument_assigned_type_id= this.config.data.dataUpdate.instrument.instrument_assigned_type_id;
        this.config.data.observing_method_id= this.config.data.dataUpdate.instrument.observing_method_id;
        this.config.data.serial_number= this.config.data.dataUpdate.instrument.serial_number;
        this.config.data.method_details= this.config.data.dataUpdate.instrument.method_details;
        this.config.data.method_comments= this.config.data.dataUpdate.instrument.method_comments;
        this.config.data.firmware_version= this.config.data.dataUpdate.instrument.firmware_version;
        this.config.data.instrumentComments= this.config.data.dataUpdate.instrument.comments;

        this.config.data.method_text = this.findNodeById(this.config.data.treeMethod,this.config.data.observing_method_id)?.text;

        //Instrument specifications
        if(this.config.data.dataUpdate.instrument.instrument_specifications!=null){
          this.config.data.observable_range= this.config.data.dataUpdate.instrument.instrument_specifications.observable_range;
          this.config.data.relative_uncertainty= this.config.data.dataUpdate.instrument.instrument_specifications.relative_uncertainty;
          this.config.data.absolute_uncertainty= this.config.data.dataUpdate.instrument.instrument_specifications.absolute_uncertainty;
          this.config.data.drift_per_unit_time= this.config.data.dataUpdate.instrument.instrument_specifications.drift_per_unit_time;
          this.config.data.specification_url= this.config.data.dataUpdate.instrument.instrument_specifications.specification_url;
          if(this.config.data.dataUpdate.instrument.instrument_specifications.uncertainty_evaluation_procedure !=null){
            this.config.data.uncertaintyEvaluationProcedure  = this.config.data.uncertaintyEstimateProductOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.instrument.instrument_specifications.uncertainty_evaluation_procedure);
          }
        }

        //coordinate
        for(var coordinate of this.config.data.dataUpdate.instrument.coordinates){
          let geo = this.config.data.geopositioningOption.find((o: { value: any; }) => o.value === coordinate.geopositioning_method_id);
          //buat array datasource / buat map dan isinya data source untuk keynya itu berdasarkan id dari deployment
          var date = this.datepipe.transform(Date.parse(coordinate.from), 'yyyy-MM-dd')
          if(date!=null)coordinate.from =date ;
          
          coordinate.geopositioning_name=geo?.label;
          this.dataSourceCoordinates.data.push(coordinate);
        }

        this.refreshDataSource(this.dataSourceCoordinates.data).subscribe({next: data => {
          this.dataSourceCoordinates.data = data;
          this.state$.next(true);
        }});

        //instrument operating status
        if(this.config.data.dataUpdate.instrument.operating_statuses!=undefined){
          for(var insStatus of this.config.data.dataUpdate.instrument.operating_statuses){
            let status = this.config.data.statusOption.find((o: { value: any; }) => o.value === insStatus.instrument_operating_status_id);
            insStatus.operating_status_desc=status?.label;
            insStatus.from=this.datepipe.transform(Date.parse(insStatus.from), 'yyyy-MM-dd');
            insStatus.to=this.datepipe.transform(Date.parse(insStatus.to), 'yyyy-MM-dd');
            this.dataSourceInsStatus.data.push(insStatus);
          }

          this.refreshDataSource(this.dataSourceInsStatus.data).subscribe({next: data => {
            this.dataSourceInsStatus.data = data;
            this.state$.next(true);
          }});
        }
        // observation_polarization_frequencies
        if(this.config.data.dataUpdate.instrument.observation_frequency_and_polarization!=undefined){
          for(var insStatus of this.config.data.dataUpdate.instrument.observation_frequency_and_polarization){
            let frecType = this.config.data.frequencyTypes.find((o: { id: any; }) => o.id === insStatus.use_of_frequency);
            var frequncy = this.config.data.frequencyUnitTypeOption.find((o: { value: any; }) => o.value === insStatus.frequency_unit_id);
            var bandwidth = this.config.data.frequencyUnitTypeOption.find((o: { value: any; }) => o.value === insStatus.bandwidth_unit_id);

            insStatus.frequency_type_desc=frecType?.name;
            insStatus.bandwidth_unit_desc=bandwidth?.label;
            insStatus.frequency_unit_desc=frequncy?.label;

            if(insStatus.polarization_id!=null){
              let polarization = this.config.data.polarizationOption.find((o: { value: any; }) => o.value === insStatus.polarization_id);
              insStatus.polarization_desc=polarization.label;
            }
            if(insStatus.transmission_mode_id!=null){
              let transmission = this.config.data.transmissionOption.find((o: { value: any; }) => o.value === insStatus.transmission_mode_id);
              insStatus.transmission_desc=transmission.label;
            }
            this.dataSourceObsFrequency.data.push(insStatus);
          }
          this.refreshDataSource(this.dataSourceObsFrequency.data).subscribe({next: data => {
            this.dataSourceObsFrequency.data = data;
            this.state$.next(true);
          }});
        }

        // telecommunication_frequencies
        if(this.config.data.dataUpdate.instrument.telecommunication_frequencies!=undefined){
          for(var ferq of this.config.data.dataUpdate.instrument.telecommunication_frequencies){
            let frecType = this.config.data.frequencyTypes.find((o: { id: any; }) => o.id === ferq.use_of_frequency);
            var frequncy = this.config.data.frequencyUnitTypeOption.find((o: { value: any; }) => o.value === ferq.frequency_unit_id);
            var bandwidth = this.config.data.frequencyUnitTypeOption.find((o: { value: any; }) => o.value === ferq.bandwidth_unit_id);

            ferq.frequency_type_desc=frecType?.name;
            ferq.bandwidth_unit_desc=bandwidth?.label;
            ferq.frequency_unit_desc=frequncy?.label;

            this.dataSourceTeleFrequency.data.push(ferq);
          }
          this.refreshDataSource(this.dataSourceTeleFrequency.data).subscribe({next: data => {
            this.dataSourceTeleFrequency.data = data;
            this.state$.next(true);
          }});
        }

        // maintenance_logbooks
        if(this.config.data.dataUpdate.instrument.maintenance_logbooks!=undefined){
          for(var maintc of this.config.data.dataUpdate.instrument.maintenance_logbooks){
            let maintenance = this.config.data.maintenancePartyOption.find((o: { value: any; }) => o.value === maintc.maintenance_party);
            maintc.maintenance_date=this.datepipe.transform(Date.parse(maintc.maintenance_date), 'yyyy-MM-dd');
            maintc.maintenance_party_desc=maintenance?.label;
            this.dataSourceMaintenance.data.push(maintc);
          }

          this.refreshDataSource(this.dataSourceMaintenance.data).subscribe({next: data => {
            this.dataSourceMaintenance.data = data;
            this.state$.next(true);
          }});
        }

        // quality_assurance_logbooks
        if(this.config.data.dataUpdate.instrument.quality_assurance_logbooks!=undefined){
          for(var quality of this.config.data.dataUpdate.instrument.quality_assurance_logbooks){
            let location = this.config.data.locationTypesOption.find((o: { value: any; }) => o.value === quality.location_id);
            let standart = this.config.data.standartTypeOption.find((o: { value: any; }) => o.value === quality.standard_type_id);
            let activity = this.config.data.activityResultOption.find((o: { value: any; }) => o.value === quality.activity_result_id);

            quality.location_desc=location?.label;
            quality.activity_date=this.datepipe.transform(Date.parse(quality.activity_date), 'yyyy-MM-dd');
            quality.standart_desc=standart?.label;
            quality.activity_desc=activity?.label;

            this.dataSourceQuality.data.push(quality);

          }

          this.refreshDataSource(this.dataSourceQuality.data).subscribe({next: data => {
            this.dataSourceQuality.data = data;
            this.state$.next(true);
          }});
        }

        if(this.config.data.dataUpdate.instrument.manufacturer_id !=null){
          this.config.data.manufacturer  = this.config.data.manufacturerOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.instrument.manufacturer_id);
        }
        if(this.config.data.dataUpdate.instrument.instrument_model_id !=null){
          this.config.data.instrument_model  = this.config.data.modelOptions.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.instrument.instrument_model_id);
        }
      }

      //Data Generation
      if(this.config.data.dataUpdate.data_generation!=undefined){
        // console.log(JSON.stringify(JSON.stringify(this.config.data.dataUpdate.data_generation)));
        this.dataGenerations = JSON.parse(JSON.stringify(this.config.data.dataUpdate.data_generation));
        for(var data of this.dataGenerations){
          var time = data.reporting.schedule.reporting_interval;
          this.reportingTime.set(data.id,this.splitTime(time));
        }
        this.refreshDataSource(this.dataGenerations).subscribe({next: data => {
          
          this.dataGenerations = data;
          this.state$.next(true);
        }});
      }
      
    }else{
      //INSERT
      this.instrument_assigned_type_id = 2;
      this.config.data.id = "_"+this.idDummy++;
      this.instrumentId = "_"+this.idDummy++;
      this.config.data.observation_id = this.config.data.observation_id
      // this.config.data.instrument.instrument_assigned_type_id = 1;
    }
  
  }

  // -------------------------- General Info ------------------------------------

  aplicationAreaDialog(){
    var ref = this.dialogService.open(AplicationAreaDialogComponent, {
      header: 'Management Area',
      width: '30%',
      data:{aplicationAreaOption:this.config.data.aplicationAreaOption,
        idDummy:this.idDummy,idDeployment:this.config.data.idDeployment,dataAreas:this.aplicationAreas},
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });

    ref.onClose.subscribe((respons) =>{
      if(respons!=undefined){
        this.idDummy = respons.idDummy;
        this.aplicationAreas.push(respons.result);
        this.state$.next(true);
      }
    });
  }

  deleteArea(id:any){
    this.aplicationAreas.splice(this.aplicationAreas.findIndex(data=>data.id === id),1);
    this.state$.next(true);
  }
  
  urlDialog(){
    var ref = this.dialogService.open(UrlDialogComponent, {
      header: 'Management URL',
      width: '30%',
      data:{},
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });

    ref.onClose.subscribe((respons) =>{
      // console.log(respons)
      if(respons!=undefined){
        var content:DataUrls={id:"_"+this.idDummy++,deployment_id:this.config.data.idDeployment,url:respons};
        this.dataURL.push(content);
        this.state$.next(true);
      }
    });

  }

  deleteUrl(id:any){
    this.dataURL.splice(this.dataURL.findIndex(data=>data.id === id),1);
    this.state$.next(true);
  }

  // -------------------------- Instrument ------------------------------------

  createDataIntrument(){
    var coordinates:any[] = JSON.parse(JSON.stringify(this.dataSourceCoordinates.data));
      coordinates.forEach(object => {
        delete object['geopositioning_name'];
      });

    //insturment status
    var status:any[] = JSON.parse(JSON.stringify(this.dataSourceInsStatus.data));
    if(this.dataSourceInsStatus.data.length>0){
      status.forEach(object => {
        delete object['operating_status_desc'];
      });
    }

    //observation frequency
    var obsFrequncy:any[] = JSON.parse(JSON.stringify(this.dataSourceObsFrequency.data));
    if(this.dataSourceObsFrequency.data.length>0){
      obsFrequncy.forEach(object => {
        delete object['frequency_type_desc'];
        delete object['bandwidth_unit_desc'];
        delete object['frequency_unit_desc'];
        delete object['polarization_desc'];
        delete object['transmission_desc'];
      });
    }

    //telecomunication frequency
    var teleFrequency:any[] = JSON.parse(JSON.stringify(this.dataSourceTeleFrequency.data));
    if(this.dataSourceTeleFrequency.data.length>0){
      teleFrequency.forEach(object => {
        delete object['frequency_type_desc'];
        delete object['bandwidth_unit_desc'];
        delete object['frequency_unit_desc'];
      });
    }

    // maintenance_logbooks
    var maintenance:any[] = JSON.parse(JSON.stringify(this.dataSourceMaintenance.data));
    if(this.dataSourceMaintenance.data.length>0){
      maintenance.forEach(object => {
        delete object['maintenance_party_desc'];
      });
    }

    // quality_assurance_logbooks
    var quality:any[] = JSON.parse(JSON.stringify(this.dataSourceQuality.data));
    if(this.dataSourceQuality.data.length>0){
      quality.forEach(object => {
        delete object['location'];
        delete object['standard_type'];
        delete object['activityResult'];

        delete object['location_desc'];
        delete object['standart_desc'];
        delete object['activity_desc'];
      });
    }

    // data.manufacturerOptions
    // let manufacturer = this.config.data.manufacturerOptions.find((o: { value: any; }) => o.value === this.config.data.manufacturer_id);
    // let model = this.config.data.modelOptions.find((o: { value: any; }) => o.value ===this.config.data.instrument_model_id);
    // let pathVariable = this.findNodeById(this.config.data.treeMethod,this.config.data.observing_method_id);
    let instrument:Instrument={
      // id:this.config.data.dataUpdate.instrument == undefined?"_"+this.idDummy++:this.config.data.dataUpdate.instrument.id,
      id:this.instrumentId,
      deployment_id:this.config.data.id,
      instrument_assigned_type_id:this.instrument_assigned_type_id,
      manufacturer_id:this.config.data.manufacturer?.value,
      instrument_model_id:this.config.data.instrument_model?.value,
      serial_number:this.config.data.serial_number,
      observing_method_id:this.config.data.observing_method_id,
      method_details:this.config.data.method_details,
      method_comments:this.config.data.method_comments,
      firmware_version:this.config.data.firmware_version,
      instrument_specifications:{
        observable_range:<string>this.config.data.observable_range,
        relative_uncertainty:<string>this.config.data.relative_uncertainty,
        absolute_uncertainty:<string>this.config.data.absolute_uncertainty,
        drift_per_unit_time:<string>this.config.data.drift_per_unit_time,
        specification_url:<string>this.config.data.specification_url,
        uncertainty_evaluation_procedure:this.config.data.uncertaintyEvaluationProcedure?.value,
      },
      comments:this.config.data.instrumentComments,
      //tambahan
      coordinates:coordinates,
      operating_statuses:status,
      observation_frequency_and_polarization:obsFrequncy,
      telecommunication_frequencies:teleFrequency,
      maintenance_logbooks:maintenance,
      quality_assurance_logbooks:quality,

      // manufacturer_desc:manufacturer?.label,
      // instrument_model_desc:model?.label,
      // observing_method_desc:pathVariable?.text
    };
    if(JSON.stringify(instrument.instrument_specifications) == "{}")delete instrument.instrument_specifications;

    if(this.validateInstrument(instrument))this.config.data.instrument=instrument;
    else{
      this._snackBar.open("Need Input Mandatory","Ok",{duration: 2500,
        verticalPosition: 'top', // 'top' | 'bottom'
        horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
        panelClass: ['white-snackbar'],
      });
    }
    // console.log(JSON.stringify(instrument));
  }

  validateInstrument(instrument:any):boolean{
    if(instrument.observing_method_id == undefined || instrument.observing_method_id == null)return false;
    // if(instrument.coordinates == null) return false;

    return true;
  }

  methodDialog(){
    var ref = this.dialogService.open(MethodDialogComponent, {
      header: 'Choose a Method',
      width: '70%',
      data: {treeMethod:this.config.data.treeMethod},
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });

    ref.onClose.subscribe((respons) =>{
      if(respons!=undefined){
        this.config.data.method_text = respons.text;
        this.config.data.observing_method_id = respons.id;
      }else{
        this.config.data.observing_method_id = null;
      }
    });
    
  }

  deleteMethod(){
    this.config.data.method_text = "";
    this.config.data.obs_method = "";
  }

  coordinatesDialog(status:any,dataUpdate?:any){
    var ref = this.dialogService.open(CoordinatesDialogComponent, {
      header: 'Management Coordinate',
      width: '70%',
      data: {status:status,dataUpdate:dataUpdate,geopositioningOption:this.config.data.geopositioningOption,idDummy:this.idDummy,instrumentId:this.instrumentId},
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });
    
    
    ref.onClose.subscribe((respons) =>{
       if(respons!=undefined){
        this.idDummy = respons.idDummy;
        // console.log(JSON.stringify(result));
        var result:any = respons.respons;
        var index = this.dataSourceCoordinates.data.find((o: { id: any; }) => o.id === result.id);
        if(index !=undefined && index!=null){
          this.dataSourceCoordinates.data[this.dataSourceCoordinates.data.findIndex(data=>data.id === result.id)]=result;
        }else{
          this.dataSourceCoordinates.data.push(result);
        }
        this.refreshDataSource(this.dataSourceCoordinates.data).subscribe({next: data => {
          this.dataSourceCoordinates.data = data;
          this.state$.next(true);
        }});
      }
    });
  }

  deleteCoordinates(key:any){
    this.dataSourceCoordinates.data.splice(this.dataSourceCoordinates.data.findIndex(data=>data.id === key),1);
    this.refreshDataSource(this.dataSourceCoordinates.data).subscribe({next: data => {
      this.dataSourceCoordinates.data = data;
      this.state$.next(true);
    }});
  }

  statusDialog(status:any,dataUpdate?:any){
    var ref = this.dialogService.open(StatusDialogComponent, {
      header: 'Management Status',
      width: '70%',
      data: {status:status,dataUpdate:dataUpdate,statusOption:this.config.data.statusOption,idDummy:this.idDummy,instrumentId:this.instrumentId},
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });
    
    
    ref.onClose.subscribe((result) =>{
      // console.log(JSON.stringify(result));
      if(result!=undefined){
        this.idDummy = result.idDummy;
        var content :any =result.respons;
        var index = this.dataSourceInsStatus.data.find((o: { id: any; }) => o.id === content.id);
        if(index !=undefined && index!=null){
          this.dataSourceInsStatus.data[this.dataSourceInsStatus.data.findIndex(data=>data.id === content.id)]=content;
        }else{
          this.dataSourceInsStatus.data.push(content);
        }
        this.refreshDataSource(this.dataSourceInsStatus.data).subscribe({next: data => {
          this.dataSourceInsStatus.data = data;
          this.state$.next(true);
        }});
      }
    });
  }

  deleteStatus(key:any){
    this.dataSourceInsStatus.data.splice(this.dataSourceInsStatus.data.findIndex(data=>data.id === key),1);
    this.refreshDataSource(this.dataSourceInsStatus.data).subscribe({next: data => {
      this.dataSourceInsStatus.data = data;
      this.state$.next(true);
    }});
  }

  frequencyDialog(observation:boolean,action:string,dataUpdate?:any){
    var ref = this.dialogService.open(FrequencyDialogComponent, {
      header: 'Management Frequency',
      width: '70%',
      data: {observation:observation,idDummy:this.idDummy,
        action:action,dataUpdate:dataUpdate,
        polarizationOption:this.config.data.polarizationOption,
        transmissionOption:this.config.data.transmissionOption,
        frequencyUnitTypeOption:this.config.data.frequencyUnitTypeOption,
        frequencyTypes:this.config.data.frequencyTypes,
        instrumentId:this.instrumentId
      },
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });
    
    
    ref.onClose.subscribe((respons) =>{
      if(respons!=undefined){

        this.idDummy = respons.idDummy;
        // console.log(JSON.stringify(result));
        var result:any = respons.respons;
       if(observation){
        //Observation frequency and polarization

        if(result.polarization_id!=null){
          let polarization = this.config.data.polarizationOption.find((o: { value: any; }) => o.value === result.polarization_id);
          result.polarization_desc=polarization.label;
          // data.polarization_id=result.polarization;
        }
        if(result.transmission_mode_id!=null){
          let transmission = this.config.data.transmissionOption.find((o: { value: any; }) => o.value === result.transmission_mode_id);
          result.transmission_desc=transmission.label;
          // data.transmission_id=result.transmission;
        }

        var index = this.dataSourceObsFrequency.data.find((o: { id: any; }) => o.id === result.id);
        if(index !=undefined && index!=null){
          this.dataSourceObsFrequency.data[this.dataSourceObsFrequency.data.findIndex(data=>data.id === result.id)]=result;
        }else{
          this.dataSourceObsFrequency.data.push(result);
        }
        // console.log(JSON.stringify(this.dataSourceObsFrequency.data));
        this.refreshDataSource(this.dataSourceObsFrequency.data).subscribe({next: data => {
          this.dataSourceObsFrequency.data = data;
          this.state$.next(true);
        }});

       } else{
        //Telecommunication frequency
        var index = this.dataSourceTeleFrequency.data.find((o: { id: any; }) => o.id === result.id);
        if(index !=undefined && index!=null){
          this.dataSourceTeleFrequency.data[this.dataSourceTeleFrequency.data.findIndex(data=>data.id === result.id)]=result;
        }else{
          this.dataSourceTeleFrequency.data.push(result);
        }
        this.refreshDataSource(this.dataSourceTeleFrequency.data).subscribe({next: data => {
          this.dataSourceTeleFrequency.data = data;
          this.state$.next(true);
        }});
       }
      }
    });
  }

  deleteFrequency(key:any,obs:boolean){
    if(obs){
      this.dataSourceObsFrequency.data.splice(this.dataSourceObsFrequency.data.findIndex(data=>data.id === key),1);
      this.refreshDataSource(this.dataSourceObsFrequency.data).subscribe({next: data => {
        this.dataSourceObsFrequency.data = data;
        this.state$.next(true);
      }});
    }else{
      this.dataSourceTeleFrequency.data.splice(this.dataSourceTeleFrequency.data.findIndex(data=>data.id === key),1);
      this.refreshDataSource(this.dataSourceTeleFrequency.data).subscribe({next: data => {
        this.dataSourceTeleFrequency.data = data;
        this.state$.next(true);
      }});
    }
  }

  maintenanceDialog(action:string,dataUpdate?:any){
    var ref = this.dialogService.open(MaintenanceDialogComponent, {
      header: 'Management Maintenance',
      width: '70%',
      data: {action:action,dataUpdate:dataUpdate,maintenancePartyOption:this.config.data.maintenancePartyOption},
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });
    
    
    ref.onClose.subscribe((result) =>{
      // console.log(JSON.stringify(result));
      if(result!=undefined){
        let maintenance = this.config.data.maintenancePartyOption.find((o: { value: any; }) => o.value === result.maintenance_party);
        var id = result.id == null || result.id == undefined?"_"+this.idDummy++:result.id;
        result.id=id;
        result.instrument_id=this.instrumentId;
        result.maintenance_date= result.maintenance_date!=null ? result.maintenance_date instanceof Date ? result.maintenance_date : new Date(this._formatDMYtoYMD(result.maintenance_date)):null;
        // this.datepipe.transform(Date.parse(result.maintenance_date), 'yyyy-MM-dd');
        result.maintenance_party_desc=maintenance?.label;
        var index = this.dataSourceMaintenance.data.find((o: { id: any; }) => o.id === id);
        if(index !=undefined && index!=null){
          this.dataSourceMaintenance.data[this.dataSourceMaintenance.data.findIndex(data=>data.id === id)]=result;
        }else{
          this.dataSourceMaintenance.data.push(result);
        }
        this.refreshDataSource(this.dataSourceMaintenance.data).subscribe({next: data => {
          this.dataSourceMaintenance.data = data;
          this.state$.next(true);
        }});
      }
    });
  }

  deleteMaintenance(key:any){
    this.dataSourceMaintenance.data.splice(this.dataSourceMaintenance.data.findIndex(data=>data.id === key),1);
    this.refreshDataSource(this.dataSourceMaintenance.data).subscribe({next: data => {
      this.dataSourceMaintenance.data = data;
      this.state$.next(true);
    }});
  }

  qualityAssuranceDialog(action:string,dataUpdate?:any){

    var ref = this.dialogService.open(QualityAssuranceDialogComponent, {
      header: 'Management Quality Assurance',
      width: '70%',
      data: {action:action,dataUpdate:dataUpdate,locationTypesOption:this.config.data.locationTypesOption,
        standartTypeOption:this.config.data.standartTypeOption,activityResultOption:this.config.data.activityResultOption},
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });
    
    
    ref.onClose.subscribe((result) =>{
      console.log(JSON.stringify(result));
      if(result!=undefined){
        let location = this.config.data.locationTypesOption.find((o: { value: any; }) => o.value === result.location_id);
        let standart = this.config.data.standartTypeOption.find((o: { value: any; }) => o.value === result.standard_type_id);

        
        let activity = this.config.data.activityResultOption.find((o: { value: any; }) => o.value === result.activity_result_id);
        var id = result.id == null || result.id == undefined?"_"+this.idDummy++:result.id;
       
        result.id=id;
        result.instrument_id=this.instrumentId;
        result.location_desc=location?.label;
        result.activity_date= result.activity_date instanceof Date ? result.activity_date: new Date(this._formatDMYtoYMD(result.activity_date)),
        // this.datepipe.transform(Date.parse(result.activity_date), 'yyyy-MM-dd');
        result.standart_desc=standart?.label;
        result.activity_desc=activity.value != null?activity.label:null;
        var index = this.dataSourceQuality.data.find((o: { id: any; }) => o.id === id);
        if(index !=undefined && index!=null){
          this.dataSourceQuality.data[this.dataSourceQuality.data.findIndex(data=>data.id === id)]=result;
        }else{
          this.dataSourceQuality.data.push(result);
        }
        this.refreshDataSource(this.dataSourceQuality.data).subscribe({next: data => {
          this.dataSourceQuality.data = data;
          this.state$.next(true);
        }});
      }
    });
  }

  deleteQuality(key:any){
    this.dataSourceQuality.data.splice(this.dataSourceQuality.data.findIndex(data=>data.id === key),1);
    this.refreshDataSource(this.dataSourceQuality.data).subscribe({next: data => {
      this.dataSourceQuality.data = data;
      this.state$.next(true);
    }});
  }

  // ------------------------------ Data Generation ------------------------------

  dataGenerations:DataGeneration[]= [];
  idDummySampling:number=0;
  idDummyProcessing:number=0;
  idDummyReporting:number=0;
  generationDialog(action:string,dataUpdate?:any){
  
    var ref = this.dialogService.open(DataGenerationDialogComponent, {
      header: 'Management Data Generation',
      width: '70%',
      data: {action:action,
        dataUpdate:dataUpdate,
        idDummyGeneration :this.config.data.idDummyGeneration,
        idDummySampling:this.idDummySampling,
        idDummyProcessing:this.idDummyProcessing,
        idDummyReporting:this.idDummyReporting,
        //reference
        intervalUnitOption:this.config.data.intervalUnitOption,
        samplingStrategyOption:this.config.data.samplingStrategyOption,
        samplingTreatmentOption:this.config.data.samplingTreatmentOption,
        samplingProcedureOption:this.config.data.samplingProcedureOption,
        dataPoliciesOption:this.config.data.dataPoliciesOption,
        levelOption:this.config.data.levelOption,
        formatsOption:this.config.data.formatsOption,
        referenceTimesOption:this.config.data.referenceTimesOption,
        qualityOption:this.config.data.qualityOption,
        processingOption:this.config.data.processingOption,
        timestampMeaningsOption:this.config.data.timestampMeaningsOption,
        measurementOptions:this.config.data.measurementOptions
      },
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });
    
    
    ref.onClose.subscribe((result) =>{
      // console.log(JSON.stringify(result));
      if(result!=undefined){
        var resultGeneration:any =result.dataGeneration;
        var time = resultGeneration.reporting.schedule.reporting_interval;
        this.reportingTime.set(resultGeneration.id,this.splitTime(time));
        

        if(action=="update"){
          if(resultGeneration.id!=undefined && resultGeneration.id !=null){
            this.dataGenerations[this.dataGenerations.findIndex(data=>data.id === resultGeneration.id)]=resultGeneration;
          }
        }else{
          this.dataGenerations.push(resultGeneration);
          console.log(JSON.stringify(resultGeneration));
          this.config.data.idDummyGeneration=result.idDummyGeneration;
          this.idDummySampling=result.idDummyProcessing;
          this.idDummyProcessing=result.idDummyProcessing;
          this.idDummyReporting=result.idDummyReporting;
        }
        this.config.data.data_generation=this.dataGenerations;
        // console.log(JSON.stringify(this.config.data.data_generation));
      }
    });  
  }

  deleteDataGeneration(id:number|string){

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete data Deployment?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.dataGenerations.splice(this.dataGenerations.findIndex(data=>data.id === id));
        this.config.data.data_generation=this.dataGenerations;
    
        this.refreshDataSource(this.dataGenerations).subscribe({next: data => {
          this.dataGenerations = data;
          this.state$.next(true);
        }});
      },
      reject: () => {
          
      }
    });
  }
  // -------------------------- OTHER ------------------------------------
  onSave(): void {
    // console.log(JSON.stringify(this.config.data));
    this.createDataIntrument();
    

    // console.log(JSON.stringify(this.config.data.instrument));
    if(this.validateGeneralInfo() && this.validateInstrument(this.config.data.instrument))
    {

      this.config.data.source_of_observation_id = this.config.data.source_of_observation!=null?this.config.data.source_of_observation.value:null;
      this.config.data.reference_surface_type_id = this.config.data.reference_surface_type!=null?this.config.data.reference_surface_type.value:null;
      this.config.data.exposure_id = this.config.data.exposure!=null?this.config.data.exposure.value:null;
      this.config.data.representativeness_id = this.config.data.representativeness !=null?this.config.data.representativeness.value:null;
      this.config.data.measurement_leader = this.config.data.measurementLeader!=null?this.config.data.measurementLeader.value:null;
      this.config.data.organization_id = this.config.data.organization!=null?this.config.data.organization.value:null;
      this.config.data.data_centre_id =this.config.data.data_centre!=null?this.config.data.data_centre.value:null;
      this.config.data.data_communication_method_id = this.config.data.data_communication_method!=null?this.config.data.data_communication_method.value:null;

      if(this.config.data.to!=null){

      }
       //GENERAL INFO
       if(this.aplicationAreas.length>0){
        var areaDummy:any[] = JSON.parse(JSON.stringify(this.aplicationAreas));
        areaDummy.forEach(object => {
          delete object['desc'];
        });
        this.config.data.deployment_aplication_area = areaDummy;
      }

      // if(this.dataURL.length>0)this.config.data.data_urls = this.dataURL;
      
      // if(this.instrument_assigned_type_id == 2){
      //   this.createDataIntrument(); // jika New Instrumetn station
      // }
      // this.createDataIntrument(); // jika New Instrumetn station

      

      if(this.config.data.itemDeployment!=undefined){
        delete this.config.data.itemDeployment;
      }

      this.config.data.idDummy= this.idDummy;
      // console.log(JSON.stringify(this.data));
      // console.log(JSON.stringify(this.dataGenerations));
      this.config.data.data_generation=this.dataGenerations;
      
      var deployment:Deployment={
        id:this.config.data.id,
        from: this.config.data.from instanceof Date ? this.config.data.from : new Date(this._formatDMYtoYMD(this.config.data.from)),
        to: this.config.data.to!=null? this.config.data.to instanceof Date ? this.config.data.to : new Date(this._formatDMYtoYMD(this.config.data.to)):null,
        
        observation_id:this.config.data.observation_id,
        source_of_observation_id:this.config.data.source_of_observation?.value!=null?this.config.data.source_of_observation?.value:null,//mandatory
        distance_from_reference_surface:this.config.data.distance_from_reference_surface, //mandatory
        reference_surface_type_id:this.config.data.reference_surface_type?.value != null?this.config.data.reference_surface_type?.value:null,
        application_areas:JSON.parse(JSON.stringify(this.aplicationAreas)),
        exposure_id:this.config.data.exposure?.value!=null?this.config.data.exposure?.value:null, //mandatory
        configuration:this.config.data.configuration,
        representativeness_id:this.config.data.representativeness?.value!=null?this.config.data.representativeness?.value:null,
        measurement_leader:this.config.data.measurementLeader?.value!=null?this.config.data.measurementLeader?.value:null,
        organization_id:this.config.data.organization?.value!=null?this.config.data.organization?.value:null,
        is_near_real_time:this.config.data.is_near_real_time,
        near_real_time_url:this.config.data.near_real_time_url,
        data_urls:JSON.parse(JSON.stringify(this.dataURL)),
        data_centre_id:this.config.data.data_centre?.value!=null?this.config.data.data_centre?.value:null,
        data_communication_method_id:this.config.data.data_communication_method?.value!=null?this.config.data.data_communication_method?.value:null,
        qaqc_schedule:this.config.data.qaqc_schedule,
        maintenance_schedule:this.config.data.maintenance_schedule,
        is_certified_observation:this.config.data.is_certified_observation,
        comments:this.config.data.comments,
        photos:[],
        
        instrument:this.config.data.instrument,
        data_generation:this.config.data.data_generation
      }
      // console.log(JSON.stringify(deployment));
      this.ref.close(deployment);
    }
    else{ 
      if(this.config.data.to!=undefined&&this.config.data.to!=null){
        var dateFrom = Date.parse(this.config.data.from);
        var dateTo = Date.parse(this.config.data.to);
        if(dateFrom > dateTo){
          this._snackBar.open("Date To Must Be Greater Than Date From","Ok",{duration: 2500,
            verticalPosition: 'top', // 'top' | 'bottom'
            horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
            panelClass: ['white-snackbar'],
          });
        }
      }else{
        this._snackBar.open("Need Input Mandatory","Ok",{duration: 2500,
          verticalPosition: 'top', // 'top' | 'bottom'
          horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
          panelClass: ['white-snackbar'],
        });
      }
    };
  }

  validateGeneralInfo(): boolean {

    if(this.config.data.reference_surface_type.value == null)return false;
    if(this.config.data.source_of_observation.value == null) return false;
    if(this.config.data.distance_from_reference_surface == null) return false;
    if(this.config.data.exposure.value==null)return false;
    if(this.config.data.from==null)return false;

    if(this.dataGenerations == null || this.dataGenerations.length == 0) return false;

    if(this.config.data.to!=undefined&&this.config.data.to!=null){
      var dateFrom = Date.parse(this.config.data.from);
      var dateTo = Date.parse(this.config.data.to);

      if(dateFrom > dateTo) return false;
    }

    return true;
  }

  onClose(): void {
    // this.dialogRef.close();
    console.log(JSON.stringify(this.config.data.sourceObsOptions));
  }

  // -------------------------- Helper ------------------------------------
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

  refreshDataSource(datas:any[]): Observable<any[]> {
    let randomlyFilledList = datas;
    return of(randomlyFilledList);
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