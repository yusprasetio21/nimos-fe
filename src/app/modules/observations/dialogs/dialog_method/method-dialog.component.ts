import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
  
@Component({
  selector: 'app-example-dialog',
  templateUrl: 'method-dialog.component.html',
  styleUrls: ['../../observation.component.scss'],
})

export class MethodDialogComponent implements OnInit {
  
  selectedValue: number;

  private _transformer = (node: TreeModel, level: number) => {
    return {
      id:node.id,
      expandable: !!node.children && node.children.length > 0,
      text: node.text,
      level: level,
    };
  };

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  getLevel = (node: ExampleFlatNode) => node.level;

  treeControl = new FlatTreeControl<ExampleFlatNode>(node => node.level,node => node.expandable,);
  treeFlattener = new MatTreeFlattener(this._transformer,node => node.level,node => node.expandable,node => node.children,);

  dataSourceTree = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    public ref: DynamicDialogRef, public config: DynamicDialogConfig) { 
      this.dataSourceTree.data = this.config.data.treeMethod;
    }
    
  ngOnInit(): void {
    
  }

  getData(node:any){
    delete node.program;
    this.ref.close(node);
  }


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
    this.dataSourceTree.data = this.filterRecursive(filterText,this.config.data.treeMethod, 'text');
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