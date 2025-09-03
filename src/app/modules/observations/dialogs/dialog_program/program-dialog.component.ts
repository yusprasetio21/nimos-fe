import { BaseComponent } from 'src/app/base.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Tree } from 'primeng/tree';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
  
@Component({
  selector: 'app-example-dialog',
  templateUrl: 'program-dialog.component.html',
  styleUrls: ['../../observation.component.scss'],
})

export class ProgramDialogComponent extends MoreComponent implements OnInit {
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

  state$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  unsubscribe: Subscription[] = [];

  displayedColumns: string[] = ['text','actions'];
  dataSource = new MatTableDataSource<any>();

  constructor(
    public dialogService: DialogService,
    public ref: DynamicDialogRef, 
    public config: DynamicDialogConfig,
    //more
    confirmationService: ConfirmationService,
    http: HttpClient,
    //base
    router: Router,
    messageService: MessageService,
    spinnerService: NgxSpinnerService) { 
      super(confirmationService, http, router, messageService, spinnerService);
    }
    
  programOption:SelectItem[] = [];
  ngOnInit(): void {
    this.programOption = this.config.data.programOption;
    if(this.config.data.programs!= null && this.config.data.programs!=undefined){
      this.dataSource.data = JSON.parse(JSON.stringify(this.config.data.programs));
      for(let program of this.dataSource.data){
        this.programOption.splice(this.programOption.findIndex(data=>data.value ===program.value),1); 
      }
    }
  }

  getData(node:any){
    // console.log(JSON.stringify(node));
    this.ref.close(node);
  }

  panelOpenState:boolean= false;
  addData(){
    this.panelOpenState =false;
    if(this.config.data.program.value != null){
      this.dataSource.data.push(this.config.data.program);
      this.programOption.splice(this.programOption.findIndex(data=>data.value ===this.config.data.program.value),1);
      this.config.data.program = {label:"- Program / Network Affiliation -" ,value:null};
      this.refreshDataSource(this.dataSource.data).subscribe((data: any[]) => {
        this.dataSource.data = data;
      });
    }
  }
  
  delete(element:any){
    this.panelOpenState =false;
    this.dataSource.data.splice(this.dataSource.data.findIndex(data=>data.value === element.value),1);
    this.programOption.push(element);
    this.refreshDataSource(this.dataSource.data).subscribe((data: any[]) => {
      this.dataSource.data = data;
    });
  }

  save(){
    delete this.config.data.programOption;
    delete this.config.data.program;
    
    this.config.data.programs = this.dataSource.data;
    this.ref.close(this.config.data);
  }
  
  refreshDataSource(datas:any[]): Observable<any[]> {
    let randomlyFilledList = datas;
    return of(randomlyFilledList);
  }
}