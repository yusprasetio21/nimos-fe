import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Tree } from 'primeng/tree';
import { DatePipe } from '@angular/common';
import { Coordinates } from '../../../model/coordinates';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
  
@Component({
  selector: 'app-example-dialog',
  templateUrl: 'coordinates-dialog.component.html',
  styleUrls: ['../../../observation.component.scss'],
})

export class CoordinatesDialogComponent extends MoreComponent implements OnInit {
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
  tittle :string;
  ngOnInit(): void {
    // console.log(JSON.stringify(this.config.data.dataUpdate));
    if(this.config.data.status=="update"){//CEK APAKAH DATA UPDATE KEKKIRIM
      this.tittle = "Correct coordinates"
      this.id = this.config.data.dataUpdate.id;
      this.config.data.id= this.config.data.dataUpdate.id;
      this.config.data.latitude=this.config.data.dataUpdate.latitude;
      this.config.data.longitude=this.config.data.dataUpdate.longitude;
      this.config.data.station_elevation=this.config.data.dataUpdate.station_elevation;
      // this.config.data.geopositioning_method_id=this.config.data.dataUpdate.geopositioning_method_id;
      this.config.data.from=new Date(this.config.data.dataUpdate.from);
      this.config.data.geopositioning_method = this.config.data.geopositioningOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.geopositioning_method_id);
    }
    else{ 
      // console.log(this.config.data.idDummy);
      this.idDummy = this.config.data.idDummy;
      this.id ="_"+this.idDummy++;
      this.tittle = "Add coordinates"
    }


  }

  onOke(){
    // console.log(JSON.stringify(this.data))
    if(this.validate()){
      var respons :Coordinates={
        id:this.id,
        instrument_id:this.config.data.instrumentId,
        latitude:this.config.data.latitude,
        longitude:this.config.data.longitude,
        station_elevation:this.config.data.station_elevation,
        geopositioning_method_id:this.config.data.geopositioning_method.value,
        from:this.config.data.from instanceof Date ? this.config.data.from : new Date(this._formatDMYtoYMD(this.config.data.from)),

        geopositioning_name:this.config.data.geopositioning_method.label
      }

      var resultData:any={};
      resultData.respons=respons;
      resultData.idDummy=this.idDummy;
      this.ref.close(resultData);
    }else{

      this._snackBar.open("Need Input Mandatory","Ok",{duration: 2500,
        verticalPosition: 'top', // 'top' | 'bottom'
        horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
        panelClass: ['white-snackbar'],
      });
    }    
  }

  validate():boolean{
    if(this.config.data.latitude==null)return false;
    if(this.config.data.longitude==null)return false;
    if(this.config.data.station_elevation==null)return false;
    if(this.config.data.geopositioning_method.value==null)return false;
    if(this.config.data.from==null)return false;

    if(this.config.data.latitude <  -90 || this.config.data.latitude > 90)return false
    if(this.config.data.longitude <  -180 || this.config.data.latitude > 180)return false

    return true;
  }

  getStationCoordinates(){
    var s:string|null=localStorage.getItem('station_coordinates');
    if(s!=null){
      var station :any = JSON.parse(s);
      this.config.data.latitude =station.latitude;
      this.config.data.longitude =station.longitude;
      this.config.data.from = new Date(station.from);
    }
  }
  
}