import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
  
@Component({
  selector: 'app-example-dialog',
  templateUrl: 'insert-observation-dialog.component.html',
})
export class InsertObservationDialogComponent implements OnInit {
  
  selectedValue: number;

  constructor(
    public dialogRef: MatDialogRef<InsertObservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    }
    
  ngOnInit(): void {
  }
  
  onClose(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    delete this.data.geomteryOptions;
    // console.log(JSON.stringify(this.data.treeId));
    this.dialogRef.close(this.data);
  }
  
}