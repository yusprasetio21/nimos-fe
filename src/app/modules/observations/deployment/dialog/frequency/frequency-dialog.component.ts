import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Tree } from 'primeng/tree';
import { ObservationPolarizationFrequencies } from 'src/app/modules/observations/model/observation_polarization_frequencies';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
  
@Component({
  selector: 'app-example-dialog',
  templateUrl: 'frequency-dialog.component.html',
  styleUrls: ['../../../observation.component.scss'],
})

export class FrequencyDialogComponent  extends MoreComponent implements OnInit {
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

  constructor(
    private _snackBar: MatSnackBar,
    public datepipe: DatePipe,
    public ref: DynamicDialogRef,
    
    //more
    confirmationService: ConfirmationService,
    http: HttpClient,
    //base
    router: Router,
    messageService: MessageService,
    spinnerService: NgxSpinnerService,
    public config: DynamicDialogConfig,
    ) { 
      super(confirmationService, http, router, messageService, spinnerService);
    }
  
  
  id:number|string=0;
  idDummy:number=0;
  tittle:string;
  ngOnInit(): void {
    if(this.config.data.action =="update"){
      if(this.config.data.observation)this.tittle="Correct observation frequency";
      else this.tittle="Correct telecommunication frequency";

      this.id = this.config.data.dataUpdate.id;
      this.config.data.id = this.config.data.dataUpdate.id;
      this.config.data.use_of_frequency=this.config.data.dataUpdate.use_of_frequency;
      this.config.data.frequency = this.config.data.dataUpdate.frequency;
      this.config.data.bandwidth = this.config.data.dataUpdate.bandwidth;

      this.config.data.frequency_unit = this.config.data.frequencyUnitTypeOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.frequency_unit_id);
      this.config.data.bandwidth_unit = this.config.data.frequencyUnitTypeOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.bandwidth_unit_id);
      if(this.config.data.observation){
        this.config.data.transmission_mode = this.config.data.transmissionOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.transmission_mode_id);
        this.config.data.polarization = this.config.data.polarizationOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.polarization_id); 
      }
    }else{
      this.idDummy = this.config.data.idDummy;
      this.id ="_"+this.idDummy++;
      if(this.config.data.observation)this.tittle="Add observation frequency";
      else this.tittle="Add telecommunication frequency";

    }
  }

  onOke(){

    if(this.validate()){
      var respons : ObservationPolarizationFrequencies ={
        id:this.id,
        instrument_id : this.config.data.instrument_id,
        use_of_frequency:this.config.data.use_of_frequency,
        frequency:this.config.data.frequency,
        frequency_unit_id:this.config.data.frequency_unit.value,
        bandwidth:this.config.data.bandwidth,
        bandwidth_unit_id:this.config.data.bandwidth!=null?this.config.data.bandwidth_unit.value:null,
  
        frequency_type_desc:this.config.data.frequencyTypes.find((o: { id: any; }) => o.id === this.config.data.use_of_frequency).name,
        frequency_unit_desc:this.config.data.frequency_unit.label,
        bandwidth_unit_desc:this.config.data.bandwidth!=null?this.config.data.bandwidth_unit.label:null,
      }
      if(this.config.data.observation){
        respons.transmission_mode_id = this.config.data.transmission_mode.value,
        respons.polarization_id = this.config.data.polarization.value
      }
      var resultData:any={};
      resultData.respons=respons;
      resultData.idDummy=this.idDummy;
      console.log(JSON.stringify(resultData))
      this.ref.close(resultData);
    } else{
      this._snackBar.open("Need Input Mandatory","Ok",{duration: 2500,
        verticalPosition: 'top', // 'top' | 'bottom'
        horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
        panelClass: ['white-snackbar'],
      });
    }  
  }

  validate():boolean{
    if(this.config.data.use_of_frequency==null)return false;
    if(this.config.data.frequency==null)return false;

    return true;
  }
  
}