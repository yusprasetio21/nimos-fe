import { FlatTreeControl } from '@angular/cdk/tree';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, Inject, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { TreeModel } from '../model/tree';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observation, Program } from '../model/observation';
import { InsertObservationDialogComponent } from './dialog/insert_observation/insert-observation-dialog.component';
  
@Component({
  selector: 'observation-dialog',
  templateUrl: 'data-observation-dialog.component.html',
  styleUrls: ['../observation.component.scss'],
})
export class DataObservationDialogComponent extends MoreComponent implements OnInit {
  private _transformer = (node: TreeModel, level: number) => {
    return {
      id:node.id,
      expandable: !!node.children && node.children.length > 0,
      text: node.text,
      level: level,
    };
  };


  treeControl = new FlatTreeControl<ExampleFlatNode>(node => node.level,node => node.expandable,);
  treeFlattener = new MatTreeFlattener(this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,);

  dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  dataSource=new MatTableDataSource<Observation>();
  jsonRequest:Observation[]=[];
  programOption:SelectItem[]=[];
  idDummy:number;
  http: any;

  constructor(
    public datepipe: DatePipe,
    http: HttpClient,
    confirmationService: ConfirmationService,
    router: Router,
    messageService: MessageService,
    spinnerService: NgxSpinnerService,

    public dialogService: DialogService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig) {
      super(confirmationService, http, router, messageService, spinnerService);
      // ref.beforeClosed().subscribe(() => {
      //   this.onOke();
      // });
  }

  dummy:any={"observed_variable_id":39,"variable":"Atmospheric density","geometry_id":6,"programs_text":"Centennial Observing Stations","programs":[{"value":1},{"value":2}],"observed_since":"2022-11-11","methodNode":{"id":61,"expandable":false,"text":"(inapplicable)","level":0}};

  openDialog(node:any,action:string): void {
    // let dialogRef = this.dialog.open(InsertObservationDialogComponent, {
    //   width: '75%',
    //   data: {dataSource:this.jsonRequest,node:node,action:action,geomteryOptions:this.config.data.geomteryOptions,
    //     treeMethod:this.config.data.treeMethod,programOption:this.programOption}
    // });
  
    let dialog = this.dialogService.open(InsertObservationDialogComponent, {
      header: 'Management Observation',
      width: '70%',
      contentStyle: {"max-height": "50%", "overflow": "auto"},
      baseZIndex: 10000,
      data: {dataSource:this.jsonRequest,node:node,action:action,geomteryOptions:this.config.data.geomteryOptions,
        treeMethod:this.config.data.treeMethod,programOption:this.programOption}
    });

    dialog.onClose.subscribe((result) =>{
      console.log(JSON.stringify(result));
      if(result!== null&&result!=undefined)this.SaveJsonRequest(result);
    });
  }

  ngOnInit(): void {
    console.log(JSON.stringify(this.config.data.dataSourceTree));
    this.dataSourceTree.data = this.config.data.dataSourceTree;
    this.jsonRequest = this.config.data.dataSource;
    this.idDummy = this.config.data.idDummy;
    // console.log(JSON.stringify(this.jsonRequest));
    this.loadReference();
  }

  dataDummy():void{
    this.SaveJsonRequest(this.dummy);
  }
 
