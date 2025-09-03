import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Tree } from 'primeng/tree';
import { InstrumentOperatingStatus } from '../../../model/instrument_operating_status';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
  
@Component({
  selector: 'app-example-dialog',
  templateUrl: 'status-dialog.component.html',
  styleUrls: ['../../../observation.component.scss'],
})

export class StatusDialogComponent extends MoreComponent implements OnInit {
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
    console.log(JSON.stringify(this.config.data.dataUpdate));
    if(this.config.data.status=="update"){
      this.tittle="Correct status";
      this.id = this.config.data.dataUpdate.id;
      this.config.data.id = this.config.data.dataUpdate.id;
      // this.config.data.instrument_operating_status_id = this.config.data.dataUpdate.instrument_operating_status_id;
      this.config.data.from=new Date(this.config.data.dataUpdate.from);
      this.config.data.to= this.config.data.dataUpdate.to!=null?new Date(this.config.data.dataUpdate.to):null;
      console.log(JSON.stringify(this.config.data.statusOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.instrument_operating_status_id)))
      this.config.data.instrument_operating_status = this.config.data.statusOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.instrument_operating_status_id);
    }
    else {
      console.log(this.config.data.idDummy);
      this.idDummy = this.config.data.idDummy;
      this.id ="_"+this.idDummy++;
      this.tittle="Add instrument operating status";
    }
  }

  onSave(){
    if(this.validate()){
      var status:InstrumentOperatingStatus={
        id:this.id,
        instrument_id: this.config.data.instrumentId,
        instrument_operating_status_id:this.config.data.instrument_operating_status.value,
        from: this.config.data.from instanceof Date ? this.config.data.from: new Date(this._formatDMYtoYMD(this.config.data.from)),
        to: this.config.data.to!=null?this.config.data.to instanceof Date ? this.config.data.to: new Date(this._formatDMYtoYMD(this.config.data.to)):null,
        operating_status_desc:this.config.data.instrument_operating_status.label
      }
      var respons:any={};
      respons.idDummy=this.idDummy;
      respons.respons=status;
      // console.log(JSON.stringify(respons))
      this.ref.close(respons);
    }else{
      if(this.config.data.to != null){
        var dateFrom = Date.parse(this.config.data.from);
        var dateTo = Date.parse(this.config.data.to);
  
        if(dateFrom > dateTo){
          this._snackBar.open("Calendar To must higher from calendar FROM","Ok",{duration: 2500,
            verticalPosition: 'top', // 'top' | 'bottom'
            horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
            panelClass: ['white-snackbar'],
          });
        };
      }else{
        this._snackBar.open("Need Input Mandatory","Ok",{duration: 2500,
          verticalPosition: 'top', // 'top' | 'bottom'
          horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
          panelClass: ['white-snackbar'],
        });
      }
    }    
  }

  validate():boolean{
    if(this.config.data.instrument_operating_status.value == null) return false;
    if(this.config.data.from == null) return false;
    if(this.config.data.to != null){
      var dateFrom = Date.parse(this.config.data.from);
      var dateTo = Date.parse(this.config.data.to);

      if(dateFrom > dateTo) return false;
    }
  

    return true;
  }
  
}