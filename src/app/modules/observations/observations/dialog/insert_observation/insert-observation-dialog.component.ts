import { FlatTreeControl } from '@angular/cdk/tree';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Tree } from 'primeng/tree';
import { BaseComponent } from 'src/app/base.component';
import { MoreComponent } from 'src/app/xapp/component/_more.component';
import { MethodDialogComponent } from '../../../dialogs/dialog_method/method-dialog.component';
import { ProgramDialogComponent } from '../../../dialogs/dialog_program/program-dialog.component';
import { Observation } from '../../../model/observation';
  
@Component({
  selector: 'form-observation-dialog',
  templateUrl: 'insert-observation-dialog.component.html',
  styleUrls: ['../../../observation.component.scss'],
})

export class InsertObservationDialogComponent extends MoreComponent implements OnInit {
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
  
  jsonRequest:Observation[]=[];
  
  geomteryOptions:SelectItem[]= [];

  constructor(
    public datepipe: DatePipe,
    private _snackBar: MatSnackBar,
    
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
    
  affiliationDialog(){
    let ref = this.dialogService.open(ProgramDialogComponent, {
      header: 'Management Program / Network Affiliation',
      width: '55%',
      data: {programOption:JSON.parse(JSON.stringify(this.config.data.programOption)),programs:this.config.data.programs},
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });

    ref.onClose.subscribe((respons) =>{
      if (respons?.programs) {
        this.config.data.programs = [];
        this.config.data.programs_text = "";
        for (let result of respons.programs) {
          this.controllDataAffliation(result.value);
        }
      }
    });
  }

  controllDataAffliation(id:number){
    // console.log(JSON.stringify(this.config.data.programOption));
    // console.log(id);
    var program = this.config.data.programOption.find((o: { value: any; }) => o.value === id);
    if(program!=undefined){
      this.config.data.programs.push(program);

      this.config.data.programs_text = this.config.data.programs_text.length>0?
      this.config.data.programs_text+", "+ program.label:program.label;
    }
  }

  isUpdate:boolean=false;
  ngOnInit(): void {
    this.config.data.programs = [];
    this.config.data.programs_text="";

    this.geomteryOptions = this.config.data.geomteryOptions;

    if(this.config.data.action=="insert"){
      this.config.data.observed_variable_id = this.config.data.node.id;
      this.config.data.variable = this.config.data.node.text;
    }else if(this.config.data.action=="update"){
      console.log(JSON.stringify(this.config.data.node));

      this.isUpdate=true;
      this.config.data.variable = this.config.data.node.variable;
      this.config.data.id = this.config.data.node.id;
      this.config.data.observed_variable_id = this.config.data.node.observed_variable_id;
      // this.config.data.program_id=this.config.data.node.program_id,
      // this.config.data.geometry_id = this.config.data.node.geometry_id;
      if(this.config.data.node.observed_since!=null && this.config.data.node.observed_since!=undefined)this.config.data.observed_since= new Date(this.config.data.node.observed_since);

      this.config.data.geometry = this.geomteryOptions.find((o: { value: any; }) => o.value === this.config.data.node.geometry_id);
      

      if(this.config.data.node.observing_method_id != null && this.config.data.node.observing_method_id!=undefined){
        let method :TreeModel|undefined = this.findNodeById(this.config.data.treeMethod,this.config.data.node.observing_method_id);
        if(method!=undefined)this.config.data.methodNode = JSON.parse(JSON.stringify(method));
      }
      for(let result of this.config.data.node.programs){
        this.controllDataAffliation(result.id);
      }
      
    }
    this.jsonRequest = this.config.data.dataSource;
  }

  clearData(){
    this.config.data.programs=[];

    this.config.data.programs_text = "";
    // this.config.data.programaNetwork="tetwe";
  }

  addMethod(){
    let ref = this.dialogService.open(MethodDialogComponent, {
      header: 'Management Method',
      width: '45%',
      height:'65%',
      data: {treeMethod:this.config.data.treeMethod},
      contentStyle: {"max-height": "500px", "overflow": "auto"},
      baseZIndex: 10000
    });

    ref.onClose.subscribe((respons) =>{
      // console.log(JSON.stringify(result))
      if(respons!=undefined)this.config.data.methodNode = respons;
    });   
  }
  
  onClose(): void {
    this.ref.close();
  }

  onSave(): void {
    if(this.validate()){
      if(this.validate2(this.config.data.action)){
        this.config.data.geometry_id = this.config.data.geometry.value;

        delete this.config.data.action;
        delete this.config.data.geomteryOptions;
        delete this.config.data.treeMethod;
        delete this.config.data.dataSource;
        delete this.config.data.node;
        delete this.config.data.programOption;

        delete this.config.data.geometry;
        // delete this.config.data.programs_text;
        // delete this.config.data.methodNode;

        // this.config.data.observed_since=this.datepipe.transform(Date.parse(this.config.data.observed_since), 'yyyy-MM-dd')
        // this.config.data.observed_since

        var result : Observation = {
          id:this.config.data.id,
          observed_variable_id:this.config.data.observed_variable_id,
          programs:this.config.data.programs,
          geometry_id:this.config.data.geometry_id,
          observed_since: this.config.data.observed_since instanceof Date ? this.config.data.observed_since : new Date(this._formatDMYtoYMD(this.config.data.observed_since)),
          observing_method_id:this.config.data.observing_method_id,

          methodNode:this.config.data.methodNode,
          variable:this.config.data.variable,
          programs_text:this.config.data.programs_text,
        }

        console.log(JSON.stringify(result));
        this.ref.close(result);
      }
    }
    else{ 
      if(this.config.data.observed_since != null && this.config.data.methodNode == null){
        this._snackBar.open("Need Input Observing Method","Ok",{duration: 2500,
          verticalPosition: 'top', // 'top' | 'bottom'
          horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
          panelClass: ['white-snackbar'],
        });
      }else if(this.config.data.observed_since == null && this.config.data.methodNode != null){
        this._snackBar.open("Need Input Observing Since","Ok",{duration: 2500,
          verticalPosition: 'top', // 'top' | 'bottom'
          horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
          panelClass: ['white-snackbar'],
        });
      } else{
        this._snackBar.open("Need Input Mandatory","Ok",{duration: 2500,
          verticalPosition: 'top', // 'top' | 'bottom'
          horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
          panelClass: ['white-snackbar'],
        });
      }
    };
  }

  validate(): boolean {
    if(this.config.data.geometry.value == null)return false;
    if(this.config.data.observed_variable_id == null) return false;
    // if(this.config.data.observedSince == null) return false;
    if(this.config.data.observed_since != null && this.config.data.methodNode == null) return false;
    if(this.config.data.observed_since == null && this.config.data.methodNode != null) return false;

    if(this.config.data.programs == null || this.config.data.programs.length<1)return false;
    return true;
  }

  validate2(action:string):boolean{
    var pathGeometry:string = this.config.data.observed_variable_id+"_"+this.config.data.geometry.value;
    if(action == "insert"){
      for(var request of this.jsonRequest){
        var reqPathGeometry:string = request.observed_variable_id+"_"+request.geometry_id;
        console.log(pathGeometry+"=="+reqPathGeometry)
        if(pathGeometry==reqPathGeometry){
          this._snackBar.open("Geometry And Path cant same on other data","Ok",{duration: 2500,
            verticalPosition: 'top', // 'top' | 'bottom'
            horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
            panelClass: ['white-snackbar'],
          });
          return false;
        }
      }
    }else if(action=="update"){
      var obsReq:Observation={
        id:this.config.data.id,//mandatory
        observed_variable_id:this.config.data.observed_variable_id,//mandatory
        programs:this.config.data.programs,//mandatory
        geometry_id:this.config.data.geometry_id,//mandatory
      }
      var requestDummy:Observation[] = JSON.parse(JSON.stringify(this.jsonRequest));
      requestDummy[requestDummy.findIndex(item=>item.id === this.config.data.id)]=obsReq;
      var count:number=0;
      for(var request of requestDummy){
        var reqPathGeometry:string = request.observed_variable_id+"_"+request.geometry_id;
        if(pathGeometry==reqPathGeometry){
          count++;
        }
      }
      if(count>1){
        this._snackBar.open("Geometry And Path cant same on other data","Ok",{duration: 2500,
          verticalPosition: 'top', // 'top' | 'bottom'
          horizontalPosition: 'end', //'start' | 'center' | 'end' | 'left' | 'right'
          panelClass: ['white-snackbar'],
        });
        return false;
      }
    }
    return true;
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
  
}


interface TreeModel {
  id:number;
  text: string;
  children?: TreeModel[];
}

interface ExampleFlatNode {
  id:number;
  expandable: boolean;
  text: string;
  level: number;
}