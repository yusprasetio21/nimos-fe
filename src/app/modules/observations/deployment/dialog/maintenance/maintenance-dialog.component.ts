import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Tree } from 'primeng/tree';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
  
@Component({
  selector: 'app-example-dialog',
  templateUrl: 'maintenance-dialog.component.html',
  styleUrls: ['../../../observation.component.scss'],
})

export class MaintenanceDialogComponent extends MoreComponent implements OnInit {
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
  
  
  tittle:string;
  ngOnInit(): void {
    // console.log(JSON.stringify(this.data));

    if(this.config.data.action=="update"){
      this.tittle="Correct maintenance log entry";

      this.config.data.id = this.config.data.dataUpdate.id;
      this.config.data.maintenance_date = this.config.data.dataUpdate.maintenance_date;
      // this.config.data.maintenance_party = this.config.data.dataUpdate.maintenance_party;
      this.config.data.individual = this.config.data.dataUpdate.individual;
      this.config.data.description = this.config.data.dataUpdate.description;
      this.config.data.author = this.config.data.dataUpdate.author;
      this.config.data.documentation_url = this.config.data.dataUpdate.documentation_url;

      this.config.data.maintenance_date=new Date(this.config.data.dataUpdate.maintenance_date);
      this.config.data.maintenanceParty = this.config.data.maintenancePartyOption.find((o: { value: any; }) => o.value ===this.config.data.dataUpdate.maintenance_party);
    }else {
      this.tittle="Add maintenance log entry";
    }
  }

  onOke(){
    if(this.validate()){
      this.config.data.maintenance_party = this.config.data.maintenanceParty.value;
      delete this.config.data.maintenancePartyOption;
      delete this.config.data.dataUpdate;
      delete this.config.data.action;

      console.log(JSON.stringify(this.config.data));
      this.ref.close(this.config.data);
    }else{
      this._snackBar.open("Need Input Mandatory","Ok",{duration: 2500,
        verticalPosition: 'top', // 'top' | 'bottom'
        horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
        panelClass: ['white-snackbar'],
      });
    }
  }
  
  validate():boolean{
    if(this.config.data.maintenanceParty.value == null)return false;
    if(this.config.data.description == null) return false;
    if(this.config.data.maintenance_date == null) return false;

    return true;
  }
}