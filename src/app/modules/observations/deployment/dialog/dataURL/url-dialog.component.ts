import { Component, Inject, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
  
@Component({
  selector: 'url-dialog',
  templateUrl: 'url-dialog.component.html',
  styleUrls: ['../../../observation.component.scss'],
})

export class UrlDialogComponent implements OnInit {

  constructor(
    public ref: DynamicDialogRef, public config: DynamicDialogConfig) { }
    
  ngOnInit(): void {
  }
  
  onOke(){
    delete this.config.data.dataUpdate;
    this.ref.close(this.config.data.url);
  }
}