  loadReference(){
    this.programOption = JSON.parse(JSON.stringify(this.config.data.programOption));
    console.log(JSON.stringify(this.programOption))
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  filterRecursive(filterText: string, array: any[], property: string) {
    let filteredData;

    //make a copy of the data so we don't mutate the original
    function copy(o: any) {
      return Object.assign({}, o);
    }

    // has string
    if (filterText) {
      // need the string to match the property value
      filterText = filterText.toLowerCase();
      // copy obj so we don't mutate it and filter
      filteredData = array.map(copy).filter(function x(y) {
        if (y[property].toLowerCase().includes(filterText)) {
          return true;
        }
        // if children match
        if (y.children) {
          return (y.children = y.children.map(copy).filter(x)).length;
        }
      });
      // no string, return whole array
    } else {
      filteredData = array;
    }

    return filteredData;
  }

  filterTree(filterText: string) {
    // use filter input text, return filtered TREE_DATA, use the 'name' object value
    // this.dataSourceTree.data = this.filterRecursive(filterText, TREE_DATA, 'name');
    this.dataSourceTree.data = this.filterRecursive(filterText, this.config.data.dataSourceTree, 'text');
  }

  search:string;
  applyFilter(filterText: any) {
    this.filterTree(this.search);
    // show / hide based on state of filter string
    if (filterText) {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
  }

  insertData(data:any){
    this.openDialog(data,"insert");
  }

  updateData(data:any){
    this.openDialog(data,"update");
  }

  deleteData(data:any){
    this.jsonRequest.splice(this.jsonRequest.findIndex(item=>item.id === data.id),1);
    this.dataSource.data.splice(this.dataSource.data.findIndex(item=>item.id === data.id),1);
    this.refreshDataSource(this.dataSource.data).subscribe((data: Observation[]) => {
      this.dataSource.data = data;
    });
  }
  
  SaveJsonRequest(datas:any){
    // console.log(JSON.stringify(datas));
    let geometry = this.config.data.geomteryOptions.find((o: { value: any; }) => o.value === datas.geometry_id);
    var programs:Program[]=[];
    for(let program of datas.programs){
      programs.push({id:program.value});
    }
    var request:Observation={
        id:datas.id == null || datas.id == undefined?"_"+this.idDummy++:datas.id,
        observed_variable_id:datas.observed_variable_id,
        programs:programs,//mandatory
        variable:datas.variable,
        geometryName: geometry.label,
        // observed_since: datas.observed_since instanceof Date ? datas.observed_since : new Date(this._formatDMYtoYMD(this.config.data.observed_since)),
        observed_since:datas.observed_since,
        geometry_id: datas.geometry_id,
        observing_method_id: datas.methodNode==undefined?'':datas.methodNode.id,
        methodName: datas.methodNode==undefined?'': datas.methodNode.text,
        programs_text:datas.programs_text,
    };
    console.log(JSON.stringify(request));
    if(datas.id == null || datas.id == undefined){
      //insert
      this.jsonRequest.push(request);
      this.dataSource.data.push(request);
    }else{
      //update
      this.jsonRequest[this.jsonRequest.findIndex(item=>item.id === datas.id)]=request;
      this.dataSource.data[this.dataSource.data.findIndex(item=>item.id === datas.id)]=request;
    }
    this.refreshDataSource(this.dataSource.data).subscribe((data: Observation[]) => {
      this.dataSource.data = data;
      this.state$.next(true);
    });
  }

  refreshDataSource(datas:Observation[]): Observable<Observation[]> {
    let randomlyFilledList = datas;
    return of(randomlyFilledList);
  }

  onOke(): void {
    // this.config.data.jsonRequest = this.dataSource.data;
    var observations:Observation[]=[]
    for(let value of this.dataSource.data){
      var obs:Observation={
          id:value.id,
          observed_variable_id:value.observed_variable_id,
          programs:value.programs,//mandatory
          observed_since:value.observed_since,
          geometry_id: value.geometry_id,
          observing_method_id: value.observing_method_id,
      };    
      observations.push(obs);
    }
    delete this.config.data.geomteryOptions;
    delete this.config.data.treeMethod;
    delete this.config.data.dataSource;
    delete this.config.data.dataSourceTree;
    this.config.data.idDummy = this.idDummy;
    this.config.data.jsonRequest = observations;

    console.log(JSON.stringify(this.config.data));
    this.ref.close(this.config.data);
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


interface FoodNode {
  name: string;
  children?: FoodNode[];
}

interface ExampleFlatNode {
  id:number;
  expandable: boolean;
  text: string;
  level: number;
}
