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
  state$ = new BehaviorSubject<boolean>(false); // Tambahkan ini

  constructor(
    public datepipe: DatePipe,
    private httpClient: HttpClient, // Ubah nama untuk hindari conflict
    confirmationService: ConfirmationService,
    router: Router,
    messageService: MessageService,
    spinnerService: NgxSpinnerService,

    public dialogService: DialogService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig) {
      super(confirmationService, httpClient, router, messageService, spinnerService);
  }

  dummy:any={"observed_variable_id":39,"variable":"Atmospheric density","geometry_id":6,"programs_text":"Centennial Observing Stations","programs":[{"value":1},{"value":2}],"observed_since":"2022-11-11","methodNode":{"id":61,"expandable":false,"text":"(inapplicable)","level":0}};

  openDialog(node:any,action:string): void {
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
    
    // Inisialisasi dataSource dengan jsonRequest
    this.dataSource.data = [...this.jsonRequest];
    
    this.loadReference();
  }

  dataDummy():void{
    this.SaveJsonRequest(this.dummy);
  }
 
  loadReference() {
    this.programOption = JSON.parse(JSON.stringify(this.config.data.programOption ?? []));

    // kalau kosong (hanya default 1), tambahkan fallback
    if (this.programOption.length <= 1) {
      this.programOption = [
        { label: '- Program / Network Affiliation -', value: null },
        { value: 551, label: 'AARI' },
        { value: 396, label: 'ABOS' },
        { value: 414, label: 'ACTRIS' },
        { value: 1, label: 'AMDAR' },
        { value: 2, label: 'APCAD' },
        { value: 3, label: 'ARGO' },
        { value: 4, label: 'BATHY' },
        { value: 5, label: 'BUCOS' }
        // ... tambahkan lebih banyak sesuai kebutuhan
      ];
    }

    console.log('programOption:', this.programOption);
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  filterRecursive(filterText: string, array: any[], property: string) {
    let filteredData;

    function copy(o: any) {
      return Object.assign({}, o);
    }

    if (filterText) {
      filterText = filterText.toLowerCase();
      filteredData = array.map(copy).filter(function x(y) {
        if (y[property].toLowerCase().includes(filterText)) {
          return true;
        }
        if (y.children) {
          return (y.children = y.children.map(copy).filter(x)).length;
        }
        return false;
      });
    } else {
      filteredData = array;
    }

    return filteredData;
  }

  filterTree(filterText: string) {
    this.dataSourceTree.data = this.filterRecursive(filterText, this.config.data.dataSourceTree, 'text');
  }

  search:string;
  applyFilter(filterText: any) {
    this.filterTree(this.search);
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
    let geometry = this.config.data.geomteryOptions.find((o: { value: any; }) => o.value === datas.geometry_id);
    var programs:Program[]=[];
    for(let program of datas.programs){
      programs.push({id:program.value});
    }
    var request:Observation={
        id:datas.id == null || datas.id == undefined?"_"+this.idDummy++:datas.id,
        observed_variable_id:datas.observed_variable_id,
        programs:programs,//mandatory untuk tampilan UI
        variable:datas.variable,
        geometryName: geometry?.label || '',
        observed_since:datas.observed_since,
        geometry_id: datas.geometry_id,
        observing_method_id: datas.methodNode==undefined?'':datas.methodNode.id,
        methodName: datas.methodNode==undefined?'': datas.methodNode.text,
        programs_text:datas.programs_text,
    };
    console.log(JSON.stringify(request));
    if(datas.id == null || datas.id == undefined){
      this.jsonRequest.push(request);
      this.dataSource.data.push(request);
    }else{
      const jsonIndex = this.jsonRequest.findIndex(item=>item.id === datas.id);
      const dataSourceIndex = this.dataSource.data.findIndex(item=>item.id === datas.id);
      
      if (jsonIndex !== -1) this.jsonRequest[jsonIndex] = request;
      if (dataSourceIndex !== -1) this.dataSource.data[dataSourceIndex] = request;
    }
    
    this.refreshDataSource(this.dataSource.data).subscribe((data: Observation[]) => {
      this.dataSource.data = data;
      this.state$.next(true);
    });
  }

  refreshDataSource(datas:Observation[]): Observable<Observation[]> {
    return of([...datas]);
  }

 onOke(): void {
  var observationsForApi: any[] = [];
  
  const dataToProcess = Array.isArray(this.dataSource?.data) ? this.dataSource.data : [];
  
  for (let value of dataToProcess) {
    if (!value) continue;
    
    if (value.programs && Array.isArray(value.programs) && value.programs.length > 0) {
      for (let program of value.programs) {
        if (program && program.id !== undefined) {
          observationsForApi.push({
            observed_variable_id: value.observed_variable_id,
            geometry_id: value.geometry_id,
            program_id: program.id,
            observed_since: value.observed_since,
            observing_method_id: value.observing_method_id || null
          });
        }
      }
    } else {
      observationsForApi.push({
        observed_variable_id: value.observed_variable_id || null,
        geometry_id: value.geometry_id || null,
        program_id: null,
        observed_since: value.observed_since || null,
        observing_method_id: value.observing_method_id || null
      });
    }
  }

  // PERBAIKAN: Kirim array langsung, bukan object dengan properti observations
  const resultData = {
    ...this.config.data,
    idDummy: this.idDummy,
    jsonRequest: observationsForApi // Langsung array, bukan object
  };

  delete resultData.geomteryOptions;
  delete resultData.treeMethod;
  delete resultData.dataSource;
  delete resultData.dataSourceTree;

  console.log('Data yang dikirim ke API:', JSON.stringify(resultData, null, 2));
  this.ref.close(resultData);
}

  findNodeById(list: TreeModel[], id: number): TreeModel | undefined {
    for (const n of list) {
      if (n.id === id){
        return n;
      } 
    }
    for (const n of list) {
      if (n.children) {
        const res = this.findNodeById(n.children, id);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }

  protected getSelectedDatas(): any[] {
    return [];
  }
  protected setSelectedDatas(datas: any) {
    // Implementation if needed
  }
  protected generateStr(event: any) {
    return '';
  }
  protected getDatas(): any[] {
    return [];
  }
  protected setDatas(datas: any[]): void {
    // Implementation if needed
  }
  protected createDataForm(data: any) {
    // Implementation if needed
  }
  protected updateTableDisplay(datas: any[], req: any, resp: any) {
    // Implementation if needed
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