import { FlatTreeControl } from '@angular/cdk/tree';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Observable, of } from 'rxjs';
import { Observation } from '../../observations/model/observation';
import { InsertObservationDialogComponent } from '../insert_observation/insert-observation-dialog.component';
  
@Component({
  selector: 'app-example-dialog',
  templateUrl: 'data-observation-dialog.component.html',
  styleUrls: ['table-pagination-example.css'],
})
export class DataObservationDialogComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['path', 'variable', 'geometry','actions'];
  dataSource = new MatTableDataSource<Observation>();

  // @ViewChild(MatPaginator) paginator: MatPaginator;


  //Tree
  private _transformer = (node: ObservationMenu, level: number) => {
    return {
      id:node.id,
      expandable: !!node.children && node.children.length > 0,
      text: node.text,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(node => node.level,node => node.expandable,);
  treeFlattener = new MatTreeFlattener(this._transformer,node => node.level,node => node.expandable,node => node.children,);

  dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  path:string='';
  level:number;

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  getLevel = (node: ExampleFlatNode) => node.level;

  //Dialog
  tittle:string;
  variable:string;
  geometry:string;
  id_station:number;
  treeId:number;
  // jsonRequest:Observation[]=[];
  
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DataObservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.beforeClosed().subscribe(() => {
        console.log(JSON.stringify(this.dataSource.data));
        dialogRef.close(this.dataSource);
      });
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(InsertObservationDialogComponent, {
      width: '75%',
      data: {tittle:this.tittle,variable:this.variable,geometry:this.geometry,
        geomteryOptions:this.data.geomteryOptions,treeId:this.treeId}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if(result!== null)this.SaveJsonRequest(result);
    });
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.dataSource.data=this.data.dataSource;
    this.dataSourceTree.data = this.data.dataSourceTree;
  }

  insertData(data:any){
    this.todoLeafItemSelectionToggle(data);
    this.path=data.text+":"+this.path;
    this.tittle=data.text;
    this.treeId=data.id;
    this.variable=data.text;
    this.geometry='';
    this.openDialog();
  }

  updateData(data:any){
    this.path=data.path;
    this.tittle=data.path.split(":")[0];
    this.variable=data.variable;
    this.geometry=data.geometry;
    this.openDialog();
  }


  SaveJsonRequest(datas:any){
    let geometry = this.data.geomteryOptions.find((o: { value: any; }) => o.value === datas.geometryId);
    var request:Observation={
        id_station:this.id_station,
        id_tree:datas.treeId,
        path:this.path,
        variable:datas.variable,
        geometry: geometry.label,
        geometryId: datas.geometryId
    };
    for(var position:number=1;position<=this.dataSource.data.length;position++){
      if(this.dataSource.data[position-1].path==this.path){
        console.log("update");
        this.dataSource.data[position-1]=request;
        // this.jsonRequest[position-1]=request;
        position = this.dataSource.data.length+1;
      }else if(position==this.dataSource.data.length){
        console.log("insert");
        // this.jsonRequest[this.jsonRequest.length]=request;
        this.dataSource.data.push(request);
      }
    }
    this.refreshDataSource(this.dataSource.data).subscribe((data: Observation[]) => {
      this.dataSource.data = data;
    });
    
  }

  todoLeafItemSelectionToggle(node: ExampleFlatNode): void {
    this.level=node.level;
    this.checkAllParentsSelection(node);
  }

  checkAllParentsSelection(node: ExampleFlatNode): void {
      let parent: ExampleFlatNode | null = this.getParentNode(node);
      this.path=<string>parent?.text;
      while (parent) {
          parent = this.getParentNode(parent);
          if(parent!=null)this.path = this.path+":"+parent.text;
      }
  }

  getParentNode(node: ExampleFlatNode): ExampleFlatNode | null {
      const currentLevel = this.getLevel(node);
      if (currentLevel < 1) {
      return null;
      }
      const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
      for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
          return currentNode;
      }
      }
      return null;
  }

  refreshDataSource(datas:Observation[]): Observable<Observation[]> {
    let randomlyFilledList = datas;
    return of(randomlyFilledList);
  }

  onOke(): void {
    this.dialogRef.close();
  }
}


interface ObservationMenu {
  id:number;
  text: string;
  children?: ObservationMenu[];
}

interface ExampleFlatNode {
  id:number;
  expandable: boolean;
  text: string;
  level: number;
}