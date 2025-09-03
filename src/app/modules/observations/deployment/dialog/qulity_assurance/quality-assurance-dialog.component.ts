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
  templateUrl: 'quality-assurance-dialog.component.html',
  styleUrls: ['../../../observation.component.scss'],
})

export class QualityAssuranceDialogComponent extends MoreComponent implements OnInit {
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
    if(this.config.data.action=="update"){
      this.tittle="Correct quality assurance log entry"
      // console.log(JSON.stringify(this.config.data.dataUpdate));
      this.config.data.id = this.config.data.dataUpdate.id;
      // this.config.data.location_id = this.config.data.dataUpdate.location_id;
      // this.config.data.activity_date = this.config.data.dataUpdate.activity_date;
      // this.config.data.standard_type_id = this.config.data.dataUpdate.standard_type_id;
      // this.config.data.standart_type = this.config.data.dataUpdate.standart_type;
      this.config.data.standard_name = this.config.data.dataUpdate.standard_name;
      this.config.data.standard_serial_number = this.config.data.dataUpdate.standard_serial_number;
      // this.config.data.activity_result = this.config.data.dataUpdate.activity_result;
      this.config.data.documentation_url = this.config.data.dataUpdate.documentation_url;
      this.config.data.author = this.config.data.dataUpdate.author;

      this.config.data.activity_date=new Date(this.config.data.dataUpdate.activity_date);
      this.config.data.location = this.config.data.locationTypesOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.location_id);
      this.config.data.standard_type = this.config.data.standartTypeOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.standard_type_id);;
      this.config.data.activityResult = this.config.data.activityResultOption.find((o: { value: any; }) => o.value === this.config.data.dataUpdate.activity_result_id);;

    }else this.tittle="Add quality assurance log entry"
  }

  onOke(){
    if(this.validate()){
      this.config.data.location_id = this.config.data.location.value;
      this.config.data.standard_type_id = this.config.data.standard_type.value;
      this.config.data.activity_result_id = this.config.data.activityResult.value;
      delete this.config.data.dataUpdate;
      delete this.config.data.standartTypeOption;
      delete this.config.data.activityResultOption;
      delete this.config.data.action;
      delete this.config.data.locationTypesOption;
      
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
    if(this.config.data.location.value == null)return false;
    if(this.config.data.activity_date == null)return false;
    if(this.config.data.standard_type.value == null)return false;


    return true;
  }

  onClose(): void {
    this.ref.close();
  }
  
}