import { SelectItem } from 'primeng/api';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DeploymentAplicationArea } from '../../../model/deployment_aplication_area';
  
@Component({
  selector: 'aplication-area-dialog',
  templateUrl: 'aplication-area-dialog.component.html',
  styleUrls: ['../../../observation.component.scss'],
})

export class AplicationAreaDialogComponent implements OnInit {

  constructor(
    public ref: DynamicDialogRef, public config: DynamicDialogConfig) { }
    
  areasOption:SelectItem[] = [];
  id:number=0;
  ngOnInit(): void {
    this.areasOption = JSON.parse(JSON.stringify(this.config.data.aplicationAreaOption));
    if(this.config.data.dataAreas !=null && this.config.data.dataAreas.length > 0){
      for(let area of this.config.data.dataAreas){
        this.areasOption.splice(this.areasOption.findIndex(data=>data.value === area.application_area_id),1); 
      }
    }
    this.id = this.config.data.idDummy;
    this.id++;
  }

  onOke(){
    let result :DeploymentAplicationArea ={
      id:"_"+this.id,
      deployment_id:this.config.data.idDeployment,
      application_area_id:this.config.data.aplication_area.value,
      desc:this.config.data.aplication_area.label
    }
    let respons:any={
      idDummy:this.id,
      result:result
    }
    if(this.config.data.aplication_area.value!=null)this.ref.close(respons);
    else this.ref.close();
    
  }

  onClose(): void {
    
  }
  
